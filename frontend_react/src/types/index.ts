import { z } from "zod";

// aca se define el Schema del proyecto para ts, si fuera js no se necesitaria

/* Boards */
const boardInfoSchema = z.object({
    host: z.string().optional(),
    port: z.string(),
    type: z.string().optional(),
  });

export const boardSchema = z.object({
    _id: z.string(),
    boardType: z.string(),
    boardName: z.string(),
    boardConnect: z.number(),
    boardInfo: boardInfoSchema,  // Usamos el schema para boardInfo    
    active: z.boolean().optional(),
    boardCode: z.string().optional(),
    project: z.string(),
})

/* Snippets */
export const SnippetSchema = z.object({
    _id: z.string(),
    snippetName: z.string(),
    payload: z.string().optional(),
    description: z.string(),
    version: z.number(),
    busy: z.boolean(),
})

export const dashboardSnippetSchema = z.array(
    SnippetSchema.pick({
        _id: true,
        snippetName: true,
        payload: true,
        description: true,
        version: true,
        busy: true
    })
)

/* Proyectos */
export const projectSchema = z.object({
    _id: z.string(),
    projectName: z.string(),
    description: z.string(),
    status: z.boolean(),
})

export const dashboardProjectSchema = z.array(
    projectSchema.pick({
        _id: true,
        projectName: true,
        description: true,
        status: true
    })
)




// cuando creo un proyecto no requiero el id, este se genera hasta que tengo la respuesta de la api, para no generar diferentes Schemas se hace lo siguiente
export type Project = z.infer<typeof projectSchema>
export type Board = z.infer<typeof boardSchema>
export type Snippet = z.infer<typeof SnippetSchema>
// para el formulario del proyecto requerimos un type, NO UN SCHEMA
//se utiliza el utility type de pick porque si utiliza omit tendria que volver a cambiar el codigo, como el formulario solo necesita estos campos y si llegara a requerir mas no deberia cambiar
// si uso omit y agrego cosas a mi schema me toca cambiar codigo, con pick esto no sucede
export type ProjectFormData = Pick<Project, 'projectName' | 'description'>
export type BoardFormData = Pick<Board, 'boardType' | 'boardName' | 'boardConnect' | 'boardInfo'>
export type SnippetFormData = Pick<Snippet, 'snippetName' | 'description' | 'version'>
