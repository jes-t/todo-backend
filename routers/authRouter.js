import { Router } from 'express';
import { userSchema } from '../models/user-model.js';
import { db } from '../db/index.js';
import bcrypt from 'bcrypt';
import { SALT, generateTokens, validateRefreshToken } from '../helpers.js';

const router = new Router();

router.post('/registration', async (req, res) => {
	try {
		const validatedData = await userSchema.validate(req.body);

		const existingUser = await db.users.findOneAsync(validatedData.userName);

		if (existingUser) {
			return res.status(400).send({ error: 'User name already exists' });
		}

		const hashedPassword = await bcrypt.hash(validatedData.password, SALT);

		const newUser = await db.users.insertAsync({
			userName: validatedData.userName,
			password: hashedPassword,
		});

		const newTokens = generateTokens({
			id: newUser._id,
			userName: newUser.userName,
		});

		await db.tokens.insertAsync({
			_id: newUser._id,
			refreshToken: newTokens.refreshToken,
		});

		res.cookie('refreshToken', newTokens.refreshToken, {
			// передаем рефреш токен нового юзера в куки. Срок годности-месяц
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		});

		res.status(201).send({
			user: { id: newUser._id, userName: newUser.userName },
			...newTokens,
		});
	} catch (error) {
		console.error('Registration error:', error);
		if (error.name === 'ValidationError') {
			return res.status(400).send({ error: 'Invalid data format' });
		}
		res.status(500).send({ error: 'Registration failed' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const validatedData = await userSchema.validate(req.body);

		const existingUser = await db.users.findOneAsync({
			userName: validatedData.userName,
		});

		if (!existingUser) {
			return res.status(404).send({ error: 'User not found' });
		}

		const isPasswordMatch = await bcrypt.compare(
			validatedData.password,
			existingUser.password
		);

		if (!isPasswordMatch) {
			return res.status(401).send({ error: 'Incorrect password' });
		}

		const newTokens = generateTokens({
			id: existingUser._id,
			userName: existingUser.userName,
		});

		await db.tokens.updateAsync(
			{ _id: existingUser._id },
			{ $set: { refreshToken: newTokens.refreshToken } },
			{ upsert: true }
		);

		res.cookie('refreshToken', newTokens.refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		});

		res.send({
			user: { id: existingUser._id, useName: existingUser.userName },
			...newTokens,
			status: 200,
		});
	} catch (error) {
		console.error('Login error:', error);
		if (error.name === 'ValidationError') {
			return res.status(400).send({ error: 'Invalid data format' });
		}
		res.status(500).send({ error: 'Login failed' });
	}
});

router.post('/logout', async (req, res) => {
	try {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			return res.status(400).send({ error: 'No refresh token provided' });
		}

		const deletedToken = await db.tokens.removeAsync({ refreshToken });

		if (deletedToken === 0) {
			return res.status(400).send({ error: 'Invalid refresh token' });
		}

		res.clearCookie('refreshToken', { httpOnly: true });

		res.status(200).send({ message: 'Logout successful' });
	} catch (error) {
		console.error('Logout error:', error);
		res.status(500).send({ error: 'Logout failed' });
	}
});

router.post('/refresh', async (req, res) => {
	try {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			return res.status(401).send({ error: 'No refresh token provided' });
		}

		const decodedUser = validateRefreshToken(refreshToken);

		if (!decodedUser) {
			return res.status(403).send({ error: 'Invalid refresh token' });
		}

		const existingToken = await db.tokens.findOneAsync({ refreshToken });

		if (!existingToken) {
			return res.status(403).send({ error: 'Invalid refresh token' });
		}

		const newTokens = generateTokens({
			id: decodedUser.id,
			userName: decodedUser.userName,
		});

		await db.tokens.updateAsync(
			{ _id: decodedUser.id },
			{ $set: { refreshToken: newTokens.refreshToken } },
			{ upsert: true }
		);

		res.cookie('refreshToken', newTokens.refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		});

		res.status(200).send({
			accessToken: newTokens.accessToken,
		});
	} catch (error) {
		console.error('Refresh error:', error);
		res.status(500).send({ error: 'Failed to refresh tokens' });
	}
});

export default router;
