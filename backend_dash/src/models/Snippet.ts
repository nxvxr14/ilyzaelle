import mongoose, { Schema, Document } from "mongoose";

export interface ISnippet extends Document {
    snippetName: string,
    payload: string,
    description: string,
    version: number,
    busy: boolean
}

const SnippetSchema: Schema = new Schema({
    snippetName: {
        type: String,
        trim: true,
        required: true
    },
    payload: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: "N/A"
    },
    version: {
        type: Number,
        required: true,
    },
    busy: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// Defino modelo y se registra en la instancia de Mongo
// Con el ProjectType se hace referencia al generic, yo quiero tener esas caracteristicas cuando haga referencia a los proyectos, esto es propio de Ts, en JS no existe
const Snippet = mongoose.model<ISnippet>('Snippet', SnippetSchema)
export default Snippet 
