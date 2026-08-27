import 'package:dartz/dartz.dart';
import 'package:flutter_app/core/errors/exceptions.dart';
import 'package:flutter_app/core/errors/failures.dart';
import 'package:flutter_app/core/utils/typedefs.dart';
import 'package:flutter_app/features/example_feature/data/datasources/example_remote_datasource.dart';
import 'package:flutter_app/features/example_feature/domain/entities/example_entity.dart';
import 'package:flutter_app/features/example_feature/domain/repositories/example_repository.dart';

/// Concrete repository implementation.
///
/// Catches [AppException]s from data sources and maps them to [Failure]s.
class ExampleRepositoryImpl implements ExampleRepository {
  const ExampleRepositoryImpl(this._remoteDataSource);

  final ExampleRemoteDataSource _remoteDataSource;

  @override
  AsyncResult<ExampleEntity> getExampleById(String id) async {
    try {
      final model = await _remoteDataSource.getExampleById(id);
      return Right(model.toEntity());
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, code: e.code));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message, code: e.code));
    } catch (e) {
      return Left(UnknownFailure(message: e.toString()));
    }
  }

  @override
  AsyncResult<List<ExampleEntity>> getAllExamples() async {
    try {
      final models = await _remoteDataSource.getAllExamples();
      return Right(models.map((m) => m.toEntity()).toList());
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, code: e.code));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message, code: e.code));
    } catch (e) {
      return Left(UnknownFailure(message: e.toString()));
    }
  }
}
