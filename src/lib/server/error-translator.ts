import { translateError } from './error-patterns';

export interface TranslatedError {
	plainText: string;
	rawError: string;
	matched: boolean;
	showRetry: boolean;
}

export function translateForUser(rawError: string): TranslatedError {
	const { plainText, matched } = translateError(rawError);

	return {
		plainText,
		rawError,
		matched,
		showRetry: true
	};
}
