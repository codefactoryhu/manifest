import { writable, type Writable } from 'svelte/store';

export type AlertType = 'DANGER' | 'SUCCES' | 'WARNING';

type AlertColors =
	| 'form'
	| 'none'
	| 'gray'
	| 'red'
	| 'yellow'
	| 'green'
	| 'indigo'
	| 'purple'
	| 'pink'
	| 'blue'
	| 'light'
	| 'dark'
	| 'default'
	| 'dropdown'
	| 'navbar'
	| 'navbarUl'
	| 'primary'
	| 'orange';

export const show = writable(false);
export const alertMessage = writable('');
export const alertColor: Writable<AlertColors> = writable();

export const closeAlert = () => {
	alertMessage.set('');
	show.set(false);
};

export const displayAlert = (color: AlertColors, message: string, resetTimeInSeconds?: number) => {
	show.set(true);
	alertMessage.set(message);
	alertColor.set(color);

	if (resetTimeInSeconds) {
		setTimeout(() => {
			alertMessage.set('');
			show.set(false);
		}, 1000 * resetTimeInSeconds);
	}
};
