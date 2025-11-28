import {prisma} from "../db.config";
import {createHash} from "crypto"
import {memberEntityDB, userUpdateLoginPayload} from "../dtos/user.dtos";

// Payload used to insert a user into DB (subset of memberBodyToDTO)
export interface UserInsertPayload {
    email: string;
    name: string;
    nickname: string | null;
    gender: string;
    birthdate: Date;
    phoneNumber: string;
    password: string;
    status: string | boolean;
    point: number;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
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
        } else {
            const hashedPassword = createHash("sha256")
                .update(String(data.password))
                .digest("hex");
            const addnewUser = await prisma.member.create({
                data: {
                    email: data.email,
                    name: data.name,
                    nickname: data.nickname,
                    gender: data.gender,
                    birthdate: data.birthdate,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: String(data.status),
                    lastLogin: new Date(),
                    phoneNumber: data.phoneNumber,
                    password: hashedPassword,
                    point: Number(data.point)
                }
            });
            return Number(addnewUser.id);
        }
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    }
};

export const userUpdateLogin = async (
    userId: number,
    data: userUpdateLoginPayload,
): Promise<void> => {
    try {
        const safeDate = (value?: Date | null) => (value && !Number.isNaN(value.getTime()) ? value : undefined);
        const safeString = (value?: string | null) => (value === null || value === undefined || value.trim() === "" ? undefined : value);
        const safeNumber = (value?: number | null) => (value === null || value === undefined ? undefined : Number(value));

        await prisma.member.update({
            where: {id: userId},
            data: {
                nickname: safeString(data.nickname ?? null),
                gender: safeString(data.gender ?? null),
                birthdate: safeDate(data.birthdate ?? null),
                phoneNumber: safeString(data.phoneNumber ?? null),
                status: data.status === null || data.status === undefined ? undefined : String(data.status),
                point: safeNumber(data.point ?? null),
                createdAt: safeDate(data.createdAt ?? null),
                updatedAt: new Date(),
                lastLogin: safeDate(data.lastLogin ?? null) ?? new Date(),
            },
        });

    } catch (err: any) {
        throw new Error("로그인 정보 업데이트 중 오류가 발생했습니다. {" + err + "}");
    }
}

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
            gender: String(user.gender),
            birthdate: new Date(String(user.birthdate)),
            phone_number: String(user.phoneNumber),
            point: Number(user.point),
            status: Boolean(user.status),
            created_at: new Date(String(user.createdAt)),
            updated_at: new Date(String(user.updatedAt)),
            last_login: new Date(String(user.lastLogin)),
        };
    } catch (err) {
        throw new Error("The user does not exist. {" + err + "}");
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
        return prefs.map((row) => ({
            id: Number(row.id),
            member_id: Number(row.memberId),
            prefer_food: String(row.preferFood),
        })) as PreferenceRow[];
    } catch (err) {
        throw new Error("Error getting preferences. {" + err + "}");
    }

};
