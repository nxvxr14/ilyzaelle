import type { Request, Response } from "express"
import Project from "../models/Project";
import crypto from "crypto";

// Funcion para generar un codigo unico de 8 caracteres
const generateUniqueCode = (): string => {
    return crypto.randomBytes(4).toString('hex');
};

// Los controladors siempre son clases para una mejor organizaccion, van a ser metodos estaticos para no ser instanciados

export class ProjectController {
    //CRUD
    static createProject = async (req: Request, res: Response) => {
        console.log(req.body);
        const project = new Project(req.body)
        try {
            await project.save()
            // Esta es otra forma de guardar pero no tengo acceso mas adelante a algunos metodos, por eso es mejor instanciar la clase, la forma de abajo es un metodo estatico
            // await Project.create(req.body)
            res.send('proyecto creado')
        } catch (e) {
            const error = new Error("nombre duplicado")
            return res.status(404).json({
                error: error.message
            })
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        // Este caso no necesita validador porque solo es para mostrar, no para escribir en base de datos 
        try {
            const projects = await Project.find({})
            res.json(projects)
            // res.send('[devMessage] All projects')
        } catch (error) {
            console.log(error);
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        // el id se recupera con los params
        // Este caso no necesita validador porque solo es para mostrar, no para escribir en base de datos 
        const { projectId } = req.params
        try {
            // se pone en populate el nombre de la referencia el schema
            const project = await Project.findById(projectId).populate('boards').populate('dataVars')
            if (!project) {
                const error = new Error("proyecto no existe")
                return res.status(404).json({
                    error: error.message
                })
            }
            res.json(project)
            // res.send('[devMessage] All projects')
        } catch (error) {
            console.log(error);
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        // el id se recupera con los params
        // Este caso no necesita validador porque solo es para mostrar, no para escribir en base de datos 
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            project.set({ ...req.body })
            await project.save()
            res.send('proyecto actualizado')
        } catch (e) {
            const error = new Error("error")
            return res.status(404).json({
                error: error.message
            })
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { projectId } = req.params
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            const { status } = req.body
            project.status = status
            await project.save()
            res.send('[devMessage] Project created successfully.')
        } catch (error) {
            console.log(error);
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findByIdAndDelete(projectId)
            // aca iria la logica para verificar que este id de projecto si pertence a la persona que lo creo
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            res.send('eliminado')
        } catch (e) {
            const error = new Error("error")
            return res.status(404).json({
                error: error.message
            })
        }
    }

    // AIDash - Guardar HTML generado por IA
    static updateAIDash = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            const { AIDash } = req.body
            project.AIDash = AIDash
            await project.save()
            res.send('AIDash actualizado correctamente')
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al actualizar AIDash' })
        }
    }

    // AIDash - Obtener HTML generado por IA
    static getAIDash = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            res.json({ AIDash: project.AIDash, AIDashCode: project.AIDashCode })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al obtener AIDash' })
        }
    }

    // AIDash - Guardar HTML y generar codigo unico
    static updateAIDashWithCode = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            const { AIDash } = req.body
            project.AIDash = AIDash
            // Solo generar codigo si no existe uno
            if (!project.AIDashCode) {
                project.AIDashCode = generateUniqueCode()
            }
            await project.save()
            res.json({ 
                message: 'AIDash actualizado correctamente',
                AIDashCode: project.AIDashCode 
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al actualizar AIDash' })
        }
    }

    // AIDash - Obtener dashboard publico por codigo (sin autenticacion)
    static getAIDashByCode = async (req: Request, res: Response) => {
        const { dashCode } = req.params
        try {
            const project = await Project.findOne({ AIDashCode: dashCode })
            if (!project) {
                const error = new Error('Dashboard not found')
                return res.status(404).json({ error: error.message })
            }
            res.json({ AIDash: project.AIDash, projectName: project.projectName })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al obtener dashboard' })
        }
    }

    // AIChatHistory - Obtener historial de chat
    static getAIChatHistory = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            res.json({ AIChatHistory: project.AIChatHistory })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al obtener historial de chat' })
        }
    }

    // AIChatHistory - Agregar mensaje al historial
    static addAIChatMessage = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            const { role, content } = req.body
            project.AIChatHistory.push({
                role,
                content,
                timestamp: new Date()
            })
            await project.save()
            res.json({ message: 'Mensaje agregado al historial' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al agregar mensaje' })
        }
    }

    // AIChatHistory - Agregar multiples mensajes al historial (user + assistant)
    static addAIChatMessages = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            const { messages } = req.body // Array de { role, content }
            if (Array.isArray(messages)) {
                messages.forEach(msg => {
                    project.AIChatHistory.push({
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date()
                    })
                })
                await project.save()
            }
            res.json({ message: 'Mensajes agregados al historial' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al agregar mensajes' })
        }
    }

    // AIChatHistory - Limpiar historial (Nuevo Chat)
    static clearAIChatHistory = async (req: Request, res: Response) => {
        const { projectId } = req.params
        try {
            const project = await Project.findById(projectId)
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
            }
            project.AIChatHistory = []
            await project.save()
            res.json({ message: 'Historial de chat eliminado' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al limpiar historial' })
        }
    }
}