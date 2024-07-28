import { validateAccessToken } from '../helpers.js';

export function authMiddleware(req, res, next) {
	const authHeader = req.header('Authorization');

	if (!authHeader) return res.status(401).send({ error: 'Access denied' });

	// так как authHeader = "Bearer token"
	const token = authHeader.split(' ')[1];

	if (!token) return res.status(401).send({ error: 'Access denied' });

	const { valid, userData, error } = validateAccessToken(token);

	if (!valid)
		return res.status(403).send({ error: 'Invalid token', details: error });

	req.user = userData;

	next();
}
