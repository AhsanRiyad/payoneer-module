import { AdminType } from "./../models/Admin";
import { getAdminWithPassword } from "./adminService";
import { comparePassword } from '../helpers/authHelper';
import { generateToken } from '../helpers/jwtHelper';

export function determineUserTypeFromUsername(username: string): string {
    //implement logic

    return 'admin';
}
export function attempLogin(user: AdminType, password: string): object{
    try{
        if(user && comparePassword(password, user.password as string)){
            const token = generateToken({
                user_id: user.id,
                user_type: user.type,
                organization_identifier: user.organization_identifier
            }, '10d');
            const { password, ...withoutPassword } = user;
            return {
                accessToken: token,
                user: withoutPassword
            }
        }else{
            throw { message: 'Invalid Credentials' };
        }
    }catch(err){
        throw err;
    }
}
export async function login(username: string, password: string) : Promise<object> {
    return new Promise<object>((resolve, reject) => {
        const userType = determineUserTypeFromUsername(username);

        if(userType.toLowerCase() == 'admin'){
            getAdminWithPassword(username).then((admin: AdminType|undefined) => {
                try{
                    if(!admin){
                        throw({message: 'Data not found'});
                    }
                    return resolve(attempLogin(admin, password));
                }catch(err){
                    return reject(err);
                }
            });
        }
    });
}