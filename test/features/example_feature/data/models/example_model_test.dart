import 'package:flutter_test/flutter_test.dart';

import 'package:example_feature_app/features/example_feature/data/models/example_model.dart';

void main() {
  group('ExampleModel', () {
    test('parse un JSON avec un identifiant numérique', () {
      final model = ExampleModel.fromJson(<String, dynamic>{
        'id': 1,
        'title': 'delectus aut autem',
      });

      expect(model.id, '1');
      expect(model.title, 'delectus aut autem');
    });

    test('sérialise les données vers JSON', () {
      const model = ExampleModel(id: '1', title: 'Example');

      expect(model.toJson(), <String, dynamic>{
        'id': '1',
        'title': 'Example',
      });
    });

    test('rejette les champs obligatoires absents', () {
      expect(
        () => ExampleModel.fromJson(<String, dynamic>{'id': 1}),
        throwsA(isA<FormatException>()),
      );
    });
  });
}
