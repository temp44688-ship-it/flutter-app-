import 'package:flutter_app/core/errors/failures.dart';
import 'package:flutter_app/core/usecases/usecase.dart';
import 'package:flutter_app/core/utils/typedefs.dart';
import 'package:flutter_app/features/example_feature/domain/entities/example_entity.dart';
import 'package:flutter_app/features/example_feature/domain/repositories/example_repository.dart';

/// Use case: Get a single Example by ID.
class GetExampleById extends UseCase<ExampleEntity, GetExampleParams> {
  const GetExampleById(this._repository);

  final ExampleRepository _repository;

  @override
  AsyncResult<ExampleEntity> call(GetExampleParams params) {
    return _repository.getExampleById(params.id);
  }
}

/// Parameters for [GetExampleById].
class GetExampleParams {
  const GetExampleParams({required this.id});

  final String id;
}
