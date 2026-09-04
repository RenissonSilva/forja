import { z } from "zod";

export const signUpWithEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});

export type SignUpWithEmailInput = z.infer<typeof signUpWithEmailSchema>;
