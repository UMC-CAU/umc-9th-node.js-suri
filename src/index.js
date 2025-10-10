import express from "express";
import mysql from "mysql2";

const app = express();
const PORT = 3000;

// DB 연결 설정
const db = mysql.createConnection({
    host: "localhost",
    user: "root",       // MySQL 계정
    password: "ehgus0328",
    database: "mydb2" // 위에서 만든 DB 이름
});

// DB 연결 테스트
db.connect(err => {
    if (err) {
        console.error("❌ DB 연결 실패:", err);
    } else {
        console.log("✅ DB 연결 성공");
    }
});

// 루트 경로
app.get("/", (req, res) => {
    res.send("🚀 서버가 정상적으로 실행 중입니다!");
});

// 간단한 API - user 목록 불러오기
app.get("/users", (req, res) => {
    db.query("SELECT * FROM member", (err, results) => {
        if (err) {
            return res.status(500).send("DB 조회 실패");
        }
        res.json(results);
    });
});

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
