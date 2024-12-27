import { z } from "zod";

// aca se define el Schema del proyecto para ts, si fuera js no se necesitaria

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
// para el formulario del proyecto requerimos un type, NO UN SCHEMA
//se utiliza el utility type de pick porque si utiliza omit tendria que volver a cambiar el codigo, como el formulario solo necesita estos campos y si llegara a requerir mas no deberia cambiar
// si uso omit y agrego cosas a mi schema me toca cambiar codigo, con pick esto no sucede
export type ProjectFormData = Pick<Project, 'projectName' | 'description'>