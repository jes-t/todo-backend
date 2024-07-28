export class TodoDTO {
	id;
	isChecked;
	text;
	date;
	userId;

	constructor(task) {
		this.id = task._id;
		this.isChecked = task.is_checked;
		this.text = task.text;
		this.date = task.createdAt;
		this.userId = task.user_id;
	}
}
