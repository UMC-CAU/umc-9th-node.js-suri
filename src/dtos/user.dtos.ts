// DTOs and mappers for user
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
