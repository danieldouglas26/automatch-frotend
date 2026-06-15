import { z } from 'zod';

export enum Role {
  CLIENT = 'CLIENT',
  MECHANIC = 'MECHANIC',
}

export const RegisterRequestSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional(),
  firstName: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  lastName: z.string().min(2, "O sobrenome deve ter no mínimo 2 caracteres"),
  role: z.nativeEnum(Role),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const ProfessionalSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  specialty: z.string(),
  services: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});
export type Professional = z.infer<typeof ProfessionalSchema>;

export const UpdateProfessionalRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  specialty: z.string(),
  services: z.array(z.string()),
  active: z.boolean(),
});
export type UpdateProfessionalRequest = z.infer<typeof UpdateProfessionalRequestSchema>;

export const BookingRequestSchema = z.object({
  clientId: z.string(),
  clientEmail: z.string().email(),
  professionalId: z.string(),
  professionalEmail: z.string().email(),
  serviceName: z.string(),
  appointmentTime: z.string(), // ISO String
});
export type BookingRequest = z.infer<typeof BookingRequestSchema>;

export const BookingResponseSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  professionalId: z.string(),
  appointmentTime: z.string(),
  status: z.string().optional(),
});
export type BookingResponse = z.infer<typeof BookingResponseSchema>;

// Error structure containing traceId
export const ApiErrorSchema = z.object({
  timestamp: z.string(),
  status: z.number(),
  error: z.string(),
  path: z.string(),
  requestId: z.string().optional(), // Used as traceId
  message: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
