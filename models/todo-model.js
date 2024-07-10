import { string, boolean, object } from "yup";

export const todoFieldsSchema = object({
  text: string().required(),
  is_checked: boolean().required(),
})
  .strict(true)
  .noUnknown();
