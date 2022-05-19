import { Request, Response, NextFunction } from 'express';
import passport from '../helpers/passportjsHelper';

const SUCCESS_URL = '/api/v1/auth/social/login-success';
const FAILED_URL = '/api/v1/auth/social/login-failed';

export const SUCCESS_RETURN_URL = 'http://localhost:3000'; 
export const FAILED_RETURN_URL = 'http://localhost:3000'; 

export async function newLogin(req: Request, res: Response, next: NextFunction, provider: "google" | 'facebook' | 'github', scopes: string[] = ["profile"]){
    try{
        return passport.authenticate(provider,  { scope: scopes })(req, res, next);
    }catch(err){
        console.log(err);
    }
}

export async function callback(req: any, res: Response, next: NextFunction, provider: "google" | 'facebook' | 'github'){

    //here providing the callback function is optional and passport is supposed to take care of login by itself
    return passport.authenticate(provider, { 
        successRedirect: SUCCESS_URL,
        failureRedirect: FAILED_URL
    })(req, res, next);
}

export async function logoutFromCookieSession(req: Request){
    return req.logOut();
}