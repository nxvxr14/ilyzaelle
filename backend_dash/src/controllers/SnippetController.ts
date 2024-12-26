import type { Request, Response } from "express"
import Snippet from "../models/Snippet";

export class SnippetController {
    static createSnippet = async (req: Request, res: Response) => {
        const snippet = new Snippet(req.body)
        try {
            await snippet.save()
            res.send('[devMessage] Snippet created successfully.')
        } catch (error) {
            console.log(error);

        }
    }
    static getAllSnippets = async (req: Request, res: Response) => {
        // Este caso no necesita validador porque solo es para mostrar, no para escribir en base de datos 
        try {
            const snippets = await Snippet.find({})
            res.json(snippets)
            // res.send('[devMessage] All snippets')
        } catch (error) {
            console.log(error);
        }
    }

    static getSnippetById = async (req: Request, res: Response) => {
        // el id se recupera con los params
        // Este caso no necesita validador porque solo es para mostrar, no para escribir en base de datos 
        try {
            // se pone en populate el nombre de la referencia el schema
            res.json(req.snippet)
            // res.send('[devMessage] All snippets')
        } catch (error) {
            console.log(error);
        }
    }

    static updateSnippet = async (req: Request, res: Response) => {
        try {
            req.snippet.set({ ...req.body })
            await req.snippet.save()
            res.json(req.snippet)
        } catch (error) {
            console.log(error);
        }
    }

    static updateBusy = async (req: Request, res: Response) => {
        try {
            const { busy } = req.body
            req.snippet.busy = busy
            await req.snippet.save()
            res.send('[devMessage] Busy uptate.')
        } catch (error) {
            console.log(error);
        }
    }

    static deleteSnippet = async (req: Request, res: Response) => {
        try {
            await req.snippet.deleteOne();
            res.json(req.snippet)
        } catch (error) {
            console.log(error);
        }
    }
}