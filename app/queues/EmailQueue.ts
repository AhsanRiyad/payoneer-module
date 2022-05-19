import { connectQueue } from "../../config/bull";

const queueName = 'email-queue';
export const emailQueue = connectQueue(queueName);