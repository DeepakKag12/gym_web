import { readStoredTheme, THEME_KEY } from '../context/ThemeContext';

describe('ThemeContext stored theme reader', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to light when no preference is saved', () => {
    expect(readStoredTheme()).toBe('light');
  });

  test('reads dark theme when saved', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    expect(readStoredTheme()).toBe('dark');
  });

  test('reads light theme when saved explicitly', () => {
    localStorage.setItem(THEME_KEY, 'light');
    expect(readStoredTheme()).toBe('light');
  });

  test('falls back to light when invalid theme is saved', () => {
    localStorage.setItem(THEME_KEY, 'invalid-mode');
    expect(readStoredTheme()).toBe('light');
  });
});
