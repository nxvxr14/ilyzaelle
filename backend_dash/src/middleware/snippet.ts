import { Request, Response, NextFunction, response } from "express";
import Snippet, { ISnippet } from "../models/Snippet";

// las interfaces en vez de escribir van agregando la informacion de otras interfaces con el mismo nombre a la global
// por eso usamos declare global para agregar un dato a la variable req sin perder lo anterior
// un type no permite esto, sobreescribe y no se puede duplicar

declare global {
    namespace Express {
        interface Request {
            snippet: ISnippet
        }
    }
}

export async function snippetExists(req: Request, res: Response, next: NextFunction) {
    // el req es una buena forma de compartir datos de una ruta a otra, de un middleware a un controlador por ejemplo
    try {
        const { snippetId } = req.params
        const snippet = await Snippet.findById(snippetId)
        if (!snippet) {
            const error = new Error('Snippet not found')
            return res.status(404).json({ error: error.message })
        }
        req.snippet = snippet
        next()
    } catch (error) {
        res.status(500).json({ error: 'There was an error.' })
    }
} 