import { Request, Response } from "express";
import Router from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({status: "success", message: 'api/v1 is online'});
});


export const v1Router = router;
