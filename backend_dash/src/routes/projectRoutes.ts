import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { BoardController } from "../controllers/BoardController";
import { projectExists } from "../middleware/project";
import { boardBelongsToProject, boardExist } from "../middleware/board";
import { DataVarController } from "../controllers/DataVarController";
import { dataVarBelongsToProject, dataVarExist } from "../middleware/dataVar";

const router = Router();

// en la url se manda el projecto al cual se esta agregando la tarea
// nested resource routing
router.param("projectId", projectExists);

// Express validator permite poner un validador en el controllador, en el router o en un middleware.
// Lo agregamos en la ruta para dejar en controlador sin tanto codigo y solo haga una accion
// con la funcion body que importamos leemos parametros que leemos desde body

/* PROYECTOS */
router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio."),
  body("description")
    .notEmpty()
    .withMessage("La descripcion del proyecto es obligatoria."),
  handleInputErrors,
  ProjectController.createProject
);

// Aca mando a llamar un controlador cuando entre a esa ruta
router.get("/", ProjectController.getAllProjects);

// Routing dinamico, :id comodin para las url's, siempre debe ser get,
// con param de express-validator validamos un id de mongodb, un objetID, antes de entrar al controlador

router.get(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  ProjectController.getProjectById
);

// Actualizar siempre es mas complejo porque se debe validar que exista el id y que la nueva entrada sea correcta

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID no valido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio."),
  body("description")
    .notEmpty()
    .withMessage("La descripcion del proyecto es obligatoria."),
  handleInputErrors,
  ProjectController.updateProject
);

router.post(
  "/:projectId/status",
  param("projectId").isMongoId().withMessage("ID no valido"),
  body("status").notEmpty().withMessage("El estado es obligatorio."),
  handleInputErrors,
  ProjectController.updateStatus
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  ProjectController.deleteProject
);

/* CONTROLADORES */
// el middleware se empiezaa poner donde se empieza a necesitar, por ejemplo aca lo necesito por boardId
// no se pueden ejecutar dos funciones en una instancia de param
router.param("boardId", boardExist);
router.param("boardId", boardBelongsToProject);

router.post(
  "/:projectId/boards",
  body("boardType")
    .notEmpty()
    .withMessage("El tipo de controlador es obligatorio."),
  body("boardName")
    .notEmpty()
    .withMessage("El nombre del controlador es obligatorio."),
  body("boardConnect")
    .notEmpty()
    .withMessage("El metodo de conexion es obligatorio."),
  body("boardInfo")
    .notEmpty()
    .withMessage("La informacion del controlador es obligatoria."),
  handleInputErrors,
  BoardController.createBoard
);

router.get("/:projectId/boards", BoardController.getProjectBoards);

router.get(
  "/:projectId/boards/:boardId",
  param("boardId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  BoardController.getBoardsById
);

router.put(
  "/:projectId/boards/:boardId",
  param("boardId").isMongoId().withMessage("ID no valido"),
  body("boardType")
    .notEmpty()
    .withMessage("El tipo de controlador es obligatorio."),
  body("boardName")
    .notEmpty()
    .withMessage("El nombre del controlador es obligatorio."),
  body("boardConnect")
    .notEmpty()
    .withMessage("El metodo de conexion es obligatorio."),
  body("boardInfo")
    .notEmpty()
    .withMessage("La informacion del controlador es obligatoria."),
  handleInputErrors,
  BoardController.updateBoard
);

router.post(
  "/:projectId/boards/:boardId/active",
  param("boardId").isMongoId().withMessage("ID no valido"),
  body("active").notEmpty().withMessage("El estado es obligatorio."),
  handleInputErrors,
  BoardController.updateActive
);

router.post(
  "/:projectId/boards/:boardId/code",
  param("boardId").isMongoId().withMessage("ID no valido"),
  body("boardCode").notEmpty().withMessage("El estado es obligatorio."),
  handleInputErrors,
  BoardController.updateCode
);

router.delete(
  "/:projectId/boards/:boardId",
  param("boardId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  BoardController.deleteBoard
);

/** DATAVARS **/

router.param("dataVarId", dataVarExist);
router.param("dataVarId", dataVarBelongsToProject);

router.post(
  "/:projectId/datavars",
  body("nameGlobalVar")
    .notEmpty()
    .withMessage("El tipo de controlador es obligatorio."),
  body("nameData")
    .notEmpty()
    .withMessage("El nombre del controlador es obligatorio."),
  body("gVar").notEmpty().withMessage("El metodo de conexion es obligatorio."),
  handleInputErrors,
  DataVarController.createDataVar
);

router.get("/:projectId/datavars", DataVarController.getProjectDataVars);
router.get("/:projectId/datavars/:dataVarId", DataVarController.getDataVarsById);
router.delete("/:projectId/datavars/:dataVarId", DataVarController.deleteDataVar);

export default router;
