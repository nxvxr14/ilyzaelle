import type { Request, Response } from "express"
import Project from "../models/Project";

// Los controladors siempre son clases para una mejor organizaccion, van a ser metodos estaticos para no ser instanciados

export class ProjectController {
    //CRUD
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

    static createProject = async (req: Request, res: Response) => {
        console.log(req.body);
        const project = new Project(req.body)
        try {
            await project.save()
            // Esta es otra forma de guardar pero no tengo acceso mas adelante a algunos metodos, por eso es mejor instanciar la clase, la forma de abajo es un metodo estatico
            // await Project.create(req.body)
            res.send('[devMessage] Project created successfully.')
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
            const project = await Project.findById(projectId).populate('boards')
            if (!project) {
                const error = new Error('Project not found')
                return res.status(404).json({ error: error.message })
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
            res.json(project)
            // res.send('[devMessage] All projects')
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
            res.json(project)
            // res.send('[devMessage] All projects')
        } catch (error) {
            console.log(error);
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
}