import crypto from "crypto";

export interface AuthTokenPayload {
    id: number;
    email: string;
    name: string;
    exp?: number;

}

const base64UrlEncode = (input: string | Buffer): string =>
    Buffer.from(input).toString("base64url");

const base64UrlDecode = (input: string): Buffer => Buffer.from(input, "base64url");

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export const signToken = (
    payload: AuthTokenPayload,
    expiresInSeconds = 60 * 60 * 24 * 7,
): string => {
    const header = {alg: "HS256", typ: "JWT"};
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const body = {...payload, exp};

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedBody = base64UrlEncode(JSON.stringify(body));
    const data = `${encodedHeader}.${encodedBody}`;

    const signature = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(data)
        .digest("base64url");

    return `${data}.${signature}`;
};

export const verifyToken = (token: string): AuthTokenPayload => {
    const [encodedHeader, encodedBody, signature] = token.split(".");
    if (!encodedHeader || !encodedBody || !signature) {
        throw new Error("Invalid token format");
    }

    const data = `${encodedHeader}.${encodedBody}`;
    const expectedSignature = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(data)
        .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error("Invalid token signature");
    }

    const payload = JSON.parse(base64UrlDecode(encodedBody).toString()) as AuthTokenPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Token expired");
    }

    return payload;
};