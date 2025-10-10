use mydb2;


CREATE TABLE `member` (
	`id`	bigint	NOT NULL,
	`name`	varchar(20)	NULL,
	`gender`	varchar(20)	NULL,
	`birthdate`	datetime	NULL,
	`created_at`	datetime(6)	NULL,
	`updated_at`	datetime(6)	NULL,
	`status`	varchar(20)	NULL,
	`last_login`	datetime	NULL,
	`email`	varchar(20)	NULL,
	`password`	varchar(20)	NULL,
	`point`	varchar(20)	NULL
);

CREATE TABLE `foodcategory` (
	`id`	bigint	NOT NULL,
	`member_id`	bigint	NOT NULL,
	`prefer_food`	varchar(20)	NULL
);

CREATE TABLE `review_photo` (
	`id`	bigint	NOT NULL,
	`reveiw_id`	bigint	NOT NULL,
	`link`	varchar(60)	NULL
);

CREATE TABLE `review` (
	`id`	bigint	NOT NULL,
	`member_id`	bigint	NOT NULL,
	`store_id`	bigint	NOT NULL,
	`grade`	varchar(20)	NULL,
	`description`	varchar(30)	NULL,
	`created_at`	datetime(6)	NULL
);

CREATE TABLE `member_mission` (
	`id`	bigint	NOT NULL,
	`member_id`	bigint	NOT NULL,
	`mission_id`	bigint	NOT NULL,
	`created_at`	datetime(6)	NULL,
	`updated_at`	datetime(6)	NULL,
	`address`	varchar(20)	NULL,
	`is_completed`	boolean	NULL,
	`deadline`	datetime(6)	NULL,
	`activated`	boolean	NULL
);

CREATE TABLE `store` (
	`id`	bigint	NOT NULL,
	`food_category_id`	bigint	NOT NULL,
	`subscription`	varchar(20)	NULL,
	`address`	varchar(20)	NULL
);

CREATE TABLE `mission` (
	`id`	bigint	NOT NULL,
	`description`	varchar(20)	NULL,
	`title`	varchar(20)	NULL,
	`point_reward`	bigint	NULL
);

ALTER TABLE `member` ADD CONSTRAINT `PK_MEMBER` PRIMARY KEY (
	`id`
);

ALTER TABLE `foodcategory` ADD CONSTRAINT `PK_FOODCATEGORY` PRIMARY KEY (
	`id`,
	`member_id`
);

ALTER TABLE `review_photo` ADD CONSTRAINT `PK_REVIEW_PHOTO` PRIMARY KEY (
	`id`,
	`reveiw_id`
);

ALTER TABLE `review` ADD CONSTRAINT `PK_REVIEW` PRIMARY KEY (
	`id`,
	`member_id`,
	`store_id`
);

ALTER TABLE `member_mission` ADD CONSTRAINT `PK_MEMBER_MISSION` PRIMARY KEY (
	`id`,
	`member_id`,
	`mission_id`
);

ALTER TABLE `store` ADD CONSTRAINT `PK_STORE` PRIMARY KEY (
	`id`,
	`food_category_id`
);

ALTER TABLE `mission` ADD CONSTRAINT `PK_MISSION` PRIMARY KEY (
	`id`
);

ALTER TABLE `foodcategory` ADD CONSTRAINT `FK_member_TO_foodcategory_1` FOREIGN KEY (
	`member_id`
)
REFERENCES `member` (
	`id`
);

ALTER TABLE review DROP PRIMARY KEY;

ALTER TABLE review
    ADD PRIMARY KEY (id);

ALTER TABLE `review_photo` ADD CONSTRAINT `FK_review_TO_review_photo_1` FOREIGN KEY (
	`reveiw_id`
)
REFERENCES `review` (
	`id`
);

ALTER TABLE `review` ADD CONSTRAINT `FK_member_TO_review_1` FOREIGN KEY (
	`member_id`
)
REFERENCES `member` (
	`id`
);

ALTER TABLE `review` ADD CONSTRAINT `FK_store_TO_review_1` FOREIGN KEY (
	`store_id`
)
REFERENCES `store` (
	`id`
);

ALTER TABLE `member_mission` ADD CONSTRAINT `FK_member_TO_member_mission_1` FOREIGN KEY (
	`member_id`
)
REFERENCES `member` (
	`id`
);

ALTER TABLE `member_mission` ADD CONSTRAINT `FK_mission_TO_member_mission_1` FOREIGN KEY (
	`mission_id`
)
REFERENCES `mission` (
	`id`
);



ALTER TABLE `store` ADD CONSTRAINT `FK_foodcategory_TO_store_1` FOREIGN KEY (
	`food_category_id`
)
REFERENCES `foodcategory` (
	`id`
);

ALTER TABLE `store`
    ADD COLUMN `name` VARCHAR(50) NOT NULL AFTER `id`;

UPDATE store SET name = 'Pizza Heaven'    WHERE id = 1;
UPDATE store SET name = 'Pasta Story'     WHERE id = 2;
UPDATE store SET name = 'Sushi World'     WHERE id = 3;
UPDATE store SET
                 name = 'Chicken House'   WHERE id = 4;
UPDATE store SET
                 name = 'Burger Planet'   WHERE id = 5;
UPDATE store SET name = 'Steak Factory'   WHERE id = 6;
UPDATE store SET name = 'Ramen Ichiban'   WHERE id = 7;
UPDATE store SET name = 'Salad Garden'    WHERE id = 8;
UPDATE store SET
                 name = 'Kimbap Town'     WHERE id = 9;
UPDATE store SET name = 'BBQ Village'     WHERE id = 10;

