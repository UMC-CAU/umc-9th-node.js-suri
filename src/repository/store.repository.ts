import {prisma} from "../db.config";
import {StoreCreateDTO} from "../dtos/store.dtos";

// Insert store; returns manual next id or null on invalid foreign keys
export const addStore = async (
    data: StoreCreateDTO,
): Promise<number | null> => {
    try {
        const newStore = await prisma.store.create({
            data: {
                name: String(data.name),
                foodCategoryId: Number(data.food_category_id),
                subscription: String(data.subscription),
                address: String(data.address),
                detailAddress: String(data.detail_address),
            }
        });
        return Number(newStore.id);

    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
};

export const getStoreReviews = async (storeId: number, cursor: number): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[] | null> => {
    try {
        console.log("--------------" + storeId, cursor);
        const store = await prisma.store.findFirst({
            where: {id: BigInt(storeId)}, select: {name: true}
        });
        if (!store) {
            return null;
        }
        const reviews = await prisma.review.findMany(
            {
                where: {storeId: storeId, id: {gt: cursor}},
                select: {
                    grade: true,
                    description: true,
                    createdAt: true,
                    memberId: true
                },
                orderBy: {id: "asc"},
                take: 5
            }
        )
        const nicknames = await prisma.member.findMany({
            where: {id: {in: reviews.map(review => review.memberId)}},
            select: {nickname: true, id: true}
        })

        const result = reviews.map(review => {
            const nicknameObj = nicknames.find(nick => nick.id === review.memberId);
            return {
                nickname: nicknameObj ? String(nicknameObj.nickname) : null,
                store_name: String(store.name),
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

export const getMissionFromStore = async (
    storeId: number,
    cursor: number,
): Promise<{
    id: number;
    title: string;
    description: string;
    point_reward: number;
    store_name: string;
}[] | null> => {
    try {
        const store = await prisma.store.findFirst({where: {id: BigInt(storeId)}, select: {name: true}});
        if (!store) {
            return null;
        }
        const missions = await prisma.mission.findMany({
            where: {storeId: storeId, id: {gt: cursor}},
            select: {
                id: true,
                title: true,
                description: true,
                pointReward: true
            },
            orderBy: {id: "asc"},
            take: 5
        })
        const result = missions.map(mission => ({
            id: Number(mission.id),
            title: String(mission.title),
            description: String(mission.description),
            point_reward: Number(mission.pointReward),
            store_name: String(store.name)
        }))
        if (result.length === 0) {
            return [];
        }
        return result;

    } catch (err) {
        throw new Error("Error getting missions. {" + err + "}");
    }
}

