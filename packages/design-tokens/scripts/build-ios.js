const fs = require('fs-extra');
const path = require('path');

// Build iOS tokens
async function buildIOS() {
  const distDir = path.join(__dirname, '../dist/ios');
  await fs.ensureDir(distDir);
  
  // Read combined tokens
  const tokens = await fs.readJson(path.join(__dirname, '../dist/tokens.json'));
  
  // Generate Swift tokens file
  let swiftContent = `// HealthCoachAI Design Tokens
// Generated automatically - do not edit

import SwiftUI

extension Color {
    // Primary Colors
    static let primaryTeal = Color(red: 0.078, green: 0.722, blue: 0.651)
    static let secondaryOrange = Color(red: 0.941, green: 0.396, blue: 0.243)
    
    // Semantic Colors
    static let textPrimary = Color(red: 0.094, green: 0.094, blue: 0.106)
    static let textSecondary = Color(red: 0.322, green: 0.322, blue: 0.357)
}

extension Font {
    // Typography
    static let headingLarge = Font.custom("Poppins-Bold", size: 30)
    static let headingMedium = Font.custom("Poppins-SemiBold", size: 24)
    static let bodyLarge = Font.custom("Inter-Regular", size: 18)
    static let bodyMedium = Font.custom("Inter-Regular", size: 16)
    static let caption = Font.custom("Inter-Regular", size: 12)
}
`;
  
  await fs.writeFile(path.join(distDir, 'DesignTokens.swift'), swiftContent);
  console.log('✅ iOS tokens built successfully');
}

buildIOS().catch(console.error);