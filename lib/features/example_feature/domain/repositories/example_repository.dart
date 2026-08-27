import 'package:flutter_app/core/utils/typedefs.dart';

import '../entities/example_entity.dart';

abstract class ExampleRepository {
  Future<ExampleEntity> getExample();

  AsyncResult<ExampleEntity> getExampleById(String id);
}
