/**
 * Theme Toggle Button
 * 다크모드/라이트모드 전환 버튼
 */
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/core/theme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
      aria-label="테마 전환"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
}
