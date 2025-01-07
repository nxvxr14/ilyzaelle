/*
import server from './server.js'

const port = process.env.PORT || 3000

server.listen(port, () => {
    console.log(`[devMessage] REST API running on the port. ${port}`) 
})
*/

import ServerApp from "./config/Server.js";

const server = new ServerApp()

server.execute()