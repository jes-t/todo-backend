import { Router } from "express";
import { db } from "../db/index.js";
import { todoFieldsSchema } from "../models/todo-model.js";
import { TodoDTO } from "../models/todoDTO.js";

const router = new Router();

// Получение всех задач
router.get("/", async (req, res) => {
  try {
    const allTodos = await db.todo.findAsync({});
    res.send(allTodos.map((tasks) => new TodoDTO(tasks)));
  } catch (error) {
    res.status(500).send({ error: "Failed to receive tasks" });
  }
});

// Создание новой задачи
router.post("/", async (req, res) => {
  try {
    const body = await todoFieldsSchema.validate(req.body);
    const task = await db.todo.insertAsync(body);

    res.send(new TodoDTO(task));
  } catch ({ errors }) {
    res.status(400).send(errors);
  }
});

// Удаление задачи
router.delete("/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    const numRemoved = await db.todo.removeAsync({ _id: taskId });

    if (numRemoved > 0) {
      return res.send({ message: "Task deleted successfully" });
    } else {
      return res.status(404).send({ error: "Task not found" });
    }
  } catch ({ errors }) {
    res.status(500).send(errors);
  }
});

// Редактирование задачи
router.patch("/:id", async (req, res) => {
  const taskId = req.params.id;
  const updatedTaskData = req.body;

  try {
    await todoFieldsSchema.validate(updatedTaskData);
    const { affectedDocuments } = await db.todo.updateAsync(
      { _id: taskId },
      { $set: updatedTaskData },
      { returnUpdatedDocs: true }
    );

    if (affectedDocuments) {
      return res.send(new TodoDTO(affectedDocuments));
    } else {
      return res.status(404).send({ error: "Task not found" });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to update task" });
  }
});

export default router;
