import 'package:flutter/material.dart';

import '../bloc/example_bloc.dart';
import '../bloc/example_event.dart';
import '../bloc/example_state.dart';

class ExampleWidget extends StatelessWidget {
  const ExampleWidget({
    required this.bloc,
    super.key,
  });

  final ExampleBloc bloc;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<ExampleState>(
      initialData: bloc.state,
      stream: bloc.stream,
      builder: (context, snapshot) {
        final state = snapshot.data ?? bloc.state;

        return switch (state) {
          ExampleInitial() || ExampleLoading() => const CircularProgressIndicator(),
          ExampleLoaded(:final example) => _LoadedExample(
              id: example.id,
              title: example.title,
            ),
          ExampleError(:final message) => _ErrorView(
              message: message,
              onRetry: () => bloc.add(const GetExampleRequested()),
            ),
        };
      },
    );
  }
}

class _LoadedExample extends StatelessWidget {
  const _LoadedExample({
    required this.id,
    required this.title,
  });

  final String id;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(24),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text('Identifiant : $id'),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          const Icon(Icons.error_outline, size: 48),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onRetry,
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}
