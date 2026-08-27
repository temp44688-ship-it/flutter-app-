import 'package:equatable/equatable.dart';

abstract class ExampleEvent extends Equatable {
  const ExampleEvent();

  @override
  List<Object?> get props => [];
}

class ExampleLoadRequested extends ExampleEvent {
  const ExampleLoadRequested(this.id);

  final String id;

  @override
  List<Object?> get props => [id];
}
