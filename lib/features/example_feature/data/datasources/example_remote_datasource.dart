abstract class ExampleRemoteDataSource {
  Future<Map<String, dynamic>> fetchExample();
}

class ExampleRemoteDataSourceImpl implements ExampleRemoteDataSource {
  @override
  Future<Map<String, dynamic>> fetchExample() async {
    // TODO: Replace with the real remote API request.
    return <String, dynamic>{
      'id': 'example-id',
      'title': 'Example',
    };
  }
}
