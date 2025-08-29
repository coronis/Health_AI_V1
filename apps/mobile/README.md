# HealthCoachAI Mobile Apps

This directory contains the mobile applications for HealthCoachAI platform.

## Structure

- `ios/` - Native iOS application built with SwiftUI
- `android/` - Native Android application built with Kotlin and Jetpack Compose
- `shared/` - Shared components and utilities between platforms

## Getting Started

### iOS Development

```bash
cd ios
# Install dependencies
pod install
# Open in Xcode
open HealthCoachAI.xcworkspace
```

### Android Development

```bash
cd android
# Build the project
./gradlew build
# Run on emulator/device
./gradlew installDebug
```

## Development Guidelines

- Follow platform-specific design guidelines (HIG for iOS, Material Design for Android)
- Maintain feature parity between platforms
- Use shared business logic where possible
- Implement proper error handling and offline support

## Testing

- Unit tests for business logic
- UI tests for critical user flows
- Integration tests with backend APIs
- Accessibility testing

## Performance Requirements

- App launch time < 3 seconds
- Screen transitions < 100ms
- Smooth 60fps animations
- Efficient memory usage
