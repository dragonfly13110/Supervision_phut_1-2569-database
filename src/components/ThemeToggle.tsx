import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage on initial load
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved === 'dark';
        }
        return false;
    });

    useEffect(() => {
        // Apply theme to document
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [isDark]);

    useEffect(() => {
        // Check system preference on first load if no saved preference
        const saved = localStorage.getItem('theme');
        if (!saved) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(prefersDark);
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDark ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode'}
            aria-label="Toggle theme"
        >
            <div className={`theme-toggle-track ${isDark ? 'dark' : ''}`}>
                <div className="theme-toggle-thumb">
                    {isDark ? <FiMoon /> : <FiSun />}
                </div>
            </div>
            <span className="theme-toggle-label">
                {isDark ? 'Dark' : 'Light'}
            </span>
        </button>
    );
}
