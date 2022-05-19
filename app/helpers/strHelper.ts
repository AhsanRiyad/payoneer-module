import { nanoid } from 'nanoid';

export function generateRandomStr(size: number){
    return Array(size+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, size);
}

export function uuid(size: number | null){
    if(size){
        return nanoid(size);
    }else{
        return nanoid();
    }
}