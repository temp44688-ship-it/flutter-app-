import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_app/features/example_feature/presentation/bloc/example_bloc.dart';
import 'package:flutter_app/features/example_feature/presentation/bloc/example_event.dart';
import 'package:flutter_app/features/example_feature/presentation/bloc/example_state.dart';

class ExamplePage extends StatelessWidget {
  const ExamplePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Example')),
      body: BlocBuilder<ExampleBloc, ExampleState>(
        builder: (context, state) {
          return switch (state) {
            ExampleInitial() => const Center(child: Text('Press button to load')),
            ExampleLoading() => const Center(child: CircularProgressIndicator()),
            ExampleLoaded(:final example) => Center(child: Text(example.title)),
            ExampleError(:final message) => Center(child: Text('Error: $message')),
          };
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<ExampleBloc>().add(const ExampleLoadRequested('1'));
        },
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
