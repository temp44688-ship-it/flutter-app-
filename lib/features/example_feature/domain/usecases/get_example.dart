import '../entities/example_entity.dart';
import '../repositories/example_repository.dart';

class GetExample {
  GetExample(this.repository);

  final ExampleRepository repository;

  Future<ExampleEntity> call() {
    return repository.getExample();
  }
}
