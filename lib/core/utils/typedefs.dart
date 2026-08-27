import 'package:dartz/dartz.dart';

import '../errors/failures.dart';

typedef AsyncResult<T> = Future<Either<Failure, T>>;
