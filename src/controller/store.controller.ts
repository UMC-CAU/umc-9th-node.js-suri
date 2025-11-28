import type {Request, Response} from "express";
import {bodyToStore} from "../dtos/store.dtos";
import {addInsertStore} from "../service/store.service";


export const handleStoreInsert = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }
        console.log("요청 데이터:", req.body);

        const storeData = bodyToStore(req.body);
        const result = await addInsertStore(storeData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};
