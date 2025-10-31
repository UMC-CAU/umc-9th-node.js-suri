import { pool } from "../db.config";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
    memberEntityDB,
    MemberMissionCreateDTO,
    MissionCreateDTO,
    ReviewCreateDTO,
    StoreCreateDTO,
} from "../dtos/user.dtos";

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
    point: number | string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
}

// Add new user; returns inserted ID or null if email already exists
export const addUser = async (
    data: UserInsertPayload,
): Promise<number | null> => {
    const conn = await pool.getConnection();
    try {
        const [confirm] = await pool.query<RowDataPacket[]>(
            `SELECT EXISTS(SELECT 1 FROM member WHERE email = ?) as isExistEmail;`,
            [data.email],
        );

        if (confirm[0]?.isExistEmail) {
            return null;
        }

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO member (email, name, nickname, gender, birthdate, phone_number,
            password, status, point, created_at, updated_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                data.email,
                data.name,
                data.nickname,
                data.gender,
                data.birthdate,
                data.phoneNumber,
                data.password,
                data.status,
                data.point,
                data.createdAt,
                data.updatedAt,
                data.lastLogin,
            ],
        );

        return result.insertId;
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
    }
};

// Get single user by id
export const getUser = async (userId: number): Promise<memberEntityDB> => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM member WHERE id = ?;`,
            [userId],
        );

        if (!rows || rows.length === 0) {
            throw new Error("User not found");
        }

        // RowDataPacket has any-typed fields, cast to our entity
        return rows[0] as unknown as memberEntityDB;
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
    }
};

// Map preferred food category for a user; returns created id (manual incremental)
export const setPreference = async (
    userId: number,
    preferFood: string,
): Promise<number> => {
    const conn = await pool.getConnection();
    try {
        const [maxIdRows] = await pool.query<RowDataPacket[]>(
            `SELECT MAX(id) as maxId FROM foodcategory WHERE member_id = ?;`,
            [userId],
        );
        const nextId = (maxIdRows[0]?.maxId || 0) + 1;

        await pool.query<ResultSetHeader>(
                `INSERT INTO foodcategory (id, member_id, prefer_food) VALUES (?, ?, ?);`,
                [nextId, userId, preferFood],
            );

        return nextId;
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
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
    const conn = await pool.getConnection();
    try {
        const [preferences] = await pool.query<RowDataPacket[]>(
            `SELECT id, member_id, prefer_food FROM foodcategory WHERE member_id = ?;`,
            [userId],
        );
        return preferences as unknown as PreferenceRow[];
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
    }
};

// Insert store; returns manual next id or null on invalid foreign keys
export const addStore = async (
    data: StoreCreateDTO,
): Promise<number | null> => {
    const conn = await pool.getConnection();
    try {
        const foodCategoryId = Number(data.food_category_id);
        if (Number.isNaN(foodCategoryId)) {
            throw new Error("올바른 food_category_id 값이 아닙니다.");
        }

        const [maxIdRows] = await pool.query<RowDataPacket[]>(
            `SELECT MAX(id) as maxId FROM store`,
        );
        const nextId = (maxIdRows[0]?.maxId || 0) + 1;

        await pool.query<ResultSetHeader>(
            `INSERT INTO store (id, name, food_category_id, subscription, address, detail_address)
            VALUES (?, ?, ?, ?, ?, ?);`,
            [
                nextId,
                data.name,
                foodCategoryId,
                (data.subscription as any) ?? "",
                data.address ?? "",
                data.detail_address ?? "",
            ],
        );

        return nextId;
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
    }
};

// Insert review; returns new id or null when store not exists
export interface ReviewInsertPayload extends ReviewCreateDTO {
    created_at: Date;
}

export const addReview = async (
    data: ReviewInsertPayload,
): Promise<number | null> => {
    const conn = await pool.getConnection();
    try {
        const [confirm] = await pool.query<RowDataPacket[]>(
            `SELECT EXISTS(SELECT 1 FROM store WHERE id = ?) as isExistStore;`,
            [data.store_id],
        );

        if (!confirm[0]?.isExistStore) {
            return null;
        }

        const [maxIdRows] = await pool.query<RowDataPacket[]>(
            `SELECT MAX(id) as maxId FROM review`,
        );
        const nextId = (maxIdRows[0]?.maxId || 0) + 1;

        await pool.query<ResultSetHeader>(
            `INSERT INTO review (id, member_id, store_id, grade, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?);`,
            [
                nextId,
                data.member_id,
                data.store_id,
                data.grade,
                data.description,
                Date(),
            ],
        );

        return nextId;
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
    }
};

// Insert mission; returns new id or null when store not exists
export const addMission = async (
    data: MissionCreateDTO,
): Promise<number | null> => {
    const conn = await pool.getConnection();
    try {
        const [confirm] = await pool.query<RowDataPacket[]>(
            `SELECT EXISTS(SELECT 1 FROM store WHERE id = ?) as isExistStore;`,
            [data.store_id],
        );

        if (!confirm[0]?.isExistStore) {
            return null;
        }

        const [maxIdRows] = await pool.query<RowDataPacket[]>(
            `SELECT MAX(id) as maxId FROM mission`,
        );
        const nextId = (maxIdRows[0]?.maxId || 0) + 1;

        await pool.query<ResultSetHeader>(
            `INSERT INTO mission (id, title, description, point_reward, store_id)
            VALUES (?, ?, ?, ?, ?);`,
            [nextId, data.title, data.description, data.point_reward, data.store_id],
        );

        return nextId;
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
    }
};

// Start/activate a member mission; returns id (new or existing) or null when already active
export const startMemberMission = async (
    data: Pick<
        MemberMissionCreateDTO,
        "member_id" | "mission_id" | "address" | "is_completed"
    >,
): Promise<number | null> => {
    const conn = await pool.getConnection();
    try {
        const [confirm] = await pool.query<RowDataPacket[]>(
            `SELECT EXISTS(SELECT * FROM member_mission 
            WHERE mission_id = ? AND address = ? AND member_id = ?) as isExistMemberMission;`,
            [data.mission_id, data.address, data.member_id],
        );

        if (!confirm[0]?.isExistMemberMission) {
            const [maxIdRows] = await pool.query<RowDataPacket[]>(
                `SELECT MAX(id) as maxId FROM member_mission`,
            );
            const nextId = (maxIdRows[0]?.maxId || 0) + 1;

            const now = new Date();
            const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            await pool.query<ResultSetHeader>(
                `INSERT INTO member_mission (id, member_id, mission_id, created_at, updated_at, address, is_completed, deadline, activated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    nextId,
                    data.member_id,
                    data.mission_id,
                    new Date(),
                    new Date(),
                    data.address,
                    data.is_completed,
                    oneWeekLater,
                    1,
                ],
            );
            return nextId;
        } else {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT * FROM member_mission 
                WHERE mission_id = ? AND address = ? AND member_id = ?;`,
                [data.mission_id, data.address, data.member_id],
            );
            const existing = rows[0] as RowDataPacket | undefined;
            if (!existing) return null;

            if (existing.activated === 1) {
                // Already active → align with service expectation: treat as failure
                return null;
            } else {
                const now = new Date();
                const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                await pool.query<ResultSetHeader>(
                    `UPDATE member_mission 
                    SET activated = 1, updated_at = ? , deadline = ?
                    WHERE mission_id = ? AND address = ? AND member_id = ?;`,
                    [
                        new Date(),
                        oneWeekLater,
                        data.mission_id,
                        data.address,
                        data.member_id,
                    ],
                );
                return (existing as any).id as number;
            }
        }
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    } finally {
        conn.release();
    }
};
