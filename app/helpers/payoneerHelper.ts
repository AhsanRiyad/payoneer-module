import config, { TokenConfig } from '../../config/payoneer';
import axios from 'axios';
import { build_url } from './routeHelper';
import fs from 'fs'; 

const tokenPath = './config/payoneer.json';

export function base_url() : string {
    if (config.env == "production") {
        return "https://api.payoneer.com";
    }

    return "https://api.sandbox.payoneer.com";
}

export async function token() {
    let token = 'no token';

    await fs.readFile(tokenPath, async (error, data) => {
        if(error){
            throw error;
        }
        let tokenConfig = JSON.parse(data.toString());
        if(tokenConfig.token && tokenConfig.token.bearer && tokenConfig.token.consented_on && tokenConfig.token.expires_in && (((tokenConfig.token.consented_on + tokenConfig.token.expires_in) - 36000 ) > Date.now())){
            token = tokenConfig.token.bearer;
        }else{
            const tokenResponse = await getToken();
            if(tokenResponse.status == 200){
                await setToken(tokenResponse.data, tokenConfig);
                token = tokenResponse.data.access_token;
            }
        }
    });

    return token;
}

export async function getToken(){
    let url = 'https://login.sandbox.payoneer.com/api/v2/oauth2/token';

    if (config.env == "production") {
        url = 'https://login.payoneer.com/api/v2/oauth2/token';
    }

    const response = await axios.post(
        url,
        {
            "grant_type" : "client_credentials",
            "scope" : "read write",
        },
        {
            auth: {
                username: config.program.client_id as string, 
                password: config.program.client_secret as string
            }
        }
    );

    return response;
}

export async function setToken(token : any, tokenConfig : TokenConfig){
    if(token && token.access_token && token.expires_in && token.consented_on){
        tokenConfig.token.bearer = token.access_token;
        tokenConfig.token.consented_on = token.consented_on;
        tokenConfig.token.expires_in = token.expires_in;

        await fs.writeFile(tokenPath, JSON.stringify(tokenConfig, null, 4), (error) => {
            if(error){
                throw error;
            }
        });
    }

    return true;
}

export async function onboarding_url(payee_id_in_system : string, client_session_id_in_system : string, payee_email : string, already_have_account : boolean, return_url: string, session_token : string, program_id? : number | null){
    const url = base_url() + '/v4/programs/' + (!program_id ? config.program.account.program_id : program_id) + '/payees/registration-link';

    const redirect_url = build_url(return_url, [session_token]) + "?payee_id={{apuid}}&payoneer_id={{payoneerid}}";
    const redirect_sec = 4;

    const body = {
        payee_id: payee_id_in_system,
        client_session_id: client_session_id_in_system,
        redirect_url:  redirect_url ,
        redirect_time:  redirect_sec ,
        payout_methods_list: [
            "PREPAID_CARD",
            "BANK"
        ],
        registration_mode: "FULL",
        payee_data_matching_type: "EMAIL",
        already_have_an_account: (already_have_account ? 1 : 0),
        language_id: "1",
        payee: {
            type: "INDIVIDUAL",
            contact: {
                email: payee_email
            }
        }
    }

    const response = await axios.post(
        url,
        body,
        {
            headers: {
                Authorization: `Bearer ${token()}`
            }
        }
    );

    return response;
}

export async function program_balance(program_id?: number | null){
    const url = base_url() + '/v4/programs/' + (!program_id ? config.program.account.program_id : program_id) + '/balance';

    const response = await axios.get(
        url,
        {
            headers: {
                Authorization: `Bearer ${token()}`
            }
        }
    );

    return response;
}

export async function getPayeeStatus(payee_id_in_system : string, program_id? : number | null){
    const url = base_url() + '/v4/programs/' + (!program_id ? config.program.account.program_id : program_id) + '/payees/' + payee_id_in_system + '/status';

    const response = await axios.get(
        url,
        {
            headers: {
                Authorization: `Bearer ${token()}`
            }
        }
    );

    return response;
}

export async function payout_to(payee_id_in_system : string, client_referenece_id : string, description : string, amount : number, currency : string = 'USD', program_id? : number | null){
    const url = base_url() + '/v4/programs/' + (!program_id ? config.program.account.program_id : program_id) + '/masspayouts';

    const body = {
        Payments: [
            {
                client_reference_id: client_referenece_id,
                payee_id: payee_id_in_system,
                description: description,
                currency: currency,
                amount: amount
            }
        ]
    }

    const response = await axios.post(
        url,
        body,
        {
            headers: {
                Authorization: `Bearer ${token()}`
            }
        }
    );

    return response;
}

export function getPayoutStatus(){

}

export function getPaymentCancelReason(code: number): string{
    switch (code) {
        case 10005:
            return "Payee was not found";
        case 10009:
            return "Payee was not found";
        case 10101:
            return "Payout method details are invalid";
        case 10301:
            return "Insufficient balance";
        case 10302:
            return "Invalid currency";
        case 10303:
            return "Payout currency unavailable for this payee";
        default:
            return "Unknown error";
    }
}