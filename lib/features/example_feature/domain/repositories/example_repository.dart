import 'package:flutter_app/core/utils/typedefs.dart';
import 'package:flutter_app/features/example_feature/domain/entities/example_entity.dart';

/// Repository contract for Example operations.
///
/// Lives in the Domain layer. The Data layer provides the implementation.
abstract class ExampleRepository {
  /// Fetches a single example by ID.
  AsyncResult<ExampleEntity> getExampleById(String id);

  /// Fetches all examples.
  AsyncResult<List<ExampleEntity>> getAllExamples();
}
