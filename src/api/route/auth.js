import { register,login, verifyEmail } from "../services/user.service.js";
import { Router} from "express";

export const authRoute = Router();

authRoute.post("/register", register)
authRoute.post("/login", login)
authRoute.patch("/verify", verifyEmail);


