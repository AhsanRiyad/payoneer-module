import { EmailRequest, NotificationStatus } from 'notifme-sdk';
import app_config from '../../config/app';
import { intersection } from "lodash";
import { sendEmail } from '../helpers/notifmeHelper';
import { addJob } from '../jobs/EmailDigestJob';

const queue : "redis" | "none" = "none";

const channels = ['mail'];

const getChannels = () : Array<string> => {
    //if any custom logic

    return channels;
}

const getQueue = () : "redis" | "none" => {
    //if any custom logic
    
    return queue;
}

type EmailData = {
    email?: string
}

type NotificationData = EmailData;

const emailRequest = (data: any) : EmailRequest => {
    return {
        from: app_config.email_from ?? 'sender@email.com', //specify sender email address
        to: data.email,
        subject: "Type Subject",
        text: "Successfully Logged in"
    }
}

export const mail = async (data: {receiver: EmailData, delay?: string, sync?: boolean, email?: string}) => {
    if(!data.receiver.email){
        if(!data.email) throw new Error('Email must be provided inside receiver object or as parameter to the function');

        data.receiver.email = data.email;
    }
    if(data.sync){
        return await sendEmail(emailRequest(data.receiver));
    }else{
        return await processQueue({ channel: "mail", queue: getQueue(), request: emailRequest(data.receiver), delay: data.delay});
    }
}

export const notify = async (data: { receiver: NotificationData, delay?: string, channels?: ["mail"] | string[], mediums?: {email?: string} }) => {
    try{
        if(!data.channels){
            data.channels = getChannels();
        }else{
            data.channels = intersection(channels, getChannels());
        }
        const resposnes: {
            mail?: NotificationStatus
        } = {}; 
        data.channels.forEach( async channel => {
            if(channel == 'mail'){
                resposnes.mail = await mail({receiver: data.receiver, delay: data.delay});
            }
        });

        return resposnes;
    }catch(err){
        throw(err);
    }
}

const processQueue = async (data: {channel: "mail", queue: "none" | "redis", request: any, delay?: string}) => {
    if(data.queue == 'none'){
        return await sendEmail(data.request);
    }else if(data.queue == 'redis'){
        addJob(data.request);

        return {
            status: "success",
            info: 'Request has been added to the queue'
        } as NotificationStatus;
    }
}