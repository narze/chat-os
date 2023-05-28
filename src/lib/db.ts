import Dexie, { type Table } from 'dexie';

export interface ChatLog {
	id?: number;
	isBot: boolean;
	message: string;
	time: Date;
	type: string;
	alt?: string;
}

export class MyDexie extends Dexie {
	chatLogs!: Table<ChatLog>;

	constructor() {
		super('ChatOS');
		this.version(2).stores({
			chatLogs: '++id, isBot, message, time, type, alt'
		});
	}
}

export const db = new MyDexie();
