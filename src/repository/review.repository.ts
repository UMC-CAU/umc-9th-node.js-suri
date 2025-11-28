import {prisma} from "../db.config";
import {ReviewCreateDTO} from "../dtos/review.dtos";

// Insert review; returns new id or null when store not exists
export interface ReviewInsertPayload extends ReviewCreateDTO {
    created_at: Date;
}

export const addReview = async (
    data: ReviewInsertPayload,
): Promise<number | null> => {
    try {

        const confirmReview = await prisma.store.findFirst({where: {id: data.store_id}});
        if (!confirmReview) {
            return null;
        }
        const newReview = await prisma.review.create({
            data:
                {
                    memberId: data.member_id,
                    storeId: data.store_id,
                    grade: String(data.grade),
                    description: data.description,
                    createdAt: new Date()
                }
        });
        return Number(newReview.id);

    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
};

export const getMemberReviews = async (
    memberId: number,
    cursor: number,
): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[] | null> => {
    try {
        const member = await prisma.member.findFirst({
            where: {id: BigInt(memberId)}, select: {nickname: true}
        });
        if (!member) {
            return null;
        }
        const reviews = await prisma.review.findMany(
            {
                where: {memberId: BigInt(memberId), id: {gt: cursor}},
                select: {
                    grade: true,
                    description: true,
                    createdAt: true,
                    storeId: true
                },
                orderBy: {id: "asc"},
                take: 5
            }
        )
        const stores = await prisma.store.findMany({
            where: {id: {in: reviews.map((review: { storeId: bigint }) => review.storeId)}},
            select: {name: true, id: true}
        }) as Array<{ id: bigint; name: string | null }>;

        const result = reviews.map((review: { grade: string | null; description: string | null; createdAt: Date | null; storeId: bigint }) => {
            const storeObj = stores.find((store: { id: bigint }) => store.id === review.storeId);
            return {
                nickname: member.nickname ? String(member.nickname) : null,
                store_name: storeObj ? String(storeObj.name) : "",
                grade: String(review.grade),
                description: String(review.description),
                created_at: review.createdAt
            }
        })
        if (result.length === 0) {
            return [];
        } else {
            return result;
        }

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

