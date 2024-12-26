import { Request, Response, NextFunction, response } from "express";
import Project, { IProject } from "../models/Project";

// las interfaces en vez de escribir van agregando la informacion de otras interfaces con el mismo nombre a la global
// por eso usamos declare global para agregar un dato a la variable req sin perder lo anterior
// un type no permite esto, sobreescribe y no se puede duplicar

declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
    // el req es una buena forma de compartir datos de una ruta a otra, de un middleware a un controlador por ejemplo
    try {
        const { projectId } = req.params
        const project = await Project.findById(projectId)
        if (!project) {
            const error = new Error('Project not found')
            return res.status(404).json({ error: error.message })
        }
        req.project = project
        next()
    } catch (error) {
        res.status(500).json({ error: 'There was an error.' })
    }
} 