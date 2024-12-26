import { Request, Response, NextFunction, response } from "express";
import Board, { IBoard } from "../models/Board";

// las interfaces en vez de escribir van agregando la informacion de otras interfaces con el mismo nombre a la global
// por eso usamos declare global para agregar un dato a la variable req sin perder lo anterior
// un type no permite esto, sobreescribe y no se puede duplicar

declare global {
    namespace Express {
        interface Request {
            board: IBoard
        }
    }
}

export async function boardExist(req: Request, res: Response, next: NextFunction) {
    // el req es una buena forma de compartir datos de una ruta a otra, de un middleware a un controlador por ejemplo
    try {
        const { boardId } = req.params
        const board = await Board.findById(boardId)
        if (!board) {
            const error = new Error('Board not found')
            return res.status(404).json({ error: error.message })
        }
        req.board = board
        next()
    } catch (error) {
        res.status(500).json({ error: 'There was an error.' })
    }
}

export async function boardBelongsToProject(req: Request, res: Response, next: NextFunction) {
    // tener cuidado con los id de mongo, aveces lo evalua como objid, puede que sea elmismo id pero es bueno verificar
    if (req.board.project.toString() !== req.project.id.toString()) {
        const error = new Error('Board not found.')
        return res.status(404).json({ error: 'There was an error.' })
    }
    next()
}