import type { Knex } from "knex";
import { Model, QueryBuilder } from "objection";
import { VerificationCodes } from "./../@types/models";
import { getConnection } from '../services/dbConnectionManagerService';
import { removeItemOnce } from '../helpers/arrayHelper';

export const tableName: string = 'verification_codes';

export const properties: Array<string> = [
    'id',
    'code',
    'channel',
    'medium',
    'type',
    'attempts',
    'reference_id',
    'expires_in',
    'created_at',
    'updated_at',
];

type reform = {
    reference_id: number | string | null,
    type: string | "E-MAIL VERIFICATION" | "E-MAIL CHANGE VERIFICATION",
    channel: string | "SMS" | "E-MAIL",
}

type optional = {
    created_at: Date | null,
    updated_at: Date | null,
}
export type VerificationCodeType = ModelType<VerificationCodes, reform, optional>;

type thisType = VerificationCodeType;

export const getById = (model_id: string, includeCode: boolean = false) : Knex.QueryBuilder => {
    if(!includeCode){
        let withoutCode = removeItemOnce(properties, 'code');
        return getConnection().select(withoutCode).from<thisType>(tableName).where({id: model_id}).first();
    }
    return getConnection().select(properties).from<thisType>(tableName).where({id: model_id}).first();
}

export const getOne = (condition: object, includeCode: boolean = false) : Knex.QueryBuilder => {
    if(!includeCode){
        let withoutCode = removeItemOnce(properties, 'code');
        return getConnection().select(withoutCode).from<thisType>(tableName).where(condition).first();
    }
    return getConnection().select(properties).from<thisType>(tableName).where(condition).first();
}

export const insertOne  = (verificationCode: thisType, returnWithCode: boolean = false) : Knex.QueryBuilder => {
    if(!returnWithCode){
        let withoutCode = removeItemOnce(properties, 'code');
        return getConnection()<thisType>(tableName).insert(verificationCode).returning(withoutCode);
    }
    return getConnection()<thisType>(tableName).insert(verificationCode).returning(properties);
}

export const updateOne  = (model_id: string, verificationCode: thisType, returnWithCode: boolean = false) : Knex.QueryBuilder => {
    if(!returnWithCode){
        let withoutCode = removeItemOnce(properties, 'code');
        return getConnection()<thisType>(tableName).update(verificationCode).where({id: model_id}).returning(withoutCode);
    }
    return getConnection()<thisType>(tableName).update(verificationCode).where({id: model_id}).returning(properties);
}

export const queryBuilder = () : Knex.QueryBuilder => {
    return getConnection()<thisType>(tableName);
}

export interface VerificationCodeModel extends thisType{};
export class VerificationCodeModel extends Model {
    static get tableName() {
        return tableName;
    }
    static get relationMappings() {
        return {
            
        };
    }
    
}

export const VerificationCodeQuery = (): QueryBuilder<VerificationCodeModel, VerificationCodeModel[]> => {
    return VerificationCodeModel.query(getConnection());
}