import {createHmac} from "crypto";

export interface JwtPayload {
    sub: number;
    email: string;
    exp?: number;
    iat?: number;
}

const base64UrlEncode = (input: string | Buffer): string => {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

const base64UrlDecode = (input: string): string => {
    input = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = input.length % 4;
    if (pad) {
        input += "=".repeat(4 - pad);
    }
    return Buffer.from(input, "base64").toString();
};

const getSecret = (): string => {
    return process.env.JWT_SECRET || "super-secret-key";
};

export const signJwt = (payload: JwtPayload, expiresInSeconds = 60 * 60): string => {
    const header = {alg: "HS256", typ: "JWT"};
    const issuedAt = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
        ...payload,
        iat: issuedAt,
        exp: issuedAt + expiresInSeconds,
    };

    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
    const data = `${headerEncoded}.${payloadEncoded}`;
    const signature = createHmac("sha256", getSecret())
        .update(data)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return `${data}.${signature}`;
};

export const verifyJwt = (token: string): JwtPayload => {
    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid token format");
    }
    const [headerEncoded, payloadEncoded, signature] = parts;
    const data = `${headerEncoded}.${payloadEncoded}`;
    const expectedSignature = createHmac("sha256", getSecret())
        .update(data)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    if (expectedSignature !== signature) {
        throw new Error("Signature mismatch");
    }

    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as JwtPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Token expired");
    }
    return payload;
};
