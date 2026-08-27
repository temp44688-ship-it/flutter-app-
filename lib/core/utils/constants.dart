/// Application-wide constants.
/// 
/// No external dependencies allowed in this file.
abstract class AppConstants {
  const AppConstants._();

  static const String appName = 'Flutter Clean Architecture App';
  static const String apiBaseUrl = 'https://api.example.com/v1';
  static const String cacheKeyPrefix = 'app_cache_';
  static const int requestTimeoutSeconds = 30;
  static const int maxRetryAttempts = 3;
}

