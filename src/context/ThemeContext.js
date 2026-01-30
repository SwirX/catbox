import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../constants/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [currentThemeId, setCurrentThemeId] = useState(() => {
        return localStorage.getItem('catbox_theme') || 'apple_light';
    });

    const theme = themes[currentThemeId] || themes['apple_light'];

    const hexToRgb = (hex) => {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
            : null;
    };

    useEffect(() => {
        const root = document.documentElement;
        const colors = theme.colors;

        root.style.setProperty('--bg-primary', hexToRgb(colors.background));
        root.style.setProperty('--bg-surface', hexToRgb(colors.surface));
        root.style.setProperty('--text-primary', hexToRgb(colors.text));
        root.style.setProperty('--text-secondary', hexToRgb(colors.secondary));
        root.style.setProperty('--accent', hexToRgb(colors.accent));
        root.style.setProperty('--border', hexToRgb(colors.border));
        root.style.setProperty('--bg-hover', hexToRgb(colors.hover));

        if (theme.type === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('catbox_theme', currentThemeId);

    }, [currentThemeId, theme]);

    const setTheme = (id) => {
        if (themes[id]) {
            setCurrentThemeId(id);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme: currentThemeId, setTheme, definedThemes: themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
