import Dexie, { type Table } from 'dexie';

export interface ChatLog {
	id?: number;
	isBot: boolean;
	message: string;
	time: Date;
	type: string;
	alt?: string;
	meta?: Record<string, string>;
	guestSession?: boolean;
}

export class MyDexie extends Dexie {
	chatLogs!: Table<ChatLog>;

	constructor() {
		super('ChatOS');
		this.version(4).stores({
			chatLogs: '++id, isBot, message, time, type, alt, meta, guestSession'
		});
	}
}

export const db = new MyDexie();
