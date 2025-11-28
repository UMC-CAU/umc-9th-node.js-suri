import {NextFunction, Request, Response} from "express";
import {verifyJwt} from "../utils/simpleJwt";

export interface AuthenticatedUser {
    id: number;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers["authorization"];
    const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "")
        : null;

    if (!token) {
        res.status(401).error({errorCode: "AUTH001", reason: "인증 토큰이 필요합니다."});
        return;
    }

    try {
        const payload = verifyJwt(token);
        if (!payload.sub || !payload.email) {
            res.status(401).error({errorCode: "AUTH002", reason: "유효하지 않은 토큰입니다."});
            return;
        }
        req.user = {id: Number(payload.sub), email: payload.email};
        next();
    } catch (err: any) {
        res.status(401).error({errorCode: "AUTH003", reason: err?.message || "토큰 검증 실패"});
    }
};
