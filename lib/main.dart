import 'package:flutter/material.dart';

import 'features/example_feature/data/datasources/example_remote_datasource.dart';
import 'features/example_feature/data/repositories/example_repository_impl.dart';
import 'features/example_feature/domain/usecases/get_example.dart';
import 'features/example_feature/presentation/bloc/example_bloc.dart';
import 'features/example_feature/presentation/pages/example_page.dart';

void main() {
  final remoteDataSource = ExampleRemoteDataSourceImpl();
  final repository = ExampleRepositoryImpl(remoteDataSource);
  final getExample = GetExample(repository);
  final bloc = ExampleBloc(getExample);

  runApp(ExampleApp(bloc: bloc));
}

class ExampleApp extends StatelessWidget {
  const ExampleApp({
    required this.bloc,
    super.key,
  });

  final ExampleBloc bloc;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Example Feature',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: ExamplePage(bloc: bloc),
    );
  }
}
