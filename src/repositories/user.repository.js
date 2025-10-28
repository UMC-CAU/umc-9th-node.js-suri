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

export const addStore = async (data) => {
    const conn = await pool.getConnection();

    try {
        // food_category_id 타입 검증 및 변환
        const foodCategoryId = Number(data.food_category_id);
        if (isNaN(foodCategoryId)) {
            throw new Error("올바른 food_category_id 값이 아닙니다.");
        }

        // 현재 최대 ID 값을 조회
        const [maxId] = await pool.query(
            `SELECT MAX(id) as maxId FROM store`
        );
        const nextId = (maxId[0].maxId || 0) + 1;

        const [result] = await pool.query(
            `INSERT INTO store (id, name, food_category_id, subscription, address, detail_address)
            VALUES (?, ?, ?, ?, ?, ?);`,
            [
                nextId,
                data.name,
                foodCategoryId,  // 변환된 숫자 값 사용
                data.subscription || '',
                data.address || '',
                data.detail_address || ''
            ]
        );

        return nextId;
    } catch (err) {
        console.error("SQL 에러:", err);
        throw new Error(`오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`);
    } finally {
        conn.release();
    }
};

export const addReview = async (data) => {
    const conn = await pool.getConnection();

    try {
        const [confirm] = await pool.query(
            `SELECT EXISTS(SELECT 1 FROM store WHERE id = ?) as isExistStore;`,
            [data.store_id]
        );

        if (!confirm[0].isExistStore) {
            return null;

        }

        const [maxId] = await pool.query(
            `SELECT MAX(id) as maxId FROM review`
        );
        const nextId = (maxId[0].maxId || 0) + 1;


        const [result] = await pool.query(
            `INSERT INTO review (id, member_id, store_id, grade, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?);`,  // 파라미터 개수를 6개로 맞춤
            [
                nextId,
                data.member_id,
                data.store_id,
                data.grade,
                data.description,
                data.created_at  // 서비스에서 전달받은 created_at 사용
            ]
        );

        return nextId;

    }
    catch (err) {
        throw new Error(`오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`);
    } finally {
        conn.release();
    }

}

export const addMission = async (data) => {
    const conn = await pool.getConnection();

    try {
        const [confirm] = await pool.query(
            `SELECT EXISTS(SELECT 1 FROM store WHERE id = ?) as isExistStore;`,
            [data.store_id]
        );

        if (!confirm[0].isExistStore) {
            return null;
        }

        // review 테이블이 아닌 mission 테이블에서 MAX(id) 조회
        const [maxId] = await pool.query(
            `SELECT MAX(id) as maxId FROM mission`
        );
        const nextId = (maxId[0].maxId || 0) + 1;


        const [result] = await pool.query(
            `INSERT INTO mission (id, title, description, point_reward, store_id)
            VALUES (?, ?, ?, ?, ?);`,
            [
                nextId,
                data.title,
                data.description,
                data.point_reward,
                data.store_id
            ]
        );

        return nextId;

    }
    catch (err) {
        throw new Error(`오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`);
    } finally {
        conn.release();
    }

}

export const startMemberMission = async (data) => {
    const conn = await pool.getConnection();

    try {
        const [confirm] = await pool.query(
            `SELECT EXISTS(SELECT * FROM member_mission 
            WHERE mission_id = ? AND address = ? AND member_id = ?) as isExistMemberMission;`,
            [data.mission_id, data.address, data.member_id]
        );

        if (!confirm[0].isExistMemberMission) { //member_mission에 존재하지 않을때 member_mission에 추가하기
            const [maxId] = await pool.query(
                `SELECT MAX(id) as maxId FROM member_mission`
            );
            const nextId = (maxId[0].maxId || 0) + 1;


            const now = new Date();
            const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const [result] = await pool.query(
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
                    oneWeekLater, //deadline 현재로부터 일주일 뒤
                    1 // member_mission에 추가되는 것은 결국 도전했다는 것 
                ]
            );
            return nextId

        }
        else {
            const [result] = await pool.query(
                `SELECT * FROM member_mission 
                WHERE mission_id = ? AND address = ? AND member_id = ?;`,
                [data.mission_id, data.address, data.member_id]
            );

            console.log("조회된 미션:", result[0]);  // 전체 데이터 확인

            if (result[0].activated === 1) {
                return { message: "이미 활성화된 미션입니다." };
            }
            else {
                const now = new Date();
                const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                // activated를 1로 업데이트 & 데드라인과 업데이트 시각 수정
                const [updateResult] = await pool.query(
                    `UPDATE member_mission 
                    SET activated = 1, updated_at = ? , deadline = ?
                    WHERE mission_id = ? AND address = ? AND member_id = ?;`,
                    [new Date(), oneWeekLater, data.mission_id, data.address, data.member_id]
                );

                return result[0].id;

            }

        }
    }
    catch (err) {
        throw new Error(`오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`);
    } finally {
        conn.release();
    }



}