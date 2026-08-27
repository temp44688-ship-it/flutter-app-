import 'dart:convert';

import 'package:http/http.dart' as http;

abstract class ExampleRemoteDataSource {
  Future<Map<String, dynamic>> fetchExample();

  Future<Map<String, dynamic>> fetchExampleById(String id) {
    return fetchExample();
  }
}

class ExampleRemoteDataSourceImpl implements ExampleRemoteDataSource {
  ExampleRemoteDataSourceImpl({
    http.Client? client,
    Uri? baseEndpoint,
  })  : _client = client ?? http.Client(),
        _baseEndpoint = baseEndpoint ??
            Uri.parse('https://jsonplaceholder.typicode.com/todos/');

  final http.Client _client;
  final Uri _baseEndpoint;

  @override
  Future<Map<String, dynamic>> fetchExample() {
    return fetchExampleById('1');
  }

  @override
  Future<Map<String, dynamic>> fetchExampleById(String id) async {
    final endpoint = _baseEndpoint.resolve(id);
    final response = await _client.get(endpoint).timeout(
          const Duration(seconds: 10),
        );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ExampleRemoteDataSourceException(
        'La requête a échoué avec le statut HTTP ${response.statusCode}.',
      );
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const ExampleRemoteDataSourceException(
        'La réponse distante n’a pas le format JSON attendu.',
      );
    }

    return decoded;
  }
}

class ExampleRemoteDataSourceException implements Exception {
  const ExampleRemoteDataSourceException(this.message);

  final String message;

  @override
  String toString() => message;
}
