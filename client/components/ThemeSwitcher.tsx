'use client';

import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <SunIcon style={{ width: 24, height: 24, color: '#FDB813' }} />
      ) : (
        <MoonIcon style={{ width: 24, height: 24, color: '#A6A6A6' }} />
      )}
    </button>
  );
}; 