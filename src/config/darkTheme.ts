/**
 * Dark Theme Configuration
 * Centralized configuration for CryptiPic's dark theme
 */

export const DARK_THEME_CONFIG = {
  // Primary colors
  primary: {
    background: '#0f172a', // slate-900
    foreground: '#f8fafc', // slate-50
    accent: '#00ffff', // cyan-500 (crypti-neon)
  },
  
  // Card colors
  card: {
    background: '#1e293b', // slate-800
    foreground: '#f1f5f9', // slate-100
    border: '#334155', // slate-700
  },
  
  // Interactive elements
  interactive: {
    hover: 'rgba(0, 255, 255, 0.1)', // crypti-neon with 10% opacity
    focus: 'rgba(0, 255, 255, 0.2)', // crypti-neon with 20% opacity
    active: 'rgba(0, 255, 255, 0.3)', // crypti-neon with 30% opacity
  },
  
  // Status colors
  status: {
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
  },
  
  // Security levels
  security: {
    unclassified: '#10b981', // green
    cui: '#8b5cf6', // purple
    confidential: '#3b82f6', // blue
    secret: '#ef4444', // red
    topSecret: '#f59e0b', // amber
  },
  
  // Text colors
  text: {
    primary: '#f8fafc', // slate-50
    secondary: '#cbd5e1', // slate-300
    muted: '#94a3b8', // slate-400
    accent: '#00ffff', // crypti-neon
  },
  
  // Border colors
  border: {
    default: '#334155', // slate-700
    accent: '#00ffff', // crypti-neon
    muted: '#475569', // slate-600
  },
  
  // Shadow colors
  shadow: {
    glow: 'rgba(0, 255, 255, 0.4)', // crypti-neon glow
    card: 'rgba(0, 0, 0, 0.3)', // dark shadow
  },
  
  // Gradient colors
  gradient: {
    primary: 'linear-gradient(135deg, #00ffff 0%, #00d4d4 100%)',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    card: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  }
};

// CSS custom properties for dark theme
export const DARK_THEME_CSS_VARS = `
  :root.dark {
    --background: 215 28% 17%;
    --foreground: 210 40% 98%;
    --card: 215 28% 17%;
    --card-foreground: 210 40% 98%;
    --popover: 215 28% 17%;
    --popover-foreground: 210 40% 98%;
    --primary: 180 100% 50%;
    --primary-foreground: 215 28% 17%;
    --secondary: 215 28% 25%;
    --secondary-foreground: 210 40% 98%;
    --muted: 215 28% 25%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 215 28% 25%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 215 28% 25%;
    --input: 215 28% 25%;
    --ring: 180 100% 50%;
  }
`;

// Apply dark theme styles
export const applyDarkTheme = () => {
  const style = document.createElement('style');
  style.textContent = DARK_THEME_CSS_VARS;
  document.head.appendChild(style);
  
  // Force dark class on html element
  document.documentElement.classList.add('dark');
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', DARK_THEME_CONFIG.primary.background);
  }
  
  // Update Apple mobile web app status bar
  const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusBar) {
    appleStatusBar.setAttribute('content', 'black-translucent');
  }
  
  console.log('[Dark Theme] Applied successfully');
};

// Remove dark theme styles
export const removeDarkTheme = () => {
  document.documentElement.classList.remove('dark');
  
  // Update meta theme-color to light
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', '#ffffff');
  }
  
  console.log('[Dark Theme] Removed successfully');
};

// Initialize dark theme
export const initializeDarkTheme = () => {
  // Check if dark theme should be applied
  const savedTheme = localStorage.getItem('cryptipic-theme');
  const shouldApplyDark = savedTheme === 'dark' || savedTheme === null; // Default to dark
  
  if (shouldApplyDark) {
    applyDarkTheme();
  }
  
  return shouldApplyDark;
};

export default DARK_THEME_CONFIG;
