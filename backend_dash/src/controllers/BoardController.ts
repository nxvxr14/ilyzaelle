import type { Request, Response } from "express";
import Board from "../models/Board";

export class BoardController {
    static createBoard = async (req: Request, res: Response) => {
        try {
            const board = new Board(req.body)
            // a la tarea le agrego el proyecto
            board.project = req.project.id
            // al proyecto le agrego la tarea
            req.project.boards.push(board.id)
            // como ya sabemos que board exist y proyecto existe, no necesitamos doble await, osea esperar que guarde una y despues otra, podemos guardar ambas a la vez y no habra problema
            /*
            await board.save()
            await req.project.save()
            */
            await Promise.allSettled([
                board.save(),
                req.project.save()
            ])
            res.send("[devMessage] Board initialized correctly.")
        } catch (error) {
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    static getProjectBoards = async (req: Request, res: Response) => {
        try {
            // cruzar informacion entre coleccciones
            // con populate y el nombre de la referencia para traer toda la refeerencia de proyecto cuando mire las boards
            const boards = await Board.find({ project: req.project.id }).populate('project')
            res.json(boards)
        } catch (error) {
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    static getBoardsById = async (req: Request, res: Response) => {
        try {
            //    console.log(board.project);
            //    console.log(req.project.id);
            res.json(req.board)
        } catch (error) {
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    static updateBoard = async (req: Request, res: Response) => {
        try {
            if (req.board.project.toString() !== req.project.id.toString()) {
                const error = new Error('Board not found.')
                return res.status(404).json({ error: 'There was an error.' })
            }
            const { boardType, boardName, boardConnect, boardInfo } = req.body
            await Board.findByIdAndUpdate(req.board._id, {
                $set: { boardType, boardName, boardConnect, boardInfo }
            })
            res.send('[devMessage] Project created successfully.')
        } catch (error) {
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    static updateActive = async (req: Request, res: Response) => {
        try {
            if (req.board.project.toString() !== req.project.id.toString()) {
                const error = new Error('Board not found.')
                return res.status(404).json({ error: 'There was an error.' })
            }
            const { active } = req.body
            await Board.findByIdAndUpdate(req.board._id, {
                $set: { active }
            })
            res.send('[devMessage] Project created successfully.')
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    static updateCode = async (req: Request, res: Response) => {
        try {
            if (req.board.project.toString() !== req.project.id.toString()) {
                const error = new Error('Board not found.')
                return res.status(404).json({ error: 'There was an error.' })
            }
            const { boardCode } = req.body
            // Use findByIdAndUpdate to update ONLY boardCode without triggering
            // full-document validation (which would fail if AIChatHistory has
            // entries with empty content — Mongoose required:true rejects '').
            await Board.findByIdAndUpdate(req.board._id, {
                $set: { boardCode }
            })
            res.send('[devMessage] Project created successfully.')
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'There was an error.' })
        }
    }


    // static updateCode = async (req: Request, res: Response) => {
    //     try {
    //         const { projectId } = req.params
    //         const project = await Project.findById(projectId)
    //         if (!project) {
    //             const error = new Error('Project not found')
    //             return res.status(404).json({ error: error.message })
    //         }
    //         const { status } = req.body
    //         project.status = status
    //         await project.save()
    //         res.send('[devMessage] Project created successfully.')
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    static deleteBoard = async (req: Request, res: Response) => {
        try {
            //    console.log(board.project);
            //    console.log(req.project.id);

            // aca solo elimino la board de la collecion de board pero tambien necesito eliminar la referencia de las boards asociadas a proyectos
            // para eliminar la referencia tambien 
            req.project.boards = req.project.boards.filter(board => board.toString() !== req.board.id.toString())
            Promise.allSettled([req.board.deleteOne(), req.project.save()])
            res.send("Board deleted.")
        } catch (error) {
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    /* AI Chat History per Board */

    static getAIChatHistory = async (req: Request, res: Response) => {
        try {
            res.json({ AIChatHistory: req.board.AIChatHistory })
        } catch (error) {
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    static addAIChatMessages = async (req: Request, res: Response) => {
        try {
            const { messages } = req.body
            // Use findByIdAndUpdate with $set to bypass Mongoose optimistic concurrency (versionKey).
            // req.board can become stale between rapid saves (e.g. BURN + chat save),
            // causing VersionError on req.board.save(). Atomic update avoids this entirely.
            await Board.findByIdAndUpdate(req.board._id, {
                $set: {
                    AIChatHistory: messages.map((msg: { role: string; content: string }) => ({
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date()
                    }))
                }
            })
            res.json({ message: 'Historial de chat actualizado' })
        } catch (error) {
            console.log('[BoardController.addAIChatMessages] Error:', error)
            res.status(500).json({ error: 'There was an error.' })
        }
    }

    static clearAIChatHistory = async (req: Request, res: Response) => {
        try {
            await Board.findByIdAndUpdate(req.board._id, {
                $set: { AIChatHistory: [] }
            })
            res.json({ message: 'Historial de chat eliminado' })
        } catch (error) {
            res.status(500).json({ error: 'There was an error.' })
        }
    }
}
