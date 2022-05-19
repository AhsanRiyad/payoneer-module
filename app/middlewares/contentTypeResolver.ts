import { NextFunction, Request, Response } from "express";
import { formatError } from "./../helpers/responseFormatter";

export function acceptMultipartOnly(req: Request, res: Response, next: NextFunction){
    if(req.is('multipart/form-data')){
        next();
    }else{
        return res.status(400).json(formatError({message: 'Content Type must be multipart/form-data'}, 400));
    }
}