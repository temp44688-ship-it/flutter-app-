import 'package:equatable/equatable.dart';

/// Domain entity representing an Example.
///
/// This is the pure business object, framework-agnostic.
class ExampleEntity extends Equatable {
  const ExampleEntity({
    required this.id,
    required this.title,
    this.description,
  });

  final String id;
  final String title;
  final String? description;

  @override
  List<Object?> get props => [id, title, description];
}
