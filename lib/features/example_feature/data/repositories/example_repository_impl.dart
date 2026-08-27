import 'package:dartz/dartz.dart';
import 'package:flutter_app/core/errors/failures.dart';
import 'package:flutter_app/core/utils/typedefs.dart';

import '../../domain/entities/example_entity.dart';
import '../../domain/repositories/example_repository.dart';
import '../datasources/example_remote_datasource.dart';
import '../models/example_model.dart';

class ExampleRepositoryImpl implements ExampleRepository {
  const ExampleRepositoryImpl(this.remoteDataSource);

  final ExampleRemoteDataSource remoteDataSource;

  @override
  Future<ExampleEntity> getExample() async {
    final response = await remoteDataSource.fetchExample();
    return ExampleModel.fromJson(response);
  }

  @override
  AsyncResult<ExampleEntity> getExampleById(String id) async {
    try {
      final response = await remoteDataSource.fetchExampleById(id);
      return Right(ExampleModel.fromJson(response));
    } on ExampleRemoteDataSourceException catch (error) {
      return Left(NetworkFailure(message: error.message));
    } on FormatException catch (error) {
      return Left(UnknownFailure(message: error.message));
    } catch (error) {
      return Left(UnknownFailure(message: error.toString()));
    }
  }
}
