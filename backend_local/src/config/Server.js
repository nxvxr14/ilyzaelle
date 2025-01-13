import express from "express";
import cors from "cors";
import pollingRoutes from "../routes/pollingRoutes.js";
import { corsConfig } from "./cors.js";
import dotenv from "dotenv";
import Sockets from "./Sockets.js";

/* REFACTORIZACION con clases */
dotenv.config();
class ServerApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
  }

  cors() {
    this.app.use(cors(corsConfig));
  }

  routes() {
    // Leer datos del formulario
    this.app.use(express.json());
    //Routes
    // // Exponemos la direccion de la api para realizar las peticiones CRUD
    // app.use('/api/projects', projectRoutes)
    // app.use('/api/snippets', snippetRoutes)
    this.app.use("/api/polling", pollingRoutes);
  }

  socketsConfiguration() {
    new Sockets(process.env.SOCKETSERVER_URL, process.env.SERVERAPI_KEY);
  }

  execute() {
    //inicializar server
    this.app.listen(this.port, () => {
      console.log(`[devMessage] REST API running on the port. ${this.port}`);
    });
    this.cors(); //inciializar cors
    this.routes(); //inicializar rutas
    this.socketsConfiguration(); // Inicializar configuración de sockets
  }
}

export default ServerApp;


/* version vieja
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
*/