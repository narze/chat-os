import Dexie, { type Table } from 'dexie';

export interface ChatLog {
	id?: number;
	isBot: boolean;
	message: string;
	time: Date;
}

export class MyDexie extends Dexie {
	chatLogs!: Table<ChatLog>;

	constructor() {
		super('ChatOS');
		this.version(1).stores({
			chatLogs: '++id, isBot, message, time'
		});
	}
}

export const db = new MyDexie();
