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
import { IDataVar } from "./DataVar";

// Este es el export basico de las variables en Ts
// aca se almacena un arreglo con todas las boards que pertenecen a cada projecto

// Interface para mensajes del chat de IA
export interface IAIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IProject extends Document {
  projectName: string;
  description: string;
  status: boolean;
  server: string;
  serverAPIKey: string;
  AIDash: string; // HTML generado por IA para el dashboard
  AIDashCode: string; // Codigo unico para acceso publico al dashboard
  AIChatHistory: IAIChatMessage[]; // Historial de chat con la IA
  // las boards de cada project
  // en boards solo se almacena el objectid del projecto al que pertecene cada board, pero en projects se hace un subdocumento con toda la informacion de las boards que pertenecen a cada projecto
  boards: PopulatedDoc<IBoard & Document>[];
  // para cuando consultemos el projecto podamos acceder a los datos de las variables globales cuando consultemos el projecto y no unicamente la referencia que se almacena en la base de datos
  // cruce de informacion
  dataVars: PopulatedDoc<IDataVar & Document>[];
}

// Este es el esquema para ingresar a MongoDB donde se realizan unas comprobaciones
const ProjectSchema: Schema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "N/A",
    },
    status: {
      type: Boolean,
      default: false,
    },
    server: {
      type: String,
      default: "localhost",
    },
    serverAPIKey: {
      type: String,
      default: "a9b3f0d5123b7a6e9f41c2d3",
    },
    AIDash: {
      type: String,
      default: "",
    },
    AIDashCode: {
      type: String,
      default: "",
    },
    AIChatHistory: {
      type: [{
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      }],
      default: [],
    },
    boards: [
      {
        type: Types.ObjectId,
        ref: "Board",
      },
    ],
    dataVars: [
      {
        type: Types.ObjectId,
        ref: "DataVar",
      },
    ],
  },
  { timestamps: true }
);

// Defino modelo y se registra en la instancia de Mongo
// Con el ProjectType se hace referencia al generic, yo quiero tener esas caracteristicas cuando haga referencia a los proyectos, esto es propio de Ts, en JS no existe
const Project = mongoose.model<IProject>("Project", ProjectSchema);
export default Project;
