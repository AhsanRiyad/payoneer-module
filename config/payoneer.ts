import * as dotenv from "dotenv";
dotenv.config();

export interface Config {
    env: string,
    program : {
        account : {
            program_id : number
        },
        gbt : {
            program_id : number
        },
        client_id : string,
        client_secret : string,
        token? : {
            bearer? : string | null,
            consented_on? : number | null,
            expires_in? : number | null
        }
    }
};

export interface TokenConfig {
    token : {
        bearer : string | null,
        consented_on : number | null,
        expires_in : number | null
    }
};

export default {
    'env': process.env.PAYONEER_ENV ?? 'local',
    'program' : {
        'account' : {
            'program_id' : process.env.PAYONEER_ACCOUNT_PROGRAM_ID
        },
        'gbt' : {
            'program_id' : process.env.PAYONEER_GBT_PROGRAM_ID
        },
        'client_id' : process.env.PAYONEER_CLIENT_ID,
        'client_secret' : process.env.PAYONEER_CLIENT_SECRET,
        'token' : {
            'bearer' : null,
            'consented_on' : null,
            'expires_in' : null
        }
    }
};