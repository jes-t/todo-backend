import jwt from 'jsonwebtoken';

export const SALT = 3;

export function generateTokens(userInfo) {
	const accessToken = jwt.sign(userInfo, process.env.JWT_ACCESS_SECRET, {
		expiresIn: '5m',
	});

	const refreshToken = jwt.sign(userInfo, process.env.JWT_REFRESH_SECRET, {
		expiresIn: '30d',
	});
	return { accessToken, refreshToken };
}

export function validateRefreshToken(token) {
	try {
		const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
		return userData;
	} catch (error) {
		return null;
	}
}

export function validateAccessToken(token) {
	try {
		const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
		return { valid: true, userData };
	} catch (error) {
		return { valid: false, error };
	}
}
