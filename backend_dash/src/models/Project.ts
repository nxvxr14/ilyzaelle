/*
nxvxr14
23/12/24
*/

// MCV - Model, View, Controller
// model - encargado con el CRUD, relacionado con ODM, base de datos
// view - se encarga de mostrar los resultados, frontend
// controller - se encarga de llamar el modelo y los metodos necesarios y se encarga de devolver los datos al view, intermediario

import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import { IBoard } from "./Board";

// Este es el export basico de las variables en Ts
// aca se almacena un arreglo con todas las boards que pertenecen a cada projecto

export interface IProject extends Document {
    projectName: string,
    description: string,
    status: boolean,
    server: string
    // las boards de cada project
    // en boards solo se almacena el objectid del projecto al que pertecene cada board, pero en projects se hace un subdocumento con toda la informacion de las boards que pertenecen a cada projecto
    boards: PopulatedDoc<IBoard & Document>[]
}

// Este es el esquema para ingresar a MongoDB donde se realizan unas comprobaciones
const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: "N/A"
    },
    status: {
        type: Boolean,
        default: false
    },
    server: {
        type: String,
        default: "localhost:4040"
    },
    boards: [
        {
            type: Types.ObjectId,
            ref: 'Board'
        }
    ]
}, { timestamps: true })

// Defino modelo y se registra en la instancia de Mongo
// Con el ProjectType se hace referencia al generic, yo quiero tener esas caracteristicas cuando haga referencia a los proyectos, esto es propio de Ts, en JS no existe
const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project