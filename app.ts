import bodyParser from 'body-parser';
import { NextFunction, Request, Response } from "express";
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import routes from './routes';
import cors from 'cors';
import * as dotenv from "dotenv";
import { AddressInfo } from 'net';

dotenv.config();


const app = express();
app.use(cookieParser("superdupersecret"));

app.use(
    cookieSession({ name: "session", keys: ["superdupersecret"], maxAge: 24 * 60 * 60 * 100 })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

app.use('/', (req: Request, res:Response, next: NextFunction) => {
    next();
});

app.use('/', routes);

const server = app.listen(process.env.PORT || 8001, () => {
    let binding: string | number | AddressInfo | null;
    if(typeof server.address() === 'string'){
        binding = server.address();
    }else{
        let addr = server.address() as AddressInfo;
        binding = addr.port;
    }
    console.log(`Listening Backend API on port ${binding}`);
});

// console.log(require('crypto').randomBytes(64).toString('hex'));
