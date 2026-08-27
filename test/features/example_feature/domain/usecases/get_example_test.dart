import 'package:dartz/dartz.dart';
import 'package:flutter_app/core/errors/failures.dart';
import 'package:flutter_app/features/example_feature/domain/entities/example_entity.dart';
import 'package:flutter_app/features/example_feature/domain/repositories/example_repository.dart';
import 'package:flutter_app/features/example_feature/domain/usecases/get_example.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'get_example_test.mocks.dart';

@GenerateNiceMocks([MockSpec<ExampleRepository>()])
void main() {
  late GetExampleById usecase;
  late MockExampleRepository mockRepository;

  setUp(() {
    mockRepository = MockExampleRepository();
    usecase = GetExampleById(mockRepository);
  });

  const tId = '1';
  const tExample = ExampleEntity(id: tId, title: 'Test');
  const tParams = GetExampleParams(id: tId);

  test('should get example from the repository', () async {
    // arrange
    when(mockRepository.getExampleById(any))
        .thenAnswer((_) async => const Right(tExample));

    // act
    final result = await usecase(tParams);

    // assert
    expect(result, const Right(tExample));
    verify(mockRepository.getExampleById(tId));
    verifyNoMoreInteractions(mockRepository);
  });

  test('should return failure when repository fails', () async {
    // arrange
    when(mockRepository.getExampleById(any)).thenAnswer(
      (_) async => const Left(ServerFailure(message: 'Server error')),
    );

    // act
    final result = await usecase(tParams);

    // assert
    expect(result, isA<Left<Failure, ExampleEntity>>());
    verify(mockRepository.getExampleById(tId));
    verifyNoMoreInteractions(mockRepository);
  });
}
