// DTOs and mappers for user
// Converted to TypeScript with explicit interfaces and return types.

// DB User row shape (snake_case) used in responses

import {PreferenceRow} from "../repository/user.repository";

export interface memberEntityDB {
    id: number;
    email: string;
    name: string;
    nickname: string | null;
    gender: string | null;
    birthdate: Date | null;
    phone_number: string;
    point: number;
    status: boolean | string | null;
    created_at: Date | null;
    updated_at: Date | null;
    last_login: Date | null;
    password?: string;
}

// Request body → internal user creation payload (camelCase)
export interface memberBodyToDTO {
    email: string;
    name: string;
    nickname: string | null;
    gender: string | null;
    birthdate: Date | null;
    phoneNumber: string;
    password: string;
    preferences: unknown;
    status?: string | boolean;
    point?: number;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;

}

export interface UserResponseDTO {
    id: number;
    email: string;
    name: string;
    nickname: string | null;
    gender: string | null;
    birthdate: Date | null;
    phoneNumber: string;
    point: number;
    status: boolean | string | null;
    preferences: Array<PreferenceRow> | null | undefined;
}

export interface UpdateUserDTO {
    name?: string;
    nickname?: string | null;
    gender?: string | null;
    birthdate?: Date | null;
    phoneNumber?: string;
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
    if (b.password === null || b.password === undefined || typeof b.password !== "string") {
        throw new Error("password is null or undefined or not a string");
    }
    const phoneNumber = b.phoneNumber ?? b.phone_number;
    if (phoneNumber === null || phoneNumber === undefined) {
        throw new Error("phoneNumber is required");
    }

    const birthdate = b.birthdate ? new Date(b.birthdate) : null;
    return {
        email: String(b.email),
        name: String(b.name ?? ""),
        nickname: b.nickname !== undefined && b.nickname !== null ? String(b.nickname) : null,
        gender: b.gender !== undefined && b.gender !== null ? String(b.gender) : null,
        birthdate,
        phoneNumber: String(phoneNumber),
        password: String(b.password),
        preferences: b.preferences,
        status: b.status ?? null,
        point: Number(b.point ?? 0),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    };
};

export const bodyToUserUpdate = (body: unknown): UpdateUserDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    const payload: UpdateUserDTO = {};

    if (b.name !== undefined) payload.name = String(b.name);
    if (b.nickname !== undefined) payload.nickname = b.nickname === null ? null : String(b.nickname);
    if (b.gender !== undefined) payload.gender = b.gender === null ? null : String(b.gender);
    if (b.birthdate !== undefined) payload.birthdate = b.birthdate ? new Date(b.birthdate) : null;
    if (b.phoneNumber !== undefined) payload.phoneNumber = String(b.phoneNumber);
    if (b.phone_number !== undefined) payload.phoneNumber = String(b.phone_number);

    return payload;
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
