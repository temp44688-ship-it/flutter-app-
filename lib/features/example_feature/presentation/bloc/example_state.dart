import 'package:equatable/equatable.dart';
import 'package:flutter_app/features/example_feature/domain/entities/example_entity.dart';

abstract class ExampleState extends Equatable {
  const ExampleState();

  @override
  List<Object?> get props => [];
}

class ExampleInitial extends ExampleState {}

class ExampleLoading extends ExampleState {}

class ExampleLoaded extends ExampleState {
  const ExampleLoaded(this.example);

  final ExampleEntity example;

  @override
  List<Object?> get props => [example];
}

class ExampleError extends ExampleState {
  const ExampleError(this.message);

  final String message;

  @override
  List<Object?> get props => [message];
}
