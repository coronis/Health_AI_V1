export declare const colors: {
    readonly primary: {
        readonly 50: "#f0fdfa";
        readonly 100: "#ccfbf1";
        readonly 200: "#99f6e4";
        readonly 300: "#5eead4";
        readonly 400: "#2dd4bf";
        readonly 500: "#14b8a6";
        readonly 600: "#0d9488";
        readonly 700: "#0f766e";
        readonly 800: "#115e59";
        readonly 900: "#134e4a";
    };
    readonly secondary: {
        readonly 50: "#fef7ee";
        readonly 100: "#fedfc7";
        readonly 200: "#fdba8c";
        readonly 300: "#fb923c";
        readonly 400: "#f97316";
        readonly 500: "#f0653e";
        readonly 600: "#ea580c";
        readonly 700: "#c2410c";
        readonly 800: "#9a3412";
        readonly 900: "#7c2d12";
    };
    readonly success: {
        readonly 50: "#f0fdf4";
        readonly 100: "#dcfce7";
        readonly 200: "#bbf7d0";
        readonly 300: "#86efac";
        readonly 400: "#4ade80";
        readonly 500: "#22c55e";
        readonly 600: "#16a34a";
        readonly 700: "#15803d";
        readonly 800: "#166534";
        readonly 900: "#14532d";
    };
    readonly warning: {
        readonly 50: "#fefce8";
        readonly 100: "#fef3c7";
        readonly 200: "#fde68a";
        readonly 300: "#fcd34d";
        readonly 400: "#fbbf24";
        readonly 500: "#f59e0b";
        readonly 600: "#d97706";
        readonly 700: "#b45309";
        readonly 800: "#92400e";
        readonly 900: "#78350f";
    };
    readonly error: {
        readonly 50: "#fef2f2";
        readonly 100: "#fee2e2";
        readonly 200: "#fecaca";
        readonly 300: "#fca5a5";
        readonly 400: "#f87171";
        readonly 500: "#ef4444";
        readonly 600: "#dc2626";
        readonly 700: "#b91c1c";
        readonly 800: "#991b1b";
        readonly 900: "#7f1d1d";
    };
    readonly neutral: {
        readonly 0: "#ffffff";
        readonly 50: "#fafafa";
        readonly 100: "#f5f5f5";
        readonly 200: "#e5e5e5";
        readonly 300: "#d4d4d4";
        readonly 400: "#a3a3a3";
        readonly 500: "#737373";
        readonly 600: "#525252";
        readonly 700: "#404040";
        readonly 800: "#262626";
        readonly 900: "#171717";
        readonly 1000: "#000000";
    };
    readonly background: {
        readonly primary: "#ffffff";
        readonly secondary: "#fafafa";
        readonly tertiary: "#f5f5f5";
        readonly inverse: "#171717";
    };
    readonly text: {
        readonly primary: "#171717";
        readonly secondary: "#525252";
        readonly tertiary: "#737373";
        readonly inverse: "#ffffff";
        readonly disabled: "#a3a3a3";
    };
    readonly border: {
        readonly primary: "#e5e5e5";
        readonly secondary: "#d4d4d4";
        readonly focus: "#14b8a6";
        readonly error: "#ef4444";
    };
};
export declare const typography: {
    readonly fontFamily: {
        readonly primary: readonly ["Inter", "system-ui", "sans-serif"];
        readonly secondary: readonly ["Poppins", "Inter", "system-ui", "sans-serif"];
        readonly mono: readonly ["SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", "monospace"];
    };
    readonly fontSize: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
        readonly '5xl': "3rem";
        readonly '6xl': "3.75rem";
    };
    readonly fontWeight: {
        readonly thin: 100;
        readonly extralight: 200;
        readonly light: 300;
        readonly normal: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
        readonly extrabold: 800;
        readonly black: 900;
    };
    readonly lineHeight: {
        readonly none: 1;
        readonly tight: 1.25;
        readonly snug: 1.375;
        readonly normal: 1.5;
        readonly relaxed: 1.625;
        readonly loose: 2;
    };
    readonly letterSpacing: {
        readonly tighter: "-0.05em";
        readonly tight: "-0.025em";
        readonly normal: "0em";
        readonly wide: "0.025em";
        readonly wider: "0.05em";
        readonly widest: "0.1em";
    };
};
export declare const spacing: {
    readonly 0: "0";
    readonly 1: "0.25rem";
    readonly 2: "0.5rem";
    readonly 3: "0.75rem";
    readonly 4: "1rem";
    readonly 5: "1.25rem";
    readonly 6: "1.5rem";
    readonly 7: "1.75rem";
    readonly 8: "2rem";
    readonly 9: "2.25rem";
    readonly 10: "2.5rem";
    readonly 11: "2.75rem";
    readonly 12: "3rem";
    readonly 14: "3.5rem";
    readonly 16: "4rem";
    readonly 20: "5rem";
    readonly 24: "6rem";
    readonly 28: "7rem";
    readonly 32: "8rem";
    readonly 36: "9rem";
    readonly 40: "10rem";
    readonly 44: "11rem";
    readonly 48: "12rem";
    readonly 52: "13rem";
    readonly 56: "14rem";
    readonly 60: "15rem";
    readonly 64: "16rem";
    readonly 72: "18rem";
    readonly 80: "20rem";
    readonly 96: "24rem";
};
export declare const borderRadius: {
    readonly none: "0";
    readonly sm: "0.125rem";
    readonly base: "0.25rem";
    readonly md: "0.375rem";
    readonly lg: "0.5rem";
    readonly xl: "0.75rem";
    readonly '2xl': "1rem";
    readonly '3xl': "1.5rem";
    readonly full: "9999px";
};
export declare const shadows: {
    readonly none: "none";
    readonly sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    readonly base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
    readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
};
export declare const breakpoints: {
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
};
export declare const zIndex: {
    readonly hide: -1;
    readonly auto: "auto";
    readonly base: 0;
    readonly docked: 10;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly banner: 1200;
    readonly overlay: 1300;
    readonly modal: 1400;
    readonly popover: 1500;
    readonly skipLink: 1600;
    readonly toast: 1700;
    readonly tooltip: 1800;
};
export declare const accessibility: {
    readonly minTapTarget: "44px";
    readonly focusRingWidth: "2px";
    readonly focusRingOffset: "2px";
    readonly contrastRatio: {
        readonly normal: 4.5;
        readonly large: 3;
        readonly ui: 3;
    };
};
export declare const motion: {
    readonly duration: {
        readonly instant: "0ms";
        readonly fast: "150ms";
        readonly normal: "250ms";
        readonly slow: "350ms";
        readonly slower: "500ms";
    };
    readonly easing: {
        readonly linear: "linear";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
export declare const designTokens: {
    readonly colors: {
        readonly primary: {
            readonly 50: "#f0fdfa";
            readonly 100: "#ccfbf1";
            readonly 200: "#99f6e4";
            readonly 300: "#5eead4";
            readonly 400: "#2dd4bf";
            readonly 500: "#14b8a6";
            readonly 600: "#0d9488";
            readonly 700: "#0f766e";
            readonly 800: "#115e59";
            readonly 900: "#134e4a";
        };
        readonly secondary: {
            readonly 50: "#fef7ee";
            readonly 100: "#fedfc7";
            readonly 200: "#fdba8c";
            readonly 300: "#fb923c";
            readonly 400: "#f97316";
            readonly 500: "#f0653e";
            readonly 600: "#ea580c";
            readonly 700: "#c2410c";
            readonly 800: "#9a3412";
            readonly 900: "#7c2d12";
        };
        readonly success: {
            readonly 50: "#f0fdf4";
            readonly 100: "#dcfce7";
            readonly 200: "#bbf7d0";
            readonly 300: "#86efac";
            readonly 400: "#4ade80";
            readonly 500: "#22c55e";
            readonly 600: "#16a34a";
            readonly 700: "#15803d";
            readonly 800: "#166534";
            readonly 900: "#14532d";
        };
        readonly warning: {
            readonly 50: "#fefce8";
            readonly 100: "#fef3c7";
            readonly 200: "#fde68a";
            readonly 300: "#fcd34d";
            readonly 400: "#fbbf24";
            readonly 500: "#f59e0b";
            readonly 600: "#d97706";
            readonly 700: "#b45309";
            readonly 800: "#92400e";
            readonly 900: "#78350f";
        };
        readonly error: {
            readonly 50: "#fef2f2";
            readonly 100: "#fee2e2";
            readonly 200: "#fecaca";
            readonly 300: "#fca5a5";
            readonly 400: "#f87171";
            readonly 500: "#ef4444";
            readonly 600: "#dc2626";
            readonly 700: "#b91c1c";
            readonly 800: "#991b1b";
            readonly 900: "#7f1d1d";
        };
        readonly neutral: {
            readonly 0: "#ffffff";
            readonly 50: "#fafafa";
            readonly 100: "#f5f5f5";
            readonly 200: "#e5e5e5";
            readonly 300: "#d4d4d4";
            readonly 400: "#a3a3a3";
            readonly 500: "#737373";
            readonly 600: "#525252";
            readonly 700: "#404040";
            readonly 800: "#262626";
            readonly 900: "#171717";
            readonly 1000: "#000000";
        };
        readonly background: {
            readonly primary: "#ffffff";
            readonly secondary: "#fafafa";
            readonly tertiary: "#f5f5f5";
            readonly inverse: "#171717";
        };
        readonly text: {
            readonly primary: "#171717";
            readonly secondary: "#525252";
            readonly tertiary: "#737373";
            readonly inverse: "#ffffff";
            readonly disabled: "#a3a3a3";
        };
        readonly border: {
            readonly primary: "#e5e5e5";
            readonly secondary: "#d4d4d4";
            readonly focus: "#14b8a6";
            readonly error: "#ef4444";
        };
    };
    readonly typography: {
        readonly fontFamily: {
            readonly primary: readonly ["Inter", "system-ui", "sans-serif"];
            readonly secondary: readonly ["Poppins", "Inter", "system-ui", "sans-serif"];
            readonly mono: readonly ["SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", "monospace"];
        };
        readonly fontSize: {
            readonly xs: "0.75rem";
            readonly sm: "0.875rem";
            readonly base: "1rem";
            readonly lg: "1.125rem";
            readonly xl: "1.25rem";
            readonly '2xl': "1.5rem";
            readonly '3xl': "1.875rem";
            readonly '4xl': "2.25rem";
            readonly '5xl': "3rem";
            readonly '6xl': "3.75rem";
        };
        readonly fontWeight: {
            readonly thin: 100;
            readonly extralight: 200;
            readonly light: 300;
            readonly normal: 400;
            readonly medium: 500;
            readonly semibold: 600;
            readonly bold: 700;
            readonly extrabold: 800;
            readonly black: 900;
        };
        readonly lineHeight: {
            readonly none: 1;
            readonly tight: 1.25;
            readonly snug: 1.375;
            readonly normal: 1.5;
            readonly relaxed: 1.625;
            readonly loose: 2;
        };
        readonly letterSpacing: {
            readonly tighter: "-0.05em";
            readonly tight: "-0.025em";
            readonly normal: "0em";
            readonly wide: "0.025em";
            readonly wider: "0.05em";
            readonly widest: "0.1em";
        };
    };
    readonly spacing: {
        readonly 0: "0";
        readonly 1: "0.25rem";
        readonly 2: "0.5rem";
        readonly 3: "0.75rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 7: "1.75rem";
        readonly 8: "2rem";
        readonly 9: "2.25rem";
        readonly 10: "2.5rem";
        readonly 11: "2.75rem";
        readonly 12: "3rem";
        readonly 14: "3.5rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 28: "7rem";
        readonly 32: "8rem";
        readonly 36: "9rem";
        readonly 40: "10rem";
        readonly 44: "11rem";
        readonly 48: "12rem";
        readonly 52: "13rem";
        readonly 56: "14rem";
        readonly 60: "15rem";
        readonly 64: "16rem";
        readonly 72: "18rem";
        readonly 80: "20rem";
        readonly 96: "24rem";
    };
    readonly borderRadius: {
        readonly none: "0";
        readonly sm: "0.125rem";
        readonly base: "0.25rem";
        readonly md: "0.375rem";
        readonly lg: "0.5rem";
        readonly xl: "0.75rem";
        readonly '2xl': "1rem";
        readonly '3xl': "1.5rem";
        readonly full: "9999px";
    };
    readonly shadows: {
        readonly none: "none";
        readonly sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
        readonly base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
        readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
        readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
        readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
        readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
    };
    readonly breakpoints: {
        readonly sm: "640px";
        readonly md: "768px";
        readonly lg: "1024px";
        readonly xl: "1280px";
        readonly '2xl': "1536px";
    };
    readonly zIndex: {
        readonly hide: -1;
        readonly auto: "auto";
        readonly base: 0;
        readonly docked: 10;
        readonly dropdown: 1000;
        readonly sticky: 1100;
        readonly banner: 1200;
        readonly overlay: 1300;
        readonly modal: 1400;
        readonly popover: 1500;
        readonly skipLink: 1600;
        readonly toast: 1700;
        readonly tooltip: 1800;
    };
    readonly accessibility: {
        readonly minTapTarget: "44px";
        readonly focusRingWidth: "2px";
        readonly focusRingOffset: "2px";
        readonly contrastRatio: {
            readonly normal: 4.5;
            readonly large: 3;
            readonly ui: 3;
        };
    };
    readonly motion: {
        readonly duration: {
            readonly instant: "0ms";
            readonly fast: "150ms";
            readonly normal: "250ms";
            readonly slow: "350ms";
            readonly slower: "500ms";
        };
        readonly easing: {
            readonly linear: "linear";
            readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
            readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
            readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        };
    };
};
export default designTokens;
//# sourceMappingURL=tokens.d.ts.map