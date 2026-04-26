export enum UserRole{
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export interface User{
    profilePicture: any;
    provider: string;
    id : number;
    fname : string;
    lname : string;
    username : string;
    email : string;
    roles : UserRole;
    phoneNumber ?: string;
    avatar ?: string;
}

export interface LoginCredentials{
    email : string;
    password : string;
}

export interface AuthenticatoonResponse {
    userId : number;
    jwt : string;
    fullName : string;
    userRole : UserRole;
}

export interface SignUpDTO{
    fname : string;
    lname : string;
    email : string;
    password : string;
    phoneNumber : string;
}

export interface ForgotPasswordRequest {
    email : string;
    method : string;
}

export interface ResetPasswordRequest{
    [x: string]: string | number | boolean;
    identifier : string;
    otp : string;
    newPassword : string;
}
