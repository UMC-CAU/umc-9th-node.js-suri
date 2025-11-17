import type {NextFunction, Request, Response} from "express";

import {bodyToUser} from "../dtos/user.dtos";
import {userSignUp,} from "../service/user.service";

export const handleUserSignUp = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body);

    const user = await userSignUp(bodyToUser(req.body));
    res.success(user);
};
