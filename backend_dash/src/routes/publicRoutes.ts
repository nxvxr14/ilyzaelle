import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

// Ruta publica para acceder al dashboard por codigo unico (sin autenticacion)
router.get(
  "/dashboard/:dashCode",
  param("dashCode").notEmpty().withMessage("Codigo de dashboard requerido"),
  handleInputErrors,
  ProjectController.getAIDashByCode
);

export default router;
