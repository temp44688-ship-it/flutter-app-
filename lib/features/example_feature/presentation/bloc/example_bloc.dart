import 'dart:async';

import '../../domain/usecases/get_example.dart';
import 'example_event.dart';
import 'example_state.dart';

class ExampleBloc {
  ExampleBloc(this.getExample);

  final GetExample getExample;
  final StreamController<ExampleState> _stateController =
      StreamController<ExampleState>.broadcast();

  ExampleState _state = const ExampleInitial();

  ExampleState get state => _state;
  Stream<ExampleState> get stream => _stateController.stream;

  Future<void> add(ExampleEvent event) async {
    if (event is! GetExampleRequested) {
      return;
    }

    _emit(const ExampleLoading());
    try {
      final example = await getExample();
      _emit(ExampleLoaded(example));
    } catch (error) {
      _emit(ExampleError(_messageFrom(error)));
    }
  }

  Future<void> close() async {
    await _stateController.close();
  }

  void _emit(ExampleState nextState) {
    if (_stateController.isClosed) {
      return;
    }

    _state = nextState;
    _stateController.add(nextState);
  }

  String _messageFrom(Object error) {
    final message = error.toString().replaceFirst('Exception: ', '');
    return message.isEmpty ? 'Une erreur inconnue est survenue.' : message;
  }
}
