import mongoose from 'mongoose';
import { exit } from 'node:process'

export const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.host}:${connection.port}` 
        console.log(`[devMessage] Mongo Atlas connect on ${url}`);
        
        
    } catch (error) {
        // console.log(error.message)
        console.log(`[devMessage] Could not connect to the database.`);
        
       exit(1) 
    }
}