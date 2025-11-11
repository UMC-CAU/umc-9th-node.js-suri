import crypto from "crypto";
import type {
    memberBodyToDTO,
    memberEntityDB,
    MemberMissionCreateDTO,
    MissionCreateDTO,
    ReviewCreateDTO,
    StoreCreateDTO,
    UserResponseDTO,
} from "../dtos/user.dtos";
import {responseFromUser} from "../dtos/user.dtos";

import {
    addMission,
    addReview,
    addStore,
    addUser,
    getMemberReviews,
    getMissionFromStore,
    getOnMissionRepos,
    getStoreReviews,
    getUser,
    getUserPreferencesByUserId,
    PreferenceRow,
    setOnMissionCompeleteRepos,
    setPreference,
    startMemberMission,
} from "../repository/user.repository";
import {
    DuplicateEmailError,
    NoListStoreReviewError,
    NoMissionFromStoreError,
    NoMissionInsertionError,
    NoMissionStartError,
    NoPreferenceError,
    NoReviewInsertionError,
    NoStoreInfromationError,
    NoStoreInsertionError
} from "../error";

// Simple password hashing (demo only). Consider bcrypt/argon2 for production.
const hashPassword = (password: string): string => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

export const userSignUp = async (
    data: memberBodyToDTO,
): Promise<UserResponseDTO> => {
    const hashedPassword = hashPassword(data.password);

    const joinUserId: number | null = await addUser({
        email: data.email,
        name: data.name,
        nickname: data.nickname,
        gender: data.gender,
        birthdate: data.birthdate,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        status: "ACTIVE",
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    });

    if (joinUserId === null) {
        throw new DuplicateEmailError("이미 존재하는 이메일.", data);
    }

    // preferences가 배열이라고 가정하고 순회
    // unknown 타입을 안전하게 처리하려면 런타임 체크를 추가합니다.
    const prefs = Array.isArray((data as any).preferences)
        ? ((data as any).preferences as string[])
        : [];
    if (prefs.length === 0) {
        throw new NoPreferenceError("선호도를 선택해야합니다!", data);
    }

    for (const preference of prefs) {
        await setPreference(joinUserId, preference);
    }

    const user: memberEntityDB | null = await getUser(joinUserId);
    if (user === null) {
        throw new Error("가입한 유저를 찾을 수 없습니다.");
    }
    const preferences: PreferenceRow[] =
        await getUserPreferencesByUserId(joinUserId);

    return await responseFromUser({user, preferences});
};

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

export const insertMission = async (
    data: MissionCreateDTO,
): Promise<{
    id: number;
    title: string;
    description: string;
    point_reward: number;
    store_id: number;
}> => {
    const missionData: MissionCreateDTO = {
        title: data.title,
        description: data.description,
        point_reward: data.point_reward,
        store_id: data.store_id,
    };
    if (missionData.title === null || missionData.point_reward === null || missionData.store_id === null) {
        throw new NoMissionInsertionError("미션의 정보를 정확히 입력해주세요", data);
    }

    const missionId: number | null = await addMission(missionData);
    if (missionId === null) {
        throw new NoMissionInsertionError("미션 등록 실패", data);
    }

    return {
        id: missionId,
        ...missionData,
    };
};

export const startMission = async (
    data: MemberMissionCreateDTO,
): Promise<{
    id: number;
    member_id: number;
    mission_id: number;
    address: string | null;
    is_completed: number | boolean;
    deadline: string | Date;
    activated: number | boolean;
}> => {
    const memmissionData = {
        member_id: data.member_id,
        mission_id: data.mission_id,
        address: data.address,
        is_completed: data.is_completed,
        deadline: data.deadline,
        activated: data.activated,
    };
    if (memmissionData.member_id === null || memmissionData.mission_id === null || memmissionData.address === null || memmissionData.is_completed === null || memmissionData.deadline === null || memmissionData.activated === null) {
        throw new NoMissionStartError("미션 시작 정보를 정확히 입력해주세요", data);
    }

    const memmissionId: number | null = await startMemberMission(memmissionData);
    if (memmissionId === null) {
        throw new NoMissionStartError("이미 시작된 미션입니다.", data);
    }

    return {
        id: memmissionId,
        ...memmissionData,
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
            throw new NoListStoreReviewError("No members found", memberId)
        } else if (reviews.length === 0) {
            throw new NoListStoreReviewError("No reviews found", memberId)
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

export const getOnMemMission = async (memberId: number, cursor: number): Promise<{
    id: number;
    member_id: number;
    store_name: string;
    mission_title: string;
    mission_description: string;
    mission_point_reward: number;
    activated: boolean;
    is_completed: boolean;
    created_at: Date | null;
    deadline: Date | null;
}[] | number> => {
    try {
        const onMissions = await getOnMissionRepos(memberId, cursor);
        if (onMissions === 0) {
            throw new NoMissionFromStoreError("No On Mission found", memberId);
        } else if (onMissions === 1) {
            throw new NoMissionFromStoreError("No Mission found", memberId);
        } else if (onMissions === 2) {
            throw new NoMissionFromStoreError("No Stores found", memberId);
        } else if (onMissions === null) {
            throw new NoMissionFromStoreError("No Final On Mission found", memberId);
        }
        return onMissions;
    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

export const setOnMissionCompelete = async (memberId: number, missionId: number, cursor: bigint): Promise<{
    id: number;
    memberId: number;
    missionId: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    address: string;
    isCompleted: boolean;
    deadline: Date | null
    activated: boolean;
}> => {
    try {
        const completeMission = await setOnMissionCompeleteRepos(memberId, missionId, cursor);
        if (!completeMission) {
            throw new Error("The MemberMission is not found.")
        }
        return completeMission;

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }

}