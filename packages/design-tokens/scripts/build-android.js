const fs = require('fs-extra');
const path = require('path');

// Build Android tokens
async function buildAndroid() {
  const distDir = path.join(__dirname, '../dist/android');
  await fs.ensureDir(distDir);
  
  // Read combined tokens
  const tokens = await fs.readJson(path.join(__dirname, '../dist/tokens.json'));
  
  // Generate Kotlin tokens file
  let kotlinContent = `// HealthCoachAI Design Tokens
// Generated automatically - do not edit

package com.healthcoachai.designsystem.tokens

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object DesignTokens {
    // Colors
    object Colors {
        val PrimaryTeal = Color(0xFF14B8A6)
        val SecondaryOrange = Color(0xFFF0653E)
        val TextPrimary = Color(0xFF18181B)
        val TextSecondary = Color(0xFF52525B)
        val BackgroundPrimary = Color(0xFFFFFFFF)
        val BackgroundSecondary = Color(0xFFFAFAFA)
    }
    
    // Typography
    object Typography {
        val HeadingLarge = 30.sp
        val HeadingMedium = 24.sp
        val BodyLarge = 18.sp
        val BodyMedium = 16.sp
        val Caption = 12.sp
    }
    
    // Spacing
    object Spacing {
        val XS = 4
        val S = 8
        val M = 16
        val L = 24
        val XL = 32
        val XXL = 48
    }
}
`;
  
  await fs.writeFile(path.join(distDir, 'DesignTokens.kt'), kotlinContent);
  console.log('✅ Android tokens built successfully');
}

buildAndroid().catch(console.error);