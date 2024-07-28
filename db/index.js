import Datastore from '@seald-io/nedb';
class Database {
	constructor() {
		if (Database.instance) {
			return Database.instance;
		}

		this.todo = new Datastore({
			filename: 'todo_list.db',
			autoload: true,
			timestampData: true,
		});

		this.users = new Datastore({
			filename: 'users.db',
			autoload: true,
			timestampData: true,
		});

		this.tokens = new Datastore({
			filename: 'tokens.db',
			autoload: true,
			timestampData: true,
		});

		Database.instance = this;
	}
}

export const db = new Database();
