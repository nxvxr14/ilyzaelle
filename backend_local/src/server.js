import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import pollingRoutes from './routes/pollingRoutes.js'
import {corsConfig} from './config/cors.js'

dotenv.config()

const app = express()
app.use(cors(corsConfig))

// Leer datos del formulario
app.use(express.json())

//Routes
// // Exponemos la direccion de la api para realizar las peticiones CRUD
// app.use('/api/projects', projectRoutes) 
// app.use('/api/snippets', snippetRoutes) 
app.use('/api/polling', pollingRoutes) 

export default app