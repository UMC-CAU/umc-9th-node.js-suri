import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {prisma} from "./db.config"; // JWT 생성을 위해 import
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
}

export const generateAccessToken = (user: { id: number | bigint, email: string | null, name: string }) => {


    return jwt.sign(
        {id: user.id, email: user.email},
        jwtSecret,
        {expiresIn: '1h'}
    );
};

export const generateRefreshToken = (user: { id: number | bigint, email: string | null, name: string }) => {
    return jwt.sign(
        {id: user.id},
        jwtSecret,
        {expiresIn: '14d'}
    );
};

// GoogleVerify
const googleVerify = async (profile: any) => {
    const email = profile.emails?.[0]?.value;
    if (!email) {
        throw new Error(`profile.email was not found: ${profile}`);
    }

    const user = await prisma.member.findFirst({where: {email}});

    if (user !== null) {
        return {id: parseInt(user.id.toString(), 10), email: user.email, name: user.name};
    }

    const created = await prisma.member.create({
        data: {
            email: email,
            name: profile.displayName,
            nickname: "",
            gender: "user.gender",
            birthdate: "user.birthdate",
            phoneNumber: "user.phone_number,",
            point: 0,
            status: "",
            password: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date(),
        },
    });

    return {id: created.id, email: created.email, name: created.name};
};

// GoogleStrategy
const clientID = process.env.PASSPORT_GOOGLE_CLIENT_ID;
if (!clientID) {
    throw new Error("PASSPORT_GOOGLE_CLIENT_ID is not defined");
}
const clientSecret = process.env.PASSPORT_GOOGLE_CLIENT_SECRET;
if (!clientSecret) {
    throw new Error("PASSPORT_GOOGLE_CLIENT_SECRET is not defined");
}

export const googleStrategy = new GoogleStrategy(
    {
        clientID,
        clientSecret,
        callbackURL: "/oauth2/callback/google",
        scope: ["email", "profile"],
    },


    async (accessToken, refreshToken, profile, cb) => {
        try {

            const user = await googleVerify(profile);


            const jwtAccessToken = generateAccessToken(user);
            const jwtRefreshToken = generateRefreshToken(user);


            return cb(null, {
                accessToken: jwtAccessToken,
                refreshToken: jwtRefreshToken,
            } as any);

        } catch (err) {
            return cb(err);
        }
    }
);

const jwtOptions = {
    // 요청 헤더의 'Authorization'에서 'Bearer <token>' 토큰을 추출
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
};

export const jwtStrategy = new JwtStrategy(jwtOptions, async (payload: any, done: any) => {
    try {
        const user = await prisma.member.findFirst({where: {id: payload.id}});

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
});

