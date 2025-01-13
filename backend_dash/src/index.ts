// import server from './server'

// const port = process.env.PORT || 3000

// server.listen(port, () => {
//     console.log(`[devMessage] REST API running on the port. ${port}`) 
// })

import ServerApp from "./config/server";

const server = new ServerApp()

server.execute()