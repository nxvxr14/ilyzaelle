import { Router } from "express";
import { handleInputErrors } from "../middleware/validation";
import { body, param } from "express-validator";
import { SnippetController } from "../controllers/SnippetController";
import { snippetExists } from "../middleware/snippet";

const router = Router()

router.post('/',
    body('snippetName').
        notEmpty().withMessage('El codigo no puede estar vacio.'),
    body('description').
        notEmpty().withMessage('El codigo no puede estar vacio.'),
    body('version').
        notEmpty().withMessage('La version del codigo es obligatoria.'),
    handleInputErrors,
    SnippetController.createSnippet
)

router.get('/', SnippetController.getAllSnippets)

router.param('snippetId', snippetExists)

router.get('/:snippetId',
    param('snippetId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    SnippetController.getSnippetById
)

router.put('/:snippetId',
    param('snippetId').isMongoId().withMessage('ID no valido'),
    body('snippetName').
        notEmpty().withMessage('El codigo no puede estar vacio.'),
    body('payload').
        notEmpty().withMessage('El codigo no puede estar vacio.'),
    body('version').
        notEmpty().withMessage('La version del codigo es obligatoria.'),
    handleInputErrors,
    SnippetController.updateSnippet
)

router.post('/:snippetId/busy',
    param('snippetId').isMongoId().withMessage('ID no valido'),
    body('busy').notEmpty().withMessage('El estado es obligatorio.'),
    handleInputErrors,
    SnippetController.updateBusy
)

router.delete('/:snippetId',
    param('snippetId').isMongoId().withMessage('ID no valido'),
    SnippetController.deleteSnippet
)
export default router