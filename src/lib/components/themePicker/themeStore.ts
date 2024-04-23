import themeList from '$lib/assets/themes/themelist.json';
import { writable, type Writable } from 'svelte/store';

function transformNameToMatchDefinedThemeKey(name: string) {
	return name.replaceAll(/\s|\(|\)|-/g, '');
}

export const pickTheme = (theme: string) => {
	const definedThemeName = transformNameToMatchDefinedThemeKey(theme);
	pickedTheme.set(definedThemeName);
};

export const getThemes = () => {
	return Object.values(themeList);
};

export const pickedTheme: Writable<string> = writable('Blackboard');
