import { Router } from 'express';
import { db } from '../db/index.js';
import { todoFieldsSchema } from '../models/todo-model.js';
import { TodoDTO } from '../models/todoDTO.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = new Router();

// Получение всех задач
router.get('/', authMiddleware, async (req, res) => {
	try {
		const allTodos = await db.todo.findAsync({ user_id: req.user.id });
		res.send(allTodos.map((task) => new TodoDTO(task)));
	} catch (error) {
		res.status(500).send({ error: 'Failed to receive tasks' });
	}
});

// Создание новой задачи
router.post('/', authMiddleware, async (req, res) => {
	try {
		const body = await todoFieldsSchema.validate(req.body);
		const task = await db.todo.insertAsync({ ...body, user_id: req.user.id });

		res.send(new TodoDTO(task));
	} catch ({ errors }) {
		res.status(400).send(errors);
	}
});

// Удаление задачи
router.delete('/:id', authMiddleware, async (req, res) => {
	const taskId = req.params.id;

	try {
		const numRemoved = await db.todo.removeAsync({
			_id: taskId,
			user_id: req.user.id,
		});

		if (numRemoved > 0) {
			return res.send({ message: 'Task deleted successfully' });
		} else {
			return res.status(404).send({ error: 'Task not found' });
		}
	} catch ({ errors }) {
		res.status(500).send(errors);
	}
});

// Редактирование задачи
router.patch('/:id', authMiddleware, async (req, res) => {
	const taskId = req.params.id;
	const updatedTaskData = req.body;

	try {
		await todoFieldsSchema.validate(updatedTaskData);
		const { affectedDocuments } = await db.todo.updateAsync(
			{ _id: taskId, user_id: req.user.id },
			{ $set: updatedTaskData },
			{ returnUpdatedDocs: true }
		);

		if (affectedDocuments) {
			return res.send(new TodoDTO(affectedDocuments));
		} else {
			return res.status(404).send({ error: 'Task not found' });
		}
	} catch (error) {
		res.status(500).send({ error: 'Failed to update task' });
	}
});

export default router;
