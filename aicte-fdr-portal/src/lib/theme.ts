export type Theme = 'light' | 'dark';

export const THEME_COOKIE_NAME = 'theme';

/**
 * Reads the theme value from browser document.cookie.
 * Defaults to 'light'.
 */
export function getThemeFromCookie(): Theme {
  if (typeof document === 'undefined') return 'light';
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${THEME_COOKIE_NAME}=([^;]+)`));
  const val = match ? decodeURIComponent(match[2]) : null;
  return val === 'dark' ? 'dark' : 'light';
}

/**
 * Sets the theme cookie for 1 year and applies the class to document.documentElement.
 */
export function setThemeCookie(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  document.documentElement.setAttribute('data-theme', theme);
}
