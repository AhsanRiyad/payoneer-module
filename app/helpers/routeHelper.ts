import * as dotenv from "dotenv";
dotenv.config();

interface NonEmptyArray<T> extends Array<T>{0: T};

export function base_url(): string {
    return process.env.BASE_URL ?? ( 'http://localhost:' + (process.env.PORT ?? '8001' ));
}

export function build_url(url: string, params?: Array<string | number> | null, query?: { [key: string]: string | number | NonEmptyArray<string | number>}): string {
    if(params && params.length > 0){
        let explodedUrl = url.split('/');
        let j = 0;
        let paramLen = params.length;
        for(let i = 0; i < explodedUrl.length; i++){
            if(explodedUrl[i].length > 0 && explodedUrl[i].indexOf(':') == 0){
                explodedUrl[i] = params[j < paramLen ? j : paramLen - 1].toString();
                j++;
            }
        }
        url = explodedUrl.join('/');
    }

    let queryParams = '';

    if(query){
        queryParams = queryParams + '?';
        let queryLen = Object.keys(query).length;
        Object.keys(query).forEach( (k, i) => {
            if(Array.isArray(query[k])){
                query[k] = (<any>query[k]).join(',');
            }
            queryParams = queryParams + k + '=' + query[k] + (i < queryLen - 1 ? '&' : '') ;
        });
    }

    return base_url() + url + queryParams;
}