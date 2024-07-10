import Datastore from "@seald-io/nedb";

const todo = new Datastore({
  filename: "todo_list.db",
  autoload: true,
  timestampData: true,
});

export const db = { todo };
