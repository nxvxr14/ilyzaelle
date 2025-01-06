import { Router } from "express";
import { PollingController } from "../controllers/PollingController.js";

const router = Router();

// Aca mando a llamar un controlador cuando entre a esa ruta
// router.get("/boards", PollingController.pollingBoards);
router.get("/statusLocal", PollingController.getStatusLocal);
router.get("/boardStatus/:boardId", PollingController.getBoardStatus);
router.post("/boards", PollingController.pollingBoards);
router.post("/codes", PollingController.pollingCodes);

export default router;
