import { getMusicService } from "../services/music.service.js";
import { Router } from "express";

export const musicRouter = Router()

musicRouter.get("/", getMusicService)

