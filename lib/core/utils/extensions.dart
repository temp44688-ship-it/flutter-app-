/// String extensions.
extension StringX on String {
  bool get isNullOrEmpty => isEmpty;
  bool get isNotNullOrEmpty => isNotEmpty;
}

/// Object extensions.
extension ObjectX on Object? {
  bool get isNull => this == null;
  bool get isNotNull => this != null;
}

