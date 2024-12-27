import { CorsOptions } from 'cors';

//origin es de donde se presenta la peticion: url de react y callback es lo que permite la conexion
export const corsConfig: CorsOptions = {
    // para peticiones de cualquier lado temporalmente
    //    origin: '*'
    origin: function(origin, callback) {
        const whitelist = [process.env.FRONTEND_URL]
        if(whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS error'))
        }
    }
}