export interface ConjurClientData {
	account?: string;
	userid?: string;
	apiKey?: string;
	token?: string;
}

export interface ClientRequestParams {
	host: URL;
	token: string;
	account?: string;
}
export type ClientRequest<T> = (params: ClientRequestParams) => Promise<T>;
