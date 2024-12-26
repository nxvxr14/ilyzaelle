import mongoose, { Document, Schema, Types } from "mongoose";

// cada board debe tener un proyecto, y un proyecto puede tener multiples boards

export interface IBoard extends Document {
    boardType: string
    boardName: string
    boardConnect: number
    boardInfo: object
    modeLocal: boolean,
    project: Types.ObjectId
}

export const BoardSchema : Schema = new Schema({
    boardType: {
        type: String,
        required: true,
        trim: true
    },
    boardName: {
        type: String,
        required: true,
        trim: true
    },
    boardConnect: {
        type: Number,
        required: true,
        min: 1
    },
    boardInfo: {
        type: Schema.Types.Mixed,
        required: true,
    },
    modeLocal: {
        type: Boolean,
        required: true,
    },
    project: {
        // Aca se almacena la referencia del project.Id
        // cada board va a tener la informacion del proyecto al cual pertenece
        // aca se relaciona boards con projectos
        type: Types.ObjectId,
        ref: 'Project'
    }
}, { timestamps : true })

const Board = mongoose.model<IBoard>('Board', BoardSchema)
export default Board