import { Request, Response } from "express";
import Router from 'express';
import { v1Router } from "./v1Router";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({status: "success", message: 'api is online'});
});

router.use('/v1', v1Router);

export const apiRouter = router;