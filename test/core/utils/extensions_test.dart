import 'package:flutter_test/flutter_test.dart';

import 'package:example_feature_app/core/utils/extensions.dart';

void main() {
  group('StringExtensions', () {
    test('détecte les chaînes non vides après trim', () {
      expect('Flutter'.isNotBlank, isTrue);
      expect('   '.isNotBlank, isFalse);
    });

    test('capitalise une chaîne trimée', () {
      expect(' flutter'.capitalize, 'Flutter');
      expect(''.capitalize, isEmpty);
    });
  });
}
