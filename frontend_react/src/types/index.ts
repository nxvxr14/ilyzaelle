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
  boardType: z.number(),
  boardName: z.string(),
  boardConnect: z.number(),
  boardInfo: boardInfoSchema, // Usamos el schema para boardInfo
  active: z.boolean().optional(),
  boardCode: z.string().optional(),
  project: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/* Snippets */
export const SnippetSchema = z.object({
  _id: z.string(),
  snippetName: z.string(),
  payload: z.string().optional(),
  description: z.string(),
  version: z.number(),
  busy: z.boolean(),
});

export const dashboardSnippetSchema = z.array(
  SnippetSchema.pick({
    _id: true,
    snippetName: true,
    payload: true,
    description: true,
    version: true,
    busy: true,
  })
);

/* Proyectos */
export const projectSchema = z.object({
  _id: z.string(),
  projectName: z.string(),
  description: z.string(),
  status: z.boolean(),
  host: z.string(),
  serverAPIKey: z.string()
});

export const dashboardProjectSchema = z.array(
  projectSchema.pick({
    _id: true,
    projectName: true,
    description: true,
    status: true,
    host: true,
    serverAPIKey: true
  })
);

/* globarVars */

/* Snippets */
export const dataVarSchema = z.object({
  // usamos types porque hace referencia a que es un objeto de mongo, dado que el dato del projecto al que pertenece el dato es un objectId
  _id: z.string(),
  nameGlobalVar: z.string(),
  nameData: z.string(),
  description: z.string().optional(),
  gVar: z.array(z.any()), // or specify the exact type you want to store in the array
  project: z.string(),
  createdAt: z.string(),
});

export type AddGlobalVarFormData = {
  nameGlobalVar: string;
  initialValue: number | boolean | [];
  typeGlobalVar: string;
};

// cuando creo un proyecto no requiero el id, este se genera hasta que tengo la respuesta de la api, para no generar diferentes Schemas se hace lo siguiente
// al usar tyeof pero la consulta y una vez que se conecte a internet ya no puede inferir correctamente la informacion
export type Project = z.infer<typeof projectSchema>;
export type Board = z.infer<typeof boardSchema>;
export type Snippet = z.infer<typeof SnippetSchema>;
export type DataVar = z.infer<typeof dataVarSchema>;
// para el formulario del proyecto requerimos un type, NO UN SCHEMA
//se utiliza el utility type de pick porque si utiliza omit tendria que volver a cambiar el codigo, como el formulario solo necesita estos campos y si llegara a requerir mas no deberia cambiar
// si uso omit y agrego cosas a mi schema me toca cambiar codigo, con pick esto no sucede
export type ProjectFormData = Pick<
  Project,
  "projectName" | "description" | "host" | "serverAPIKey"
>;
export type BoardFormData = Pick<
  Board,
  "boardType" | "boardName" | "boardConnect" | "boardInfo"
>;
export type PollingBoardFormData = Pick<
  Board,
  | "_id"
  | "boardType"
  | "boardName"
  | "boardConnect"
  | "boardInfo"
  | "active"
  | "project"
  | "boardCode"
>;
export type PollingCodesFormData = Pick<Board, "project" | "_id" | "boardCode">;
export type CodeEditorFormData = Pick<Board, "boardCode">;
export type SnippetFormData = Pick<
  Snippet,
  "snippetName" | "description" | "version"
>;
export type DataVarFormData = Pick<
  DataVar,
  "nameGlobalVar" | "nameData" | "description" | "gVar">

  export type SaveGlobalVarFormData = Pick<DataVar, "nameData" | "description" >;
