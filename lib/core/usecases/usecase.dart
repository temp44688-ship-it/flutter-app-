import '../utils/typedefs.dart';

abstract class UseCase<Type, Params> {
  const UseCase();

  AsyncResult<Type> call(Params params);
}
