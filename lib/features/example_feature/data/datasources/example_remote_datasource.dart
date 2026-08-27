import 'package:flutter_app/features/example_feature/domain/entities/example_entity.dart';

/// Data transfer object for Example.
///
/// Used to parse JSON from the API and convert to/from [ExampleEntity].
class ExampleModel extends ExampleEntity {
  const ExampleModel({
    required super.id,
    required super.title,
    super.description,
  });

  factory ExampleModel.fromJson(Map<String, dynamic> json) {
    return ExampleModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
    };
  }

  /// Convert model to domain entity.
  ExampleEntity toEntity() {
    return ExampleEntity(
      id: id,
      title: title,
      description: description,
    );
  }

  /// Create model from domain entity.
  factory ExampleModel.fromEntity(ExampleEntity entity) {
    return ExampleModel(
      id: entity.id,
      title: entity.title,
      description: entity.description,
    );
  }
}
