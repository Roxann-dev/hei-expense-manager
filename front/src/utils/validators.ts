import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Adresse email invalide" }),
    password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

export const signupSchema = z.object({
    email: z.string().email({ message: "Adresse email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});
