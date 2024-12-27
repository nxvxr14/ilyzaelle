import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes';
import snippetRoutes from './routes/snippetRoutes';

dotenv.config()

connectDB()

const app = express()
app.use(cors(corsConfig))

app.use(express.json())

//Routes
// Exponemos la direccion de la api para realizar las peticiones CRUD
app.use('/api/projects', projectRoutes) 
app.use('/api/snippets', snippetRoutes) 

export default app