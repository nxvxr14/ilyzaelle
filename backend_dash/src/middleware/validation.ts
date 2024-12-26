// Es una forma en express se ejecuta este codigo antes del createProyect, funciones que se ejecutan en las peticiones http
// el resultado de una validacion lo obtengo de express-validator por medio de validator results
// como esta validacion se ejecuta en el router, los posibles errores se encuentran en el req
// la ponemos la validacion sobre un middleware para que sea reutilizable y la podamos utilizar en cualquier formulario 

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleInputErrors = (req : Request, res : Response, next : NextFunction) => {

    let errors = validationResult(req)
    if(!errors.isEmpty()){
        // retornamos posibles errores, de lo contrario continuamos al siguiente middelware

        return res.status(400).json({ errors : errors.array() })
    }

    next()

}

