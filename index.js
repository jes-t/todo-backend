import express, { json } from 'express';
import 'dotenv/config';
import cors from 'cors';
import todoRouter from './routers/todoRouters.js';
import authRouter from './routers/authRouter.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(process.env.STATIC_DIR_URL));
console.log('process.env.STATIC_DIR_URL', process.env.STATIC_DIR_URL);

app.use('/todo', todoRouter);
app.use('/auth', authRouter);

const port = process.env.PORT || 5050;

app.listen(port, () => {
	console.log(`Server listening on port: ${port}`);
});
