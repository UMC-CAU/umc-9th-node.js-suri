// DTOs and mappers for user, store, review, mission
// Converted to TypeScript with explicit interfaces and return types.

// DB User row shape (snake_case) used in responses

import {PreferenceRow} from "../repository/user.repository";

export interface memberEntityDB {
    id: number;
    email: string;
    name: string;
    nickname: string | null;
    gender: string;
    birthdate: Date;
    phone_number: string;
    point: number;
    status: boolean;
    created_at: Date;
    updated_at: Date;
    last_login: Date;
}

// Request body → internal user creation payload (camelCase)
export interface memberBodyToDTO {
    email: string;
    name: string;
    nickname: string | null;
    gender: string;
    birthdate: Date;
    phoneNumber: string;
    password: string;
    preferences: unknown;
    status: string | boolean;
    point: number;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;

}

export interface UserResponseDTO {
    id: number;
    email: string;
    name: string;
    nickname: string | null;
    gender: string;
    birthdate: Date;
    phoneNumber: string;
    point: number;
    status: boolean;
    preferences: Array<PreferenceRow> | null | undefined;
}

export const bodyToUser = (body: unknown): memberBodyToDTO => {
    if (body === null || body === undefined || typeof body !== "object")
        throw new Error("body is null or undefined or not an object");
    const b = body as any;

    if (
        b.email === null ||
        b.email === undefined ||
        typeof b.email !== "string"
    ) {
        throw new Error("email is null or undefined or not a string");
    }

    const birthdate = new Date(b.birthdate);
    return {
        email: String(b.email),
        name: String(b.name),
        nickname: String(b.nickname),
        gender: String(b.gender),
        birthdate,
        phoneNumber: String(b.phone_number),
        password: String(b.password),
        preferences: b.preferences,
        status: Boolean(b.status),
        point: Number(b.point),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    };
};

export const responseFromUser = async ({
                                           user,
                                           preferences,
                                       }: {
    user: memberEntityDB | null;
    preferences: PreferenceRow[] | null;
}): Promise<UserResponseDTO> => {
    if (preferences === null || user === null) {
        throw new Error("preferences/user is null or undefined");
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        gender: user.gender,
        birthdate: user.birthdate,
        phoneNumber: user.phone_number,
        point: user.point,
        status: user.status,
        preferences: preferences
    };
};

export interface StoreCreateDTO {
    name: string;
    food_category_id: number;
    subscription: string;
    address: string;
    detail_address: string;
}

export const bodyToStore = (body: unknown): StoreCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (
        b.name === undefined ||
        b.food_category_id === undefined ||
        b.address === undefined ||
        b.detail_address === undefined
    ) {
        throw new Error(
            "name, food_category_id, address, detail_address is undefined",
        );
    } else {
        return {
            name: String(b.name),
            food_category_id: Number(b.food_category_id),
            subscription: String(b.subscription),
            address: String(b.address),
            detail_address: String(b.detail_address),
        };
    }
};

export interface ReviewCreateDTO {
    member_id: number;
    store_id: number;
    grade: string;
    description: string;
}

export const bodyToReview = (body: unknown): ReviewCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (
        b.member_id === undefined ||
        b.store_id === undefined ||
        b.grade === undefined ||
        b.description === undefined
    ) {
        throw new Error(
            "The following fields are missing: member_id, store_id, grade, description",
        );
    }
    return {
        member_id: Number(b.member_id),
        store_id: Number(b.store_id),
        grade: String(b.grade),
        description: String(b.description),
    };
};

export interface MissionCreateDTO {
    description: string;
    title: string;
    point_reward: number;
    store_id: number;
}

export const bodyToMission = (body: unknown): MissionCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (
        b.title === undefined ||
        b.point_reward === undefined ||
        b.store_id === undefined
    ) {
        throw new Error(
            "The following fields are missing: title, point_reward, store_id",
        );
    }
    return {
        description: String(b.description),
        title: String(b.title),
        point_reward: Number(b.point_reward),
        store_id: Number(b.store_id),
    };
};

export interface MemberMissionCreateDTO {
    member_id: number;
    mission_id: number;
    address: string | null;
    is_completed: boolean;
    deadline: string | Date;
    activated: boolean;
    created_at: string | Date;
    updated_at: string | Date;
}

export const bodyToMemberMission = (body: unknown): MemberMissionCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (b.member_id === undefined || b.mission_id === undefined) {
        throw new Error("The following fields are missing: member_id, mission_id");
    }
    return {
        member_id: Number(b.member_id),
        mission_id: Number(b.mission_id),
        address: String(b.address) ?? null,
        is_completed: b.is_completed ?? 0,
        deadline: b.deadline,
        activated: b.activated,
        created_at: b.created_at,
        updated_at: b.updated_at,
    };
};
