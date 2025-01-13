import { Router } from "express";
import { Participents,addParticipents,deleteParticipents } from "../services/conversation.js";

export const receiverRouter = Router();
receiverRouter.get("/users/receivers", Participents)
receiverRouter.post("/users/receivers", addParticipents)
receiverRouter.delete("/users/receivers/:receiverId", deleteParticipents)