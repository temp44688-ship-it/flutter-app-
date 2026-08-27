import '../../domain/entities/example_entity.dart';

class ExampleModel extends ExampleEntity {
  const ExampleModel({
    required super.id,
    required super.title,
  });

  factory ExampleModel.fromJson(Map<String, dynamic> json) {
    final rawId = json['id'];
    final rawTitle = json['title'];

    if (rawId == null || rawTitle is! String) {
      throw const FormatException(
        'Les champs id et title sont requis dans la réponse distante.',
      );
    }

    return ExampleModel(
      id: rawId.toString(),
      title: rawTitle,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'title': title,
    };
  }
}
