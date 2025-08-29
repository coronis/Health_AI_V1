# Mobile Shared Components

This directory contains shared components, utilities, and resources used across
iOS and Android applications.

## Structure

- `components/` - Reusable UI components
- `utils/` - Shared utility functions
- `types/` - Common TypeScript type definitions
- `assets/` - Shared assets (icons, images, etc.)
- `styles/` - Shared styling utilities and themes

## Platform Integration

Shared components are designed to work with both:

- iOS (SwiftUI) - via bridging interfaces
- Android (Jetpack Compose) - via Kotlin interop

## Usage

Components and utilities can be imported and used in both platform-specific
applications while maintaining consistency across platforms.
