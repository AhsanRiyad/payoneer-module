import * as otpGenerator from "otp-generator";
import { isEmail } from './../helpers/emailHelper';
import { nanoid } from 'nanoid';
import { validate } from "../helpers/validatorHelper";
import VerificationCodeSchema from './../schema/VerificationCodeSchema.json';
import { insertOne, VerificationCodeType, getOne, updateOne, VerificationCodeModel } from "../models/VerificationCode";
import { comparePassword, hashPassword } from '../helpers/authHelper';
import { generateToken } from '../helpers/jwtHelper';

function makeExpireDate(lifeInMinutes: number){
    return new Date(Date.now() + lifeInMinutes * 60000);
}

function isExpired(verificationCode: VerificationCodeType | VerificationCodeModel): boolean{
    if((verificationCode.expires_in < new Date()) || (verificationCode.attempts >= 4)){
        return true;
    }
    return false;
}


export async function generateAndSendOtp(channel: 'SMS' | 'E-MAIL', medium: string, purpose: 'E-MAIL VERIFICATION', reference_id: number) : Promise<VerificationCodeType|VerificationCodeModel>{
    return new Promise<VerificationCodeType|VerificationCodeModel>((resolve, reject)=>{
        medium = medium.trim();
        if(channel == 'E-MAIL' && isEmail(medium)){
            let code = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
            const otp: VerificationCodeType = {
                id: nanoid(10),
                channel: channel,
                medium: medium,
                type: purpose,
                attempts: 0,
                code: hashPassword(code),
                expires_in: makeExpireDate(10),
                reference_id: reference_id
            }
            const errors = validate(VerificationCodeSchema, otp);
            if(!errors){
                insertOne(otp).then((data: Array<VerificationCodeType>) => {
                    //send otp via email
                    console.log(data[0], code);
    
                    return resolve(data[0]);
                }).catch((err) => {
                    return reject({ message: 'Something went wrong' });
                });
            }else{console.log(otp.expires_in);
                return reject(errors);
            }
        }else{
            return reject({ message: 'Invalid Medium' });
        }
    });
}

export async function generateAndResendOtp(verification_code_id: string) : Promise<VerificationCodeType|VerificationCodeModel>{
    return new Promise<VerificationCodeType|VerificationCodeModel>((resolve, reject)=>{
        
    });
}

export async function verifyOtp(verification_code_id: string, code: string) : Promise<string>{
    return new Promise<string>((resolve, reject)=>{
        try{
            getOne({ id: verification_code_id }, true).then(async (data: VerificationCodeType | null) => {
                if(!data){
                    return reject({message: 'Invalid Verification Session'});
                }
                if(isExpired(data)){
                    return reject({message: 'OTP expired'});
                }

                if(comparePassword(code, data.code)){
                    return resolve(generateToken({
                        id: data.id,
                        type: data.type,
                        reference_id: data.reference_id,
                        medium: data.medium
                    }, '1d'));
                }else{
                    data.attempts = data.attempts + 1;
                    const updated = await updateOne(data.id, data, true);
                    return reject({message: 'OTP does not match', attempts: updated[0].attempts});
                }
            }).catch(err => {
                return reject({message: 'Invalid Request'});
            });
        }catch(err) {
            return reject({message: 'Something went wrong'});
        }

    });
}

export async function getVerificationCode(verification_code_id: string) : Promise<VerificationCodeType|VerificationCodeModel>{
    return new Promise<VerificationCodeType|VerificationCodeModel>((resolve, reject)=>{
        
    });
}