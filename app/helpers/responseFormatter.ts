export function formatError(err: Array<object> | object, statusCode: number) : object{
    if(!Array.isArray(err)){
        err = [err];
    } 
    return {
        status: 'failed',
        statusCode: statusCode,
        errors: err
    }
}

export function formatSuccess(data: any, statusCode: number = 200) : object{
    return {
        status: 'success',
        statusCode: statusCode,
        data: data
    }
}