export class TodoDTO {
  id;
  is_checked;
  text;
  date;

  constructor(task) {
    this.id = task._id;
    this.is_checked = task.is_checked;
    this.text = task.text;
    this.date = task.createdAt;
  }
}
