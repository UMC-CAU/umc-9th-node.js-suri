import { pool } from "../db.config.js";

// User 데이터 삽입
export const addUser = async (data) => {
    const conn = await pool.getConnection();

    try {
        const [confirm] = await pool.query(
            `SELECT EXISTS(SELECT 1 FROM member WHERE email = ?) as isExistEmail;`,
            data.email
        );

        if (confirm[0].isExistEmail) {
            return null;
        }

        const [result] = await pool.query(
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
                data.lastLogin
            ]
        );

        return result.insertId;
    } catch (err) {
        throw new Error(`오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`);
    } finally {
        conn.release();
    }
};

// 사용자 정보 얻기
export const getUser = async (userId) => {
    const conn = await pool.getConnection();

    try {
        const [user] = await pool.query(`SELECT * FROM member WHERE id = ?;`, userId);

        console.log(user);

        if (user.length == 0) {
            return null;
        }

        return user;
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`
        );
    } finally {
        conn.release();
    }
};

// 음식 선호 카테고리 매핑
export const setPreference = async (userId, preferFood) => {
    const conn = await pool.getConnection();

    try {
        // 현재 최대 ID 값을 조회
        const [maxId] = await pool.query(
            `SELECT MAX(id) as maxId FROM foodcategory WHERE member_id = ?;`,
            [userId]
        );
        const nextId = (maxId[0].maxId || 0) + 1;

        // ID를 직접 지정하여 삽입
        await pool.query(
            `INSERT INTO foodcategory (id, member_id, prefer_food) VALUES (?, ?, ?);`,
            [nextId, userId, preferFood]
        );

        return nextId;
    } catch (err) {
        throw new Error(`오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`);
    } finally {
        conn.release();
    }
};

// 사용자 선호 카테고리 반환
export const getUserPreferencesByUserId = async (userId) => {
    const conn = await pool.getConnection();

    try {
        const [preferences] = await pool.query(
            "SELECT id, member_id, prefer_food FROM foodcategory WHERE member_id = ?;",
            userId
        );
        return preferences;
    } catch (err) {
        throw new Error(`오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`);
    } finally {
        conn.release();
    }
};


