import 'package:flutter_app/core/usecases/usecase.dart';
import 'package:flutter_app/core/utils/typedefs.dart';

import '../entities/example_entity.dart';
import '../repositories/example_repository.dart';

class GetExampleById extends UseCase<ExampleEntity, GetExampleParams> {
  const GetExampleById(this._repository);

  final ExampleRepository _repository;

  @override
  AsyncResult<ExampleEntity> call(GetExampleParams params) {
    return _repository.getExampleById(params.id);
  }
}

class GetExampleParams {
  const GetExampleParams({required this.id});

  final String id;
}

/// Use case historique conservé pour le flux sans paramètre de l’application.
class GetExample {
  const GetExample(this._repository);

  final ExampleRepository _repository;

  Future<ExampleEntity> call() {
    return _repository.getExample();
  }
}
