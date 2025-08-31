// iOS Swift token generator
import { writeFileSync } from 'fs';
import { join } from 'path';

interface TokenGeneratorOptions {
  outputPath: string;
  tokens: any;
}

export function generateiOSTokens({ outputPath, tokens }: TokenGeneratorOptions) {
  let swiftCode = `// Auto-generated design tokens for iOS
// DO NOT EDIT MANUALLY

import SwiftUI

extension Color {
`;

  // Generate colors
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([colorName, colorValues]: [string, any]) => {
      Object.entries(colorValues).forEach(([shade, value]: [string, any]) => {
        const swiftName = `${colorName}${shade}`;
        swiftCode += `    static let ${swiftName} = Color(hex: "${value}")\n`;
      });
    });
  }

  swiftCode += `}

extension Font {
`;

  // Generate typography
  if (tokens.typography) {
    const { fontSizes, fontWeights } = tokens.typography;
    Object.entries(fontSizes).forEach(([sizeName, sizeValue]: [string, any]) => {
      Object.entries(fontWeights).forEach(([weightName, weightValue]: [string, any]) => {
        swiftCode += `    static let ${sizeName}${weightName.charAt(0).toUpperCase() + weightName.slice(1)} = Font.system(size: ${parseFloat(sizeValue as string) * 16}, weight: .${weightName})\n`;
      });
    });
  }

  swiftCode += `}

// Color extension for hex support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
`;

  writeFileSync(join(outputPath, 'DesignTokens.swift'), swiftCode);
  console.log('iOS tokens generated successfully');
}