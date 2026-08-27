# Flutter Clean Architecture

This project is organized around **Clean Architecture** and a feature-first directory structure.

## Project Structure

```text
lib/
├── core/                         # Shared across all features
│   ├── errors/                   # Failures (domain) & Exceptions (data)
│   ├── usecases/                 # Base UseCase abstraction
│   └── utils/                    # Typedefs, constants, extensions
├── features/                     # One folder per feature
│   └── example_feature/
│       ├── data/                 # DTOs, DataSources, RepositoryImpl
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/               # Entities, Repository interfaces, UseCases
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/         # BLoC, Pages, Widgets
│           ├── bloc/
│           ├── pages/
│           └── widgets/
└── main.dart
```

## Dependency Rule

The **Domain** layer knows nothing about frameworks or infrastructure. **Use cases** depend on the Domain layer, **Data** depends on Domain and the use-case contracts, and **Presentation** depends on Domain and Use Cases. Dependencies must point inward toward the Domain layer; the Domain layer must remain framework-agnostic.

## Getting Started

```bash
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
flutter run
```

## Testing

```bash
flutter test
```

## Code Generation

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## Dependencies

| Package | Purpose |
|---|---|
| `flutter_bloc` | State management |
| `get_it` + `injectable` | Dependency injection |
| `dartz` | Functional programming with `Either` |
| `dio` | HTTP client |
| `go_router` | Navigation |
| `freezed` | Immutable data classes |
| `equatable` | Value equality |

The example feature currently uses a real HTTP request to JSONPlaceholder and includes unit tests for the core utility, model, repository, use case and BLoC layers.
