import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { BoardController } from "../controllers/BoardController";
import { projectExists } from "../middleware/project";
import { boardBelongsToProject, boardExist } from "../middleware/board";

const router = Router()

// Express validator permite poner un validador en el controllador, en el router o en un middleware.
// Lo agregamos en la ruta para dejar en controlador sin tanto codigo y solo haga una accion
// con la funcion body que importamos leemos parametros que leemos desde body

router.post('/',
    body('projectName').
        notEmpty().withMessage('El nombre del proyecto es obligatorio.'),
    body('description').
        notEmpty().withMessage('La descripcion del proyecto es obligatoria.'),
    handleInputErrors,
    ProjectController.createProject,
)

// Aca mando a llamar un controlador cuando entre a esa ruta
router.get('/', ProjectController.getAllProjects)

// Routing dinamico, :id comodin para las url's, siempre debe ser get, 
// con param de express-validator validamos un id de mongodb, un objetID, antes de entrar al controlador

router.get('/:projectId',
    param('projectId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById
)

// Actualizar siempre es mas complejo porque se debe validar que exista el id y que la nueva entrada sea correcta

router.put('/:projectId',
    param('projectId').isMongoId().withMessage('ID no valido'),
    body('projectName').
        notEmpty().withMessage('El nombre del proyecto es obligatorio.'),
    body('description').
        notEmpty().withMessage('La descripcion del proyecto es obligatoria.'),
    handleInputErrors,
    ProjectController.updateProject,
)

router.delete('/:projectId',
    param('projectId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.deleteProject
)

// Routes para boards
// en la url se manda el projecto al cual se esta agregando la tarea
router.param('projectId', projectExists)

router.post('/:projectId/boards',
    body('boardType').
        notEmpty().withMessage('El tipo de controlador es obligatorio.'),
    body('boardName').
        notEmpty().withMessage('El nombre del controlador es obligatorio.'),
    body('boardConnect').
        notEmpty().withMessage('El metodo de conexion es obligatorio.'),
    body('boardInfo').
        notEmpty().withMessage('La informacion del controlador es obligatoria.'),
    body('modeLocal').
        notEmpty().withMessage('El modo de programacion es obligatorio.'),
    handleInputErrors,
    BoardController.createBoard
)

router.get('/:projectId/boards',
    BoardController.getProjectBoards
)

// el middleware se empiezaa poner donde se empieza a necesitar, por ejemplo aca lo necesito por boardId
// no se pueden ejecutar dos funciones en una instancia de param
router.param('boardId', boardExist)
router.param('boardId', boardBelongsToProject)

router.get('/:projectId/boards/:boardId',
    param('boardId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    BoardController.getBoardsById
)

router.put('/:projectId/boards/:boardId',
    param('boardId').isMongoId().withMessage('ID no valido'),
    body('boardType').
        notEmpty().withMessage('El tipo de controlador es obligatorio.'),
    body('boardName').
        notEmpty().withMessage('El nombre del controlador es obligatorio.'),
    body('boardConnect').
        notEmpty().withMessage('El metodo de conexion es obligatorio.'),
    body('boardInfo').
        notEmpty().withMessage('La informacion del controlador es obligatoria.'),
    body('modeLocal').
        notEmpty().withMessage('El modo de programacion es obligatorio.'),
    handleInputErrors,
    BoardController.updateBoard
)

router.delete('/:projectId/boards/:boardId',
    param('boardId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    BoardController.deleteBoard
)

router.post('/:projectId/status',
    param('projectId').isMongoId().withMessage('ID no valido'),
    body('status').notEmpty().withMessage('El estado es obligatorio.'),
    handleInputErrors,
    ProjectController.updateStatus
)

export default router