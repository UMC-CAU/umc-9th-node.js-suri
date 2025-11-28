import {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {verifyToken} from "../utils/jwt";
import {AuthenticatedRequest} from "../types/auth";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
            .status(StatusCodes.UNAUTHORIZED)
            .error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyToken(token);
        (req as AuthenticatedRequest).user = {id: Number(payload.id), email: String(payload.email)};
        next();
    } catch (err: any) {
        res
            .status(StatusCodes.UNAUTHORIZED)
            .error({errorCode: "AUTH002", reason: err?.message ?? "유효하지 않은 토큰입니다."});
    }
};
