import { JobOptions } from "bull";
import { emailQueue } from "../queues/EmailQueue";
import { EmailRequest } from 'notifme-sdk';
import { sendEmail } from "../helpers/notifmeHelper";

const jobName: string = 'digest-email';

type IData = EmailRequest;

const jobOpts: JobOptions = {
    removeOnComplete: true
}

emailQueue.process(jobName, async (job, done) => {
    try{
        done(null, await sendEmail(job.data));
    }catch(err){
        done(new Error("Failed"));
    }
});

emailQueue.on("completed", async (job, result) => {
    try{
        console.log(`${job.name} is successfull with result: ${result}. Job id: ${job.id}. Ref Id: ${job.data.id}`);
    }catch(err){
        console.log(err);
    }
});

emailQueue.on("error", (error) => {
    console.log(error.message);
});

export function addJob(data: IData, options?: JobOptions){
    emailQueue.add(jobName, data, {...jobOpts, ...options});
}