import mongoose, { Schema, Document, Types } from "mongoose";

// cuando se trabaja con inferfaces se recomienda empezar por I el nombre de las mismas
export interface IDataVar extends Document {
  nameGlobalVar: string;
  nameData: string;
  description: string;
  gVar: [];
  // usamos types porque hace referencia a que es un objeto de mongo, dado que el dato del projecto al que pertenece el dato es un objectId
  project: Types.ObjectId;
}

// Este es el esquema para ingresar a MongoDB donde se realizan unas comprobaciones
const ProjectSchema: Schema = new Schema(
  {
    nameGlobalVar: {
      type: String,
      trim: true,
      required: true,
    },
    nameData: {
      type: String,
      trim: true,
      required: true,
      unique: true, // Make nameData unique across all DataVar documents
      index: true,  // Add index for better query performance
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    gVar: {
      type: Array,
      required: true,
    },
    project: {
      // aca se almacena la referencia del project.Id
      type: Types.ObjectId,
      // la referencia de donde va a encontrar la informacion del projecto, nombre de la coleccion- nombre del modelo
      ref: "Project",
    },
  },
  { timestamps: true }
);

const DataVar = mongoose.model<IDataVar>("DataVar", ProjectSchema);
export default DataVar;
