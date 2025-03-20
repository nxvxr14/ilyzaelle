// import express from 'express'
// import dotenv from 'dotenv'
// import cors from 'cors';
// import morgan from 'morgan';
// import { corsConfig } from './cors';
// import { connectDB } from './db'
// import projectRoutes from '../routes/projectRoutes';
// import snippetRoutes from '../routes/snippetRoutes';

// dotenv.config()

// connectDB()

// const app = express()
// app.use(cors(corsConfig))

// // con morgan logeamos todas las consultas y con react querys evitamos hacer peticiones innecesarias
// // Logging
// app.use(morgan('dev'))

// // Leer datos del formulario
// app.use(express.json({limit: '5mb'})); // Adjust the size as needed

// //Routes
// // Exponemos la direccion de la api para realizar las peticiones CRUD
// app.use('/api/projects', projectRoutes)
// app.use('/api/snippets', snippetRoutes)

// export default app
/* REFACTORIZACION con clases */

import morgan from "morgan";
import express from "express";
import http from "http";
import cors from "cors";
import { connectDB } from "./db";
import projectRoutes from "../routes/projectRoutes";
import snippetRoutes from "../routes/snippetRoutes";
import { corsConfig } from "./cors";
import { corsConfigServer } from "./corsSocket";
import dotenv from "dotenv";
import { Server } from "socket.io";
import Sockets from "./sockets";

class ServerApp {
  app: express.Application;
  port: string | number;
  server: http.Server;
  io: Server;

  constructor() {
    dotenv.config();
    connectDB();
    this.app = express();
    // // con morgan logeamos todas las consultas y con react querys evitamos hacer peticiones innecesarias
    // // Logging
    this.app.use(morgan("dev"));
    this.port = process.env.PORT || 3000;
    // configuraciones de sockets
    this.server = http.createServer(this.app);
    //configuracion de sockets
    this.io = new Server(this.server, {
      cors: corsConfigServer, // Aquí pasamos corsConfig directamente a Socket.IO
    });
  }

  cors() {
    this.app.use(cors(corsConfig));
  }

  routes() {
    // Leer datos del formulario
    this.app.use(express.json({ limit: "5mb" })); // Adjust the size as needed
    // //Routes
    // Exponemos la direccion de la api para realizar las peticiones CRUD
    this.app.use("/api/projects", projectRoutes);
    this.app.use("/api/snippets", snippetRoutes);
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
