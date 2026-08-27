import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_app/features/example_feature/domain/usecases/get_example.dart';
import 'package:flutter_app/features/example_feature/presentation/bloc/example_event.dart';
import 'package:flutter_app/features/example_feature/presentation/bloc/example_state.dart';

class ExampleBloc extends Bloc<ExampleEvent, ExampleState> {
  ExampleBloc(this._getExampleById) : super(const ExampleInitial()) {
    on<ExampleLoadRequested>(_onLoadRequested);
  }

  final GetExampleById _getExampleById;

  Future<void> _onLoadRequested(
    ExampleLoadRequested event,
    Emitter<ExampleState> emit,
  ) async {
    emit(const ExampleLoading());

    final result = await _getExampleById(GetExampleParams(id: event.id));

    result.fold(
      (failure) => emit(ExampleError(failure.message)),
      (example) => emit(ExampleLoaded(example)),
    );
  }
}
