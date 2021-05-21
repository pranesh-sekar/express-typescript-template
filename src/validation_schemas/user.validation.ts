import Joi from "joi";

export const UserValidationSchema = Joi.object({
  email: Joi.string().email().lowercase().required().label("Email"),
  password: Joi.string().required().label("Password"),
});

export const RefreshTokenValidationSchema = Joi.object({
  refreshToken: Joi.string().required().label("Refresh Token"),
});
