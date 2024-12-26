import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes';
import snippetRoutes from './routes/snippetRoutes';

dotenv.config()

connectDB()

const app = express()

app.use(express.json())

//Routes
// Exponemos la direccion de la api para realizar las peticiones CRUD
app.use('/api/projects', projectRoutes) 
app.use('/api/snippets', snippetRoutes) 

export default app