import '../../domain/entities/example_entity.dart';
import '../../domain/repositories/example_repository.dart';
import '../datasources/example_remote_datasource.dart';
import '../models/example_model.dart';

class ExampleRepositoryImpl implements ExampleRepository {
  ExampleRepositoryImpl(this.remoteDataSource);

  final ExampleRemoteDataSource remoteDataSource;

  @override
  Future<ExampleEntity> getExample() async {
    final response = await remoteDataSource.fetchExample();
    return ExampleModel.fromJson(response);
  }
}
