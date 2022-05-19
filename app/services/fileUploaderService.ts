import { generateRandomStr } from "../helpers/strHelper";
import { uploader } from "../helpers/fileHelper";
import { imageMimes, docMimes } from "../enums/FileMimes";
import { Request, Response } from "express";
import multer from "multer";


export async function uploadFile(req: Request, res: Response, fieldNames: [{
    name: string, 
    type: 'identification_doc' | 'icon', 
    maxCount: number 
}]): Promise<{req: Request, res: Response}>{
    return new Promise<{req: Request, res: Response}>(async(resolve, reject) => {
        const timestamp = Date.now();
        let disk = 'public';
    
        const disks:{
            [key: string]: string
        } = {};
    
        const folders:{
            [key: string]: string
        } = {};
    
        const file_ids:{
            [key: string]: string
        } = {};
    
        const file_mimes:{
            [key: string]: string[]
        } = {};
    
        fieldNames.forEach((fieldName) => {
            disks[fieldName.name] = disk;
            if(fieldName.type == 'identification_doc'){
                folders[fieldName.name] = '/uploads/identification'
                file_mimes[fieldName.name] = [...imageMimes, ...docMimes];
            }else{
                folders[fieldName.name] = '/uploads'
                file_mimes[fieldName.name] = imageMimes;
            }
            file_ids[fieldName.name] = generateRandomStr(10) + '-' + timestamp;
        });

        try{
            const upload = uploader(disks, folders, file_ids, file_mimes).fields(fieldNames);

            upload(req, res, function(err){
                if(err){
                    return reject(err);
                }else{
                    return resolve({
                        req,
                        res
                    })
                }
            });
        }catch(err){
            return reject(err);
        }
    });
}