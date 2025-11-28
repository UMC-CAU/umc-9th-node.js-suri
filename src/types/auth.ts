import {Request} from "express";


export interface AuthUser {
    id: number;
    email: string;
    name: string;
}

export interface AuthenticatedRequest<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: AuthUser;
}