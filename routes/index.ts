import { Request, Response } from "express";
import Router from 'express';
import { apiRouter } from './apiRouter';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({status: "success", message: 'Server is online'});
});

router.use('/api', apiRouter);
export default router;
