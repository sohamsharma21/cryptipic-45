/**
 * Force Dark Theme Utility
 * Ensures CryptiPic always starts in dark theme
 */

export const forceDarkTheme = () => {
  // Force dark theme on HTML element
  const html = document.documentElement;
  html.classList.remove('light');
  html.classList.add('dark');
  
  // Set theme in localStorage
  localStorage.setItem('cryptipic-theme', 'dark');
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', '#0f172a');
  }
  
  // Update Apple mobile web app status bar style
  const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusBar) {
    appleStatusBar.setAttribute('content', 'black-translucent');
  }
  
  console.log('[Theme] Dark theme forced successfully');
};

// Auto-apply dark theme on page load
if (typeof window !== 'undefined') {
  // Apply immediately
  forceDarkTheme();
  
  // Apply after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceDarkTheme);
  }
  
  // Apply after page load
  window.addEventListener('load', forceDarkTheme);
}

export default forceDarkTheme;
