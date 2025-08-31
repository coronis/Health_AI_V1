// Android Kotlin/Compose token generator
import { writeFileSync } from 'fs';
import { join } from 'path';

interface TokenGeneratorOptions {
  outputPath: string;
  tokens: any;
}

export function generateAndroidTokens({ outputPath, tokens }: TokenGeneratorOptions) {
  let kotlinCode = `// Auto-generated design tokens for Android
// DO NOT EDIT MANUALLY

package com.healthcoachai.designsystem

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.dp

object DesignTokens {
    
    object Colors {
`;

  // Generate colors
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([colorName, colorValues]: [string, any]) => {
      Object.entries(colorValues).forEach(([shade, value]: [string, any]) => {
        const kotlinName = `${colorName.charAt(0).toUpperCase() + colorName.slice(1)}${shade}`;
        const hexValue = (value as string).replace('#', '0xFF');
        kotlinCode += `        val ${kotlinName} = Color(${hexValue}L)\n`;
      });
    });
  }

  kotlinCode += `    }
    
    object Typography {
        object FontSizes {
`;

  // Generate typography font sizes
  if (tokens.typography?.fontSizes) {
    Object.entries(tokens.typography.fontSizes).forEach(([sizeName, sizeValue]: [string, any]) => {
      const spValue = parseFloat(sizeValue as string) * 16; // Convert rem to sp
      kotlinCode += `            val ${sizeName} = ${spValue}.sp\n`;
    });
  }

  kotlinCode += `        }
        
        object FontWeights {
`;

  // Generate font weights
  if (tokens.typography?.fontWeights) {
    Object.entries(tokens.typography.fontWeights).forEach(([weightName, weightValue]: [string, any]) => {
      kotlinCode += `            val ${weightName} = FontWeight(${weightValue})\n`;
    });
  }

  kotlinCode += `        }
    }
    
    object Spacing {
`;

  // Generate spacing
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([spaceName, spaceValue]: [string, any]) => {
      if (spaceValue === "0") {
        kotlinCode += `        val space${spaceName} = 0.dp\n`;
      } else {
        const dpValue = parseFloat(spaceValue as string) * 16; // Convert rem to dp
        kotlinCode += `        val space${spaceName} = ${dpValue}.dp\n`;
      }
    });
  }

  kotlinCode += `    }
}
`;

  writeFileSync(join(outputPath, 'DesignTokens.kt'), kotlinCode);
  console.log('Android tokens generated successfully');
}