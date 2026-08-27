import 'package:flutter_test/flutter_test.dart';

import 'package:example_feature_app/features/example_feature/domain/entities/example_entity.dart';
import 'package:example_feature_app/features/example_feature/domain/repositories/example_repository.dart';
import 'package:example_feature_app/features/example_feature/domain/usecases/get_example.dart';
import 'package:example_feature_app/features/example_feature/presentation/bloc/example_bloc.dart';
import 'package:example_feature_app/features/example_feature/presentation/bloc/example_event.dart';
import 'package:example_feature_app/features/example_feature/presentation/bloc/example_state.dart';

class _SuccessRepository implements ExampleRepository {
  @override
  Future<ExampleEntity> getExample() async {
    return const ExampleEntity(id: '1', title: 'Example');
  }
}

class _FailureRepository implements ExampleRepository {
  @override
  Future<ExampleEntity> getExample() async {
    throw StateError('network failure');
  }
}

void main() {
  test('émet loading puis loaded lorsque le use case réussit', () async {
    final bloc = ExampleBloc(GetExample(_SuccessRepository()));
    final states = <ExampleState>[];
    final subscription = bloc.stream.listen(states.add);

    await bloc.add(const GetExampleRequested());
    await Future<void>.delayed(Duration.zero);

    expect(states, hasLength(2));
    expect(states[0], isA<ExampleLoading>());
    expect(states[1], isA<ExampleLoaded>());
    expect((states[1] as ExampleLoaded).example.title, 'Example');

    await subscription.cancel();
    await bloc.close();
  });

  test('émet loading puis error lorsque le use case échoue', () async {
    final bloc = ExampleBloc(GetExample(_FailureRepository()));
    final states = <ExampleState>[];
    final subscription = bloc.stream.listen(states.add);

    await bloc.add(const GetExampleRequested());
    await Future<void>.delayed(Duration.zero);

    expect(states, hasLength(2));
    expect(states[0], isA<ExampleLoading>());
    expect(states[1], isA<ExampleError>());
    expect((states[1] as ExampleError).message, contains('network failure'));

    await subscription.cancel();
    await bloc.close();
  });
}
