import knex from 'knex';
import type { Knex } from 'knex';
import { DbManagerFactoryConfig } from 'knex-db-manager';
const knexDbManager = require("../helpers/knex-db-manager/lib");
import { getNamespace, createNamespace } from 'continuation-local-storage';
import { db, config } from './../../config/database'; 
import Tenant from 'app/interfaces/tenant';
import TenantConfig from 'app/interfaces/tenantConfig';
import { NanoId } from 'app/@types/nanoid';
import * as dotenv from "dotenv";
import { getTenantList, updateTenant } from './tenantService';
import OrganizationTypes from '../enums/OrganizationType';
import { patchTenant } from "./tenantService";
import { TenantType } from '../models/Tenant';

dotenv.config();

let tenantMapping: Array<TenantConfig>;

const connection = <Object>config.connection;

const getConfig = (tenant: Tenant) => {   
  const { db_host, db_port, db_username, db_name, db_password, type } = tenant;   
  return {     
    ...config,    
    connection: {       
      ...connection,
      host: db_host,
      port: db_port,       
      user: db_username,       
      database: db_name,     
      password: db_password   
    },
    migrations: {
      tableName: "knex_migrations",
      directory: type == OrganizationTypes.ECOMMERCE ? __dirname + "../../../database/migrations/tenant/e-commerce" : __dirname + "../../../database/migrations/tenant/platform" 
    },
    seeds: {
      directory: type == OrganizationTypes.ECOMMERCE ? __dirname + "../../../database/seeders/tenant/e-commerce" : __dirname + "../../../database/seeders/tenant/platform"
    }
  }
} 

const getDbManagerConfig = (tenant: Tenant) => {   
  const { db_host, db_port, db_username, db_name, db_password, type } = tenant; 
   
  return {
    knex:{
      ...config,    
      connection: {       
        ...connection,
        host: db_host,
        port: db_port,       
        user: db_username,       
        database: db_name,     
        password: db_password   
      },
      migrations: {
        tableName: "knex_migrations",
        directory: type == OrganizationTypes.ECOMMERCE ? __dirname + "../../../database/migrations/tenant/e-commerce" : __dirname + "../../../database/migrations/tenant/platform" 
      },
      seeds: {
        directory: type == OrganizationTypes.ECOMMERCE ? __dirname + "../../../database/seeders/tenant/e-commerce" : __dirname + "../../../database/seeders/tenant/platform"
      }
    },
    dbManager: {
      // db manager related configuration
      collate: ['en_US.UTF-8'],
      superUser: process.env.DB_SUPER_USER,
      superPassword: process.env.DB_SUPER_USER_PASSWORD,
    }
  }
} 

export const getConnection = () => {
  const ns = getNamespace(process.env.APP_ID ?? 'gdgvsdvsvhsdvsdkjbvie') ?? createNamespace(process.env.APP_ID ?? 'gdgvsdvsvhsdvsdkjbvie');  
  if(!ns){
    throw Error("Namespace not found");
  }
  const conn: Knex | undefined | null = ns.get('connection');
  if(!conn){
    return getCentralConnection();
  }
  return conn as Knex;
}

export const bootstrap = async () => { 
  try {     
    const tenants: Array<Tenant> = await getTenantList({filters: {status: 'Active'}});    

    tenantMapping = tenants.map((tenant) => ({                       
      uuid: tenant.uuid, 
      type: tenant.type,      
      connection: knex(getConfig(tenant))   
    }));
 } catch (e) {     
   console.error(e)   
 } 
} 

export const createTenantConnection = async (tenant : TenantType) => {
  try {
    const dbManager = knexDbManager.databaseManagerFactory(getDbManagerConfig(tenant) as DbManagerFactoryConfig);
    await dbManager.createDbOwnerIfNotExist();
    await dbManager.createDbIfNotExist();
    
    await dbManager.migrateDb();
    
    await dbManager.close();

    tenant.status = 'Active';
    tenant.updated_at = new Date();
    const {created_at, ...toPatch} = tenant;

    await patchTenant(tenant.id?.toString() as string, toPatch);

    await bootstrap();

  } catch (e) {     
    console.error(e);   
    throw e;
  } 
}

export const getTenantConnection = (uuid: NanoId) => {   
  const tenant = tenantMapping.find((tenant) => tenant.uuid === uuid)  

  if (!tenant) return null   

  return tenant.connection
}

export const getCentralConnection = () => {   
  return db;
}