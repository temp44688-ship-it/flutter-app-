import '../entities/example_entity.dart';
import '../repositories/example_repository.dart';

class GetExample {
  const GetExample(this.repository);

  final ExampleRepository repository;

  Future<ExampleEntity> call() async {
    return repository.getExample();
  }
}
