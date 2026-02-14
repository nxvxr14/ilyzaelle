import mongoose, { Document, Schema, Types } from "mongoose";

// cada board debe tener un proyecto, y un proyecto puede tener multiples boards

// PARA REFACTORIZACION
// no se almacena lo primero, solo lo que va despues de la llave
/*
const boardTypes = {
    ARDUINO_UNO: 1,
    PLC328P: 2
} as const

export type BoardTypes = typeof boardTypes[keyof typeof boardTypes]
*/

export interface IAIChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface IBoard extends Document {
    boardType: 1 | 2 | 3 | 4 | 5 | 6, // 1 = ARDUINO , 2 = XELORIUM , 3 = ESP32, 4 = HTTP, 5 = MQTT, 6 = FACTORYIO
    // boardType: BoardTypes
    boardName: string
    boardConnect: number
    boardInfo: object
    active: boolean,
    boardCode: string,
    project: Types.ObjectId,
    AIChatHistory: IAIChatMessage[]
}

export const BoardSchema: Schema = new Schema({
    boardType: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5, 6]
        // enum: Object.values(boardTypes)
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
    active: {
        type: Boolean,
        default: false
    },
    boardCode: {
        type: String,
        trim: true,
        default: ''
    },
    project: {
        // Aca se almacena la referencia del project.Id
        // cada board va a tener la informacion del proyecto al cual pertenece
        // aca se relaciona boards con projectos
        type: Types.ObjectId,
        ref: 'Project'
    },
    AIChatHistory: {
        type: [{
            role: { type: String, enum: ['user', 'assistant'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        }],
        default: [],
    }
}, { timestamps: true })

const Board = mongoose.model<IBoard>('Board', BoardSchema)
export default Board
