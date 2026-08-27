import 'package:flutter_test/flutter_test.dart';

import 'package:example_feature_app/features/example_feature/domain/entities/example_entity.dart';
import 'package:example_feature_app/features/example_feature/domain/repositories/example_repository.dart';
import 'package:example_feature_app/features/example_feature/domain/usecases/get_example.dart';

class _FakeExampleRepository implements ExampleRepository {
  _FakeExampleRepository(this.example);

  final ExampleEntity example;

  @override
  Future<ExampleEntity> getExample() async => example;
}

void main() {
  test('GetExample retourne l’entité fournie par le repository', () async {
    const expected = ExampleEntity(id: '1', title: 'Example');
    final useCase = GetExample(_FakeExampleRepository(expected));

    final result = await useCase();

    expect(result, same(expected));
  });
}
