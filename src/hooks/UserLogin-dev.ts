import users from './usuario-dev.json';

export const checkEmailExists = (email:string): boolean => {
    return users.some(user => user.email === email);
};