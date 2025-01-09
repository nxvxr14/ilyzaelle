import express from "express";
import http from "http";
import cors from "cors";
import pollingRoutes from "../routes/pollingRoutes.js";
import { corsConfig } from "./cors.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import Sockets from "./Sockets.js";
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

/* REFACTORIZACION con clases */
class ServerApp {
  constructor() {
    dotenv.config();
    this.app = express();
    this.port = process.env.PORT || 3000;
    // configuraciones de sockets
    this.server = http.createServer(this.app);
    //configuracion de sockets
    this.io = new Server(this.server, {
      cors: corsConfig // Aquí pasamos corsConfig directamente a Socket.IO
    });
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
    new Sockets(this.io);
  }

  execute() {
    //inicializar server
    this.server.listen(this.port, () => {
      console.log(`[devMessage] REST API running on the port. ${this.port}`);
    });
    this.cors(); //inciializar cors
    this.routes(); //inicializar rutas
    this.socketsConfiguration(); // Inicializar configuración de sockets
  }
}

export default ServerApp;



