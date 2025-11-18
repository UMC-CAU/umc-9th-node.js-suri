import {NoListStoreReviewError, NoReviewInsertionError,} from "../error";
import {ReviewCreateDTO} from "../dtos/review.dtos";
import {addReview, getMemberReviews} from "../repository/review.repository";

export const addMemReview = async (
    data: ReviewCreateDTO,
): Promise<{
    id: number;
    member_id: number;
    store_id: number;
    grade: string;
    description: string;
    created_at: Date;
}> => {
    const reviewData = {
        member_id: data.member_id,
        store_id: data.store_id,
        grade: String(data.grade),
        description: data.description,
        created_at: new Date(),
    };
    if (reviewData.member_id === null || reviewData.store_id === null || reviewData.grade === null || reviewData.description === null || reviewData.created_at === null) {
        throw new NoReviewInsertionError("리뷰의 정보를 정확히 입력해주세요", data);
    }


    const reviewId: number | null = await addReview(reviewData);
    if (reviewId === null) {
        throw new NoReviewInsertionError("리뷰 등록에 실패", data);
    }

    return {
        id: reviewId,
        ...reviewData,
    };
};

export const listMemberReviews = async (
    memberId: number,
    cursor: number,
): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[]> => {
    try {
        const reviews = await getMemberReviews(memberId, cursor);
        if (!reviews) {
            throw new NoListStoreReviewError("유저를 찾을 수 없습니다.", memberId)
        } else if (reviews.length === 0) {
            throw new NoListStoreReviewError("리뷰를 찾을 수 없습니다.", memberId)
        }
        return reviews;

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

