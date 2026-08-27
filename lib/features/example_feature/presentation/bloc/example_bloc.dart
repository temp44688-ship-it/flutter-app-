import '../../domain/usecases/get_example.dart';
import 'example_event.dart';
import 'example_state.dart';

class ExampleBloc {
  ExampleBloc(this.getExample);

  final GetExample getExample;
  ExampleState state = const ExampleInitial();

  Future<void> add(ExampleEvent event) async {
    if (event is! GetExampleRequested) {
      return;
    }

    state = const ExampleLoading();
    try {
      state = ExampleLoaded(await getExample());
    } catch (error) {
      state = ExampleError(error.toString());
    }
  }
}
