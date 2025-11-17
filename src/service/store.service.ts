import {
    NoListStoreReviewError,
    NoMissionFromStoreError,
    NoStoreInfromationError,
    NoStoreInsertionError
} from "../error";
import {StoreCreateDTO} from "../dtos/store.dtos";
import {addStore, getMissionFromStore, getStoreReviews} from "../repository/store.repository";

export const addInsertStore = async (
    data: StoreCreateDTO,
): Promise<{
    id: number;
    name: string;
    food_category_id: number;
    subscription: string;
    address: string;
    detail_address: string;
}> => {
    const storeData: StoreCreateDTO = {
        name: data.name,
        food_category_id: data.food_category_id,
        subscription: data.subscription,
        address: data.address,
        detail_address: data.detail_address,
    };
    if (storeData.name === null || storeData.food_category_id === null || storeData.subscription === null || storeData.address === null || storeData.detail_address === null) {
        throw new NoStoreInfromationError("가게의 정보를 정확히 입력하십시오", data);
    }

    const storeId: number | null = await addStore(storeData);
    if (storeId === null) {
        throw new NoStoreInsertionError("가게 등록에 실패.", data);
    }

    return {
        id: storeId,
        ...storeData,
    };
};

export const listStoreReview = async (
    storeId: number,
    cursor: number,
): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[]> => {
    try {
        const reviews = await getStoreReviews(storeId, cursor);
        if (!reviews) {
            throw new NoListStoreReviewError("No stores found", storeId)
        }
        if (reviews.length === 0) {
            throw new NoListStoreReviewError("No reviews found", storeId)
        }
        return reviews;
    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

export const getStoreMission = async (storeId: number, cursor: number): Promise<{
    id: number;
    title: string;
    description: string;
    point_reward: number;
    store_name: string;
}[]> => {
    try {
        const missions = await getMissionFromStore(storeId, cursor);
        if (!missions) {
            throw new NoMissionFromStoreError("No stores found", storeId);
        } else if (missions.length === 0) {
            throw new NoMissionFromStoreError("No missions found", storeId);
        } else {
            return missions;
        }

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

