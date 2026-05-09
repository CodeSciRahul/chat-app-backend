import { Router } from "express";
import { Participents,addParticipents,deleteMultipleParticipents,deleteParticipents } from "../services/conversation.service.js";

export const receiverRouter = Router();
receiverRouter.get("/users/receivers", Participents)
receiverRouter.post("/users/receivers", addParticipents)
receiverRouter.delete("/users/receivers/:receiverId", deleteParticipents)
receiverRouter.delete("/users/receivers/", deleteMultipleParticipents)