import '../../domain/entities/example_entity.dart';

sealed class ExampleState {
  const ExampleState();
}

class ExampleInitial extends ExampleState {
  const ExampleInitial();
}

class ExampleLoading extends ExampleState {
  const ExampleLoading();
}

class ExampleLoaded extends ExampleState {
  const ExampleLoaded(this.example);

  final ExampleEntity example;
}

class ExampleError extends ExampleState {
  const ExampleError(this.message);

  final String message;
}
