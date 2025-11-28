import type {NextFunction, Request, Response} from "express";

import {bodyToUser, bodyToUserUpdate} from "../dtos/user.dtos";
import {authenticateUser, updateUserProfile, userSignUp,} from "../service/user.service";

export const handleUserSignUp = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    /* swagger docs omitted for brevity */
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body);

    const user = await userSignUp(bodyToUser(req.body));
    res.success(user);
};

export const handleUserLogin = async (
    req: Request<{}, unknown, { email: string; password: string }>,
    res: Response,
): Promise<void> => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            res.status(400).error({errorCode: "AUTH004", reason: "이메일과 비밀번호가 필요합니다."});
            return;
        }
        const result = await authenticateUser(String(email), String(password));
        res.success(result);
    } catch (err: any) {
        console.error(err);
        res.status(401).error({errorCode: "AUTH005", reason: err?.message ?? "로그인에 실패했습니다."});
    }
};

export const handleUpdateMe = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }
        const updatePayload = bodyToUserUpdate(req.body);
        const preferences = Array.isArray((req.body as any).preferences) ? (req.body as any).preferences as string[] : null;
        const updated = await updateUserProfile(req.user.id, updatePayload, preferences);
        res.success(updated);
    } catch (err: any) {
        console.error(err);
        res.status(400).error({errorCode: "USER_UPDATE_FAILED", reason: err?.message ?? "정보를 업데이트할 수 없습니다."});
    }
};
