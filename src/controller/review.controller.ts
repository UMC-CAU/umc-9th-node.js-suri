import type {NextFunction, Request, Response} from "express";
import {bodyToReview} from "../dtos/review.dtos";
import {addMemReview, listMemberReviews} from "../service/review.service";
import {listStoreReview} from "../service/store.service";


export const handleInsertReview = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<Response | void> => {
    try {
        console.log("Request Data : ", req.body);

        const reviewData = bodyToReview(req.body);
        const result = await addMemReview(reviewData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleGetMemberReview = async (
    req: Request<{ memberId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    try {
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const memberId = parseInt(req.params.memberId, 10);

        const reviews = await listMemberReviews(
            memberId, cursor
        );
        res.success(reviews);


    } catch (err: any) {
        console.error("Error:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetStoreReivew = async (
    req: Request<{ storeId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    try {
        const cursor = parseInt(req.query.cursor as string, 10);

        const storeID = parseInt(req.params.storeId, 10);


        const reviews = await listStoreReview(
            storeID, cursor
        );
        res.success(reviews);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}
