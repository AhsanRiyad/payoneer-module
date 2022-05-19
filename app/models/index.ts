import { Model } from "objection";
import { getConnection, getCentralConnection, getTenantConnection } from '../services/dbConnectionManagerService';

export default Model;
export function knexConnection(identifier: null | 'central' | string = null ){
    if(identifier){
        if(identifier == 'central'){
            return getCentralConnection();
        }
        return getTenantConnection(identifier);
    }
    return getConnection();
}