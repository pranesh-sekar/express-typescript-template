import express from "express";
import UserController from "../controllers/user.controller";

const router = express();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.login);
router.post("/refresh-token", UserController.refreshToken);
router.delete('/logout', UserController.logout);

export default router;
