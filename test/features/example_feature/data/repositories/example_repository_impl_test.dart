import 'package:flutter_test/flutter_test.dart';

import 'package:example_feature_app/features/example_feature/data/datasources/example_remote_datasource.dart';
import 'package:example_feature_app/features/example_feature/data/repositories/example_repository_impl.dart';

class _FakeRemoteDataSource implements ExampleRemoteDataSource {
  _FakeRemoteDataSource({this.response, this.error});

  final Map<String, dynamic>? response;
  final Object? error;

  @override
  Future<Map<String, dynamic>> fetchExample() async {
    if (error != null) {
      throw error!;
    }
    return response!;
  }
}

void main() {
  group('ExampleRepositoryImpl', () {
    test('transforme la réponse distante en entité', () async {
      final repository = ExampleRepositoryImpl(
        _FakeRemoteDataSource(
          response: <String, dynamic>{'id': 1, 'title': 'Example'},
        ),
      );

      final result = await repository.getExample();

      expect(result.id, '1');
      expect(result.title, 'Example');
    });

    test('propage les erreurs de la datasource', () async {
      final repository = ExampleRepositoryImpl(
        _FakeRemoteDataSource(error: StateError('network failure')),
      );

      expect(repository.getExample(), throwsA(isA<StateError>()));
    });
  });
}
