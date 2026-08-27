import 'package:flutter/material.dart';

import '../widgets/example_widget.dart';

class ExamplePage extends StatelessWidget {
  const ExamplePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Example Feature'),
      ),
      body: const Center(
        child: ExampleWidget(),
      ),
    );
  }
}
