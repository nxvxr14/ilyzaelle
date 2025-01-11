import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import morgan from 'morgan';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes';
import snippetRoutes from './routes/snippetRoutes';

dotenv.config()

connectDB()

const app = express()
app.use(cors(corsConfig))

// con morgan logeamos todas las consultas y con react querys evitamos hacer peticiones innecesarias
// Logging
app.use(morgan('dev'))

// Leer datos del formulario
app.use(express.json({limit: '5mb'})); // Adjust the size as needed

//Routes
// Exponemos la direccion de la api para realizar las peticiones CRUD
app.use('/api/projects', projectRoutes) 
app.use('/api/snippets', snippetRoutes) 

export default app