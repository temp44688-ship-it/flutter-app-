extension StringExtensions on String {
  bool get isNotBlank => trim().isNotEmpty;

  String get capitalize {
    final value = trim();
    if (value.isEmpty) {
      return value;
    }

    return '${value[0].toUpperCase()}${value.substring(1)}';
  }
}
