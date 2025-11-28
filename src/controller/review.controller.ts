import type {NextFunction, Request, Response} from "express";
import {bodyToReview} from "../dtos/review.dtos";
import {addMemReview, listMemberReviews} from "../service/review.service";
import {listStoreReview} from "../service/store.service";

export const handleInsertReview = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }
        console.log("Request Data : ", req.body);

        const reviewData = bodyToReview(req.body, req.user.id);
        const result = await addMemReview(reviewData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleGetMemberReview = async (
    req: Request<{ memberId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    try {
        if (!req.user || req.user.id !== parseInt(req.params.memberId, 10)) {
            res.status(403).error({errorCode: "AUTH006", reason: "본인의 리뷰만 조회할 수 있습니다."});
            return;
        }
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const memberId = req.user.id;

        const reviews = await listMemberReviews(
            memberId, cursor
        );
        res.success(reviews);


    } catch (err: any) {
        console.error("Error:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetStoreReivew = async (
    req: Request<{ storeId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    try {
        const cursor = parseInt(req.query.cursor as string || "0", 10);

        const storeID = parseInt(req.params.storeId, 10);


        const reviews = await listStoreReview(
            storeID, cursor
        );
        res.success(reviews);
    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}
