import 'package:flutter/material.dart';

import '../bloc/example_bloc.dart';
import '../bloc/example_event.dart';
import '../widgets/example_widget.dart';

class ExamplePage extends StatefulWidget {
  const ExamplePage({
    required this.bloc,
    super.key,
  });

  final ExampleBloc bloc;

  @override
  State<ExamplePage> createState() => _ExamplePageState();
}

class _ExamplePageState extends State<ExamplePage> {
  @override
  void initState() {
    super.initState();
    widget.bloc.add(const GetExampleRequested());
  }

  @override
  void dispose() {
    widget.bloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Example Feature'),
      ),
      body: Center(
        child: ExampleWidget(bloc: widget.bloc),
      ),
    );
  }
}
