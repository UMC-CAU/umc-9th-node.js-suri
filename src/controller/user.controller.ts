import type {NextFunction, Request, Response} from "express";

import {bodyToUser, bodyToUserUpdateLogin} from "../dtos/user.dtos";
import {userSignUp, userUpdateLoginSevice,} from "../service/user.service";

export const handleUserSignUp = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    /*
    #swagger.summary = '회원가입 API';
    #swagger.description = '새로운 사용자를 등록합니다.';
    #swagger.tags = ['User'];
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
              name: { type: "string", example: "홍길동" },
              nickname: { type: "string", example: "닉네임" },
              gender: { type: "string", example: "MALE" },
              birthdate: { type: "string", format: "date", example: "1999-01-01" },
              phoneNumber: { type: "string", example: "010-1234-5678" },
              password: { type: "string", example: "password123" },
              preferences: { type: "array", items: { type: "string" }, example: ["한식", "중식"]}
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "회원가입 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "SUCCESS" },
              error: { type: "object", nullable: true, example: null },
              result: {
                type: "object",
                properties: {
                  id: { type: "number", example: 1 },
                  email: { type: "string", example: "user@example.com" },
                  name: { type: "string", example: "홍길동" },
                  nickname: { type: "string", example: "닉네임" },
                  gender: { type: "string", example: "MALE" },
                  birthdate: { type: "string", format: "date", example: "1999-01-01" },
                  phoneNumber: { type: "string", example: "010-1234-5678" },
                  status: { type: "string", example: "ACTIVE" },
                  point: { type: "number", example: 0 },
                  preferences: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number", example: 1 },
                        name: { type: "string", example: "한식" }
                      }
                    }
                  },
                  createdAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
                  updatedAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "이미 존재하는 이메일",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "U001" },
                  reason: { type: "string", example: "이미 존재하는 이메일." },
                  data: { type: "object", nullable: true }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[401] = {
      description: "선호도 미선택",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "U002" },
                  reason: { type: "string", example: "선호도를 선택해야합니다!" },
                  data: { type: "object", nullable: true }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[500] = {
      description: "사용자 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "unknown" },
                  reason: { type: "string", example: "가입한 유저를 찾을 수 없습니다." },
                  data: { type: "object", nullable: true, example: null }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    */
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body);

    const user = await userSignUp(bodyToUser(req.body));
    res.success(user);
};

export const handleUserUpdateLogin = async (
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    /*
    #swagger.summary = '사용자 마지막 로그인 시간 업데이트 API';
    #swagger.description = '사용자의 마지막 로그인 시간을 현재 시간으로 업데이트합니다.';
    #swagger.tags = ['User'];
    #swagger.responses[200] = {
      description: "마지막 로그인 시간 업데이트 성공 응답",


     */
    console.log("사용자 마지막 로그인 업데이트를 요청했습니다!");
    const userId = req.user?.id;
    if (!userId) {
        throw new Error("Request is not authenticated");
    }
    const user = await userUpdateLoginSevice(userId, bodyToUserUpdateLogin(req.body));
    res.success(user);
}