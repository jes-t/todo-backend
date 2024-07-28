import { string, object } from 'yup';

export const userSchema = object({
	userName: string().required(),
	password: string().required(),
})
	.strict(true)
	.noUnknown();
