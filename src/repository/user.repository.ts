import {prisma} from "../db.config";
import {memberEntityDB, UpdateUserDTO} from "../dtos/user.dtos";

// Payload used to insert a user into DB (subset of memberBodyToDTO)
export interface UserInsertPayload {
    email: string;
    name: string;
    nickname: string | null;
    gender: string | null;
    birthdate: Date | null;
    phoneNumber: string;
    password: string;
    status: string | boolean | null;
    point: number;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
}

export interface UserWithPassword extends memberEntityDB {
    password: string;
}

// Add new user; returns inserted ID or null if email already exists
export const addUser = async (
    data: UserInsertPayload,
): Promise<number | null> => {

    try {
        const user = await prisma.member.findFirst({
            where: {
                email: data.email
            }
        })
        if (user) {
            return null
        }

        const addnewUser = await prisma.member.create({
            data: {
                email: data.email,
                name: data.name,
                nickname: data.nickname,
                gender: data.gender,
                birthdate: data.birthdate ?? undefined,
                createdAt: data.createdAt ?? new Date(),
                updatedAt: data.updatedAt ?? new Date(),
                status: data.status ? String(data.status) : null,
                lastLogin: data.lastLogin ?? new Date(),
                phoneNumber: data.phoneNumber,
                password: data.password,
                point: Number(data.point)
            }
        });
        return Number(addnewUser.id);

    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    }
};

// Get single user by id
export const getUser = async (userId: number): Promise<memberEntityDB | null> => {

    try {
        const user = await prisma.member.findFirst({where: {id: userId}});
        if (!user) {
            return null
        }
        return {
            id: Number(user.id),
            email: String(user.email),
            name: String(user.name),
            nickname: user.nickname ? String(user.nickname) : null,
            gender: user.gender ? String(user.gender) : null,
            birthdate: user.birthdate ? new Date(String(user.birthdate)) : null,
            phone_number: String(user.phoneNumber),
            point: Number(user.point),
            status: user.status ? String(user.status) : null,
            created_at: user.createdAt ? new Date(String(user.createdAt)) : null,
            updated_at: user.updatedAt ? new Date(String(user.updatedAt)) : null,
            last_login: user.lastLogin ? new Date(String(user.lastLogin)) : null,
            password: user.password ? String(user.password) : undefined,
        };
    } catch (err) {
        throw new Error("The user does not exist. {" + err + "}");
    }

};

export const getUserByEmail = async (email: string): Promise<UserWithPassword | null> => {
    try {
        const user = await prisma.member.findFirst({where: {email}});
        if (!user) return null;
        return {
            id: Number(user.id),
            email: String(user.email),
            name: String(user.name),
            nickname: user.nickname ? String(user.nickname) : null,
            gender: user.gender ? String(user.gender) : null,
            birthdate: user.birthdate ? new Date(String(user.birthdate)) : null,
            phone_number: String(user.phoneNumber),
            point: Number(user.point),
            status: user.status ? String(user.status) : null,
            created_at: user.createdAt ? new Date(String(user.createdAt)) : null,
            updated_at: user.updatedAt ? new Date(String(user.updatedAt)) : null,
            last_login: user.lastLogin ? new Date(String(user.lastLogin)) : null,
            password: String(user.password),
        };
    } catch (err) {
        throw new Error("The user does not exist. {" + err + "}");
    }
};

export const updateUserById = async (
    userId: number,
    payload: UpdateUserDTO,
): Promise<memberEntityDB | null> => {
    try {
        const updated = await prisma.member.update({
            where: {id: userId},
            data: {
                name: payload.name,
                nickname: payload.nickname,
                gender: payload.gender,
                birthdate: payload.birthdate ?? undefined,
                phoneNumber: payload.phoneNumber,
                updatedAt: new Date(),
            }
        });
        return {
            id: Number(updated.id),
            email: String(updated.email),
            name: String(updated.name),
            nickname: updated.nickname ? String(updated.nickname) : null,
            gender: updated.gender ? String(updated.gender) : null,
            birthdate: updated.birthdate ? new Date(String(updated.birthdate)) : null,
            phone_number: String(updated.phoneNumber),
            point: Number(updated.point),
            status: updated.status ? String(updated.status) : null,
            created_at: updated.createdAt ? new Date(String(updated.createdAt)) : null,
            updated_at: updated.updatedAt ? new Date(String(updated.updatedAt)) : null,
            last_login: updated.lastLogin ? new Date(String(updated.lastLogin)) : null,
            password: updated.password ? String(updated.password) : undefined,
        };
    } catch (err) {
        return null;
    }
};

// Map preferred food category for a user; returns created id (manual incremental)
export const setPreference = async (
    userId: number,
    preferFood: string,
): Promise<number> => {
    try {
        const newPref = await prisma.foodCategory.create({
            data: {
                memberId: Number(userId),
                preferFood: String(preferFood),
            }
        });
        return Number(newPref.id);
    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
};

export const removePreferencesByUserId = async (userId: number): Promise<void> => {
    await prisma.foodCategory.deleteMany({where: {memberId: userId}});
};

// Get user preferences by user id
export interface PreferenceRow {
    id: number;
    member_id: number;
    prefer_food: string;
}

export const getUserPreferencesByUserId = async (
    userId: number,
): Promise<PreferenceRow[]> => {
    try {
        const prefs = await prisma.foodCategory.findMany({
            select: {id: true, memberId: true, preferFood: true},
            where: {memberId: userId}
        });
        return prefs.map((row: { id: bigint; memberId: bigint; preferFood: string | null }) => ({
            id: Number(row.id),
            member_id: Number(row.memberId),
            prefer_food: String(row.preferFood),
        })) as PreferenceRow[];
    } catch (err) {
        throw new Error("Error getting preferences. {" + err + "}");
    }

};