UPDATE store SET name = 'Sushi Central'   WHERE id = 201;
UPDATE store SET name = 'Ramen Bupyeong'  WHERE id = 202;
UPDATE store SET name = 'Tempura House'   WHERE id = 203;
UPDATE store SET name = 'Udon Station'    WHERE id = 204;
UPDATE store SET
                 name = 'Curry Spot'      WHERE id = 205;

UPDATE store SET name = 'Salad Hall'      WHERE id = 211;
UPDATE store SET name = 'Sandwich Hub'    WHERE id = 212;
UPDATE store SET name = 'Pizza Seogwipo'  WHERE id = 213;
UPDATE store SET name = 'Pho Hamdeok'     WHERE id = 214;
UPDATE store SET name = 'Steak Jungmun'   WHERE id = 215;

UPDATE store SET name = 'Tonkatsu Bupyeong'  WHERE id = 801;
UPDATE store SET name = 'Hotpot Bupyeong'    WHERE id = 802;
UPDATE store SET name = 'Bibimbap Bupyeong'  WHERE id = 803;
UPDATE store SET name = 'Gimbap Bupyeong'    WHERE id = 804;
UPDATE store SET
                 name = 'Jjajang Bupyeong'   WHERE id = 805;

ALTER TABLE member
    ADD COLUMN nickname VARCHAR(30) NULL AFTER name,
    ADD COLUMN phone_number VARCHAR(20) NULL AFTER email;

UPDATE member SET nickname = 'alice95',  phone_number = '010-1111-1111' WHERE id = 1;
UPDATE member SET nickname = 'bobby94',  phone_number = '010-2222-2222' WHERE id = 2;
UPDATE member SET nickname = 'charlie93', phone_number = '010-3333-3333' WHERE id = 3;
UPDATE member SET nickname = 'didi92',   phone_number = '010-4444-4444' WHERE id = 4;
UPDATE member SET nickname = 'eve91',    phone_number = '010-5555-5555' WHERE id = 5;
UPDATE member SET nickname = 'franky90', phone_number = '010-6666-6666' WHERE id = 6;
UPDATE member SET nickname = 'grace89',  phone_number = '010-7777-7777' WHERE id = 7;
UPDATE member SET nickname = 'henry88',  phone_number = '010-8888-8888' WHERE id = 8;
UPDATE member SET nickname = 'ivy87',    phone_number = '010-9999-9999' WHERE id = 9;
UPDATE member SET nickname = 'jack86',   phone_number = '010-1010-1010' WHERE id = 10;

-- mission 테이블에 store_id 컬럼 추가
ALTER TABLE mission
    ADD COLUMN store_id BIGINT NULL AFTER point_reward;

-- mission.store_id → store.id 외래키(FK) 제약조건 추가
ALTER TABLE mission
    ADD CONSTRAINT FK_store_TO_mission
        FOREIGN KEY (store_id)
            REFERENCES store (id);
ALTER TABLE store DROP PRIMARY KEY;
ALTER TABLE store ADD PRIMARY KEY (id);
ALTER TABLE mission
    ADD CONSTRAINT FK_store_TO_mission
        FOREIGN KEY (store_id)
            REFERENCES store (id);



-- 기본 미션
UPDATE mission SET store_id = 1   WHERE id = 1;   -- Eat Pizza
UPDATE mission SET store_id = 2   WHERE id = 2;   -- Try Pasta
UPDATE mission SET store_id = 3   WHERE id = 3;   -- Enjoy Sushi
UPDATE mission SET store_id = 4   WHERE id = 4;   -- Eat Chicken
UPDATE mission SET store_id = 5   WHERE id = 5;   -- Burger Time
UPDATE mission SET store_id = 6   WHERE id = 6;   -- Grill Steak
UPDATE mission SET store_id = 7   WHERE id = 7;   -- Spicy Ramen
UPDATE mission SET store_id = 8   WHERE id = 8;   -- Fresh Salad
UPDATE mission SET store_id = 9   WHERE id = 9;   -- Kimbap Lunch
UPDATE mission SET store_id = 10  WHERE id = 10;  -- Korean BBQ

-- 일본 음식 카테고리
UPDATE mission SET store_id = 201 WHERE id = 301; -- Eat Sushi (Sushi Central)
UPDATE mission SET store_id = 202 WHERE id = 302; -- Try Ramen (Ramen Bupyeong)
UPDATE mission SET store_id = 203 WHERE id = 303; -- Taste Tempura
UPDATE mission SET store_id = 204 WHERE id = 304; -- Enjoy Udon
UPDATE mission SET store_id = 205 WHERE id = 305; -- Spicy Curry

-- 샐러드/샌드위치/피자/쌀국수/스테이크
UPDATE mission SET store_id = 211 WHERE id = 311; -- Fresh Salad (Salad Hall)
UPDATE mission SET store_id = 212 WHERE id = 312; -- Eat Sandwich
UPDATE mission SET store_id = 213 WHERE id = 313; -- Try Pizza (Pizza Seogwipo)
UPDATE mission SET store_id = 214 WHERE id = 314; -- Taste Pho
UPDATE mission SET store_id = 215 WHERE id = 315; -- Grill Steak (Steak Jungmun)

-- 부평 지역 매장
UPDATE mission SET store_id = 801 WHERE id = 901; -- Eat Tonkatsu
UPDATE mission SET store_id = 802 WHERE id = 902; -- Try Hotpot
UPDATE mission SET store_id = 803 WHERE id = 903; -- Taste Bibimbap
UPDATE mission SET store_id = 804 WHERE id = 904; -- Enjoy Gimbap
UPDATE mission SET store_id = 805 WHERE id = 905; -- Slurp Jjajangmyeon
