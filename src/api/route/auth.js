import { register,login, verifyEmail, updateProfile } from "../services/user.service.js";
import { Router} from "express";
import { protectRoute } from "../middlewares/protectedRoute.js";
import { upload } from "../middlewares/handleFile.js";

export const authRoute = Router();

authRoute.post("/register", register)
authRoute.post("/login", login)
authRoute.patch("/verify", verifyEmail);
authRoute.put("/profile", protectRoute, upload.single('profilePic'), updateProfile);


