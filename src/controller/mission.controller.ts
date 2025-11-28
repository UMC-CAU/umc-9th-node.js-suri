import type {NextFunction, Request, Response} from "express";
import {bodyToMemberMission, bodyToMission} from "../dtos/mission.dtos";
import {getOnMemMission, insertMission, setOnMissionCompelete, startMission} from "../service/mission.service";
import {getStoreMission} from "../service/store.service";
import {AuthenticatedRequest} from "../types/auth";
import {StatusCodes} from "http-status-codes";


export const handleInsertMission = async (
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> => {
    /*
    #swagger.summary = '미션 생성 API';
    #swagger.description = '새로운 미션을 생성합니다.';
    #swagger.tags = ['Mission'];
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["title", "description", "point_reward", "store_id"],
            properties: {
              title: { type: "string", example: "리뷰 작성하기" },
              description: { type: "string", example: "가게에 방문하여 리뷰를 작성해주세요" },
              point_reward: { type: "number", example: 100 },
              store_id: { type: "number", example: 1 }
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "미션 생성 성공",
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
                  title: { type: "string", example: "리뷰 작성하기" },
                  description: { type: "string", example: "가게에 방문하여 리뷰를 작성해주세요" },
                  point_reward: { type: "number", example: 100 },
                  store_id: { type: "number", example: 1 }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 생성 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "M001" },
                  reason: { type: "string", example: "미션의 정보를 정확히 입력해주세요" },
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
      description: "미션 등록 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "M001" },
                  reason: { type: "string", example: "미션 등록에 실패" },
                  data: { type: "object", nullable: true }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    */
    try {
        if (!req.user) {
            res
                .status(StatusCodes.UNAUTHORIZED)
                .error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }

        console.log("Request Data : ", req.body);

        const missionData = bodyToMission(req.body);
        const result = await insertMission(missionData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleMissionStart = async (
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> => {
    /*
    #swagger.summary = '미션 시작 API';
    #swagger.description = '사용자가 미션을 시작합니다.';
    #swagger.tags = ['Mission'];
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["member_id", "mission_id", "address", "deadline"],
            properties: {
              member_id: { type: "number", example: 1 },
              mission_id: { type: "number", example: 1 },
              address: { type: "string", example: "서울시 강남구" },
              is_completed: { type: "boolean", example: false },
              deadline: { type: "string", format: "date-time", example: "2025-12-31T23:59:59Z" },
              activated: { type: "boolean", example: true }
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "미션 시작 성공",
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
                  member_id: { type: "number", example: 1 },
                  mission_id: { type: "number", example: 1 },
                  address: { type: "string", example: "서울시 강남구" },
                  is_completed: { type: "boolean", example: false },
                  deadline: { type: "string", format: "date-time" },
                  activated: { type: "boolean", example: true }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 시작 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "MM001" },
                  reason: { type: "string", example: "이미 시작된 미션입니다." },
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
      description: "미션 시작 정보 오류",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "MM001" },
                  reason: { type: "string", example: "미션 시작 정보를 정확히 입력해주세요." },
                  data: { type: "object", nullable: true }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    */
    try {
        if (!req.user) {
            res
                .status(StatusCodes.UNAUTHORIZED)
                .error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }

        console.log("Request Data : ", req.body);

        const missionData = bodyToMemberMission({...req.body, member_id: req.user.id});
        const result = await startMission(missionData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleGetOnMission = async (
    req: AuthenticatedRequest<{ memberId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction): Promise<void> => {
    /*
    #swagger.summary = '사용자 진행 중인 미션 조회 API';
    #swagger.description = '특정 사용자가 진행 중인 미션 목록을 조회합니다.';
    #swagger.tags = ['Mission'];
    #swagger.parameters[0] = {
      name: 'memberId',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: '사용자 ID',
      example: '1'
    };
    #swagger.parameters[1] = {
      name: 'cursor',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: '페이징을 위한 커서',
      example: '0'
    };
    #swagger.responses[200] = {
      description: "진행 중인 미션 조회 성공",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "SUCCESS" },
              error: { type: "object", nullable: true, example: null },
              result: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number", example: 1 },
                    member_id: { type: "number", example: 1 },
                    store_name: { type: "string", example: "맛있는 음식점" },
                    mission_title: { type: "string", example: "리뷰 작성하기" },
                    mission_description: { type: "string", example: "가게에 방문하여 리뷰를 작성해주세요" },
                    mission_point_reward: { type: "number", example: 100 },
                    activated: { type: "boolean", example: true },
                    is_completed: { type: "boolean", example: false },
                    created_at: { type: "string", format: "date-time" },
                    deadline: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "진행 중인 미션 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "MS001" },
                  reason: { type: "string", example: "진행중인 미션이 없습니다." },
                  data: { type: "number", example: 1 }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[401] = {
      description: "멤버 조회 오류",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "MS001" },
                  reason: { type: "string", example: "멤버를 찾을 수 없습니다." },
                  data: { type: "number", example: 1 }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    */
    try {
        if (!req.user) {
            res
                .status(StatusCodes.UNAUTHORIZED)
                .error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }

        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const memberId = parseInt(req.params.memberId, 10);

        if (memberId !== req.user.id) {
            res
                .status(StatusCodes.FORBIDDEN)
                .error({errorCode: "AUTH005", reason: "본인 정보만 조회할 수 있습니다."});
            return;
        }

        const onMissions = await getOnMemMission(memberId, cursor);
        res.success(onMissions);

    } catch (err: any) {
        console.error("Error:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleSetMissionCompelete = async (
    req: AuthenticatedRequest<{ memberId: string, missionId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    /*
    #swagger.summary = '미션 완료 API';
    #swagger.description = '사용자가 진행 중인 미션을 완료 처리합니다.';
    #swagger.tags = ['Mission'];
    #swagger.parameters[0] = {
      name: 'memberId',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: '사용자 ID',
      example: '1'
    };
    #swagger.parameters[1] = {
      name: 'missionId',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: '미션 ID',
      example: '1'
    };
    #swagger.parameters[2] = {
      name: 'cursor',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: '페이징을 위한 커서',
      example: '0'
    };
    #swagger.responses[200] = {
      description: "미션 완료 처리 성공",
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
                  message: { type: "string", example: "미션이 완료되었습니다." }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 완료 처리 실패",
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
                  reason: { type: "string", example: "진행중인 미션이 없습니다." },
                  data: { type: "object", nullable: true }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    */
    try {
        if (!req.user) {
            res
                .status(StatusCodes.UNAUTHORIZED)
                .error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }

        const memberId = parseInt(req.params.memberId, 10);
        const missionId = parseInt(req.params.missionId, 10);
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const cursorBigInt = BigInt(cursor);

        if (memberId !== req.user.id) {
            res
                .status(StatusCodes.FORBIDDEN)
                .error({errorCode: "AUTH005", reason: "본인 미션만 완료할 수 있습니다."});
            return;
        }

        const completeMission = await setOnMissionCompelete(memberId, missionId, cursorBigInt);
        res.success(completeMission);

    } catch (err: any) {
        console.error("Error:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetStoreMission = async (
    req: Request<{ storeId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    /*
    #swagger.summary = '특정 가게 미션 조회 API';
    #swagger.description = '특정 가게에서 제공하는 미션 목록을 조회합니다.';
    #swagger.tags = ['Mission'];
    #swagger.parameters[0] = {
      name: 'storeId',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: '가게 ID',
      example: '1'
    };
    #swagger.parameters[1] = {
      name: 'cursor',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: '페이징을 위한 커서',
      example: '0'
    };
    #swagger.responses[200] = {
      description: "가게 미션 조회 성공",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "SUCCESS" },
              error: { type: "object", nullable: true, example: null },
              result: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number", example: 1 },
                    title: { type: "string", example: "리뷰 작성하기" },
                    description: { type: "string", example: "가게에 방문하여 리뷰를 작성해주세요" },
                    point_reward: { type: "number", example: 100 },
                    store_id: { type: "number", example: 1 },
                    created_at: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "가게 미션 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "MS001" },
                  reason: { type: "string", example: "가게를 찾을 수 없습니다." },
                  data: { type: "number", example: 1 }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "MS001" },
                  reason: { type: "string", example: "미션이 없습니다." },
                  data: { type: "number", example: 1 }
                }
              },
              success: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    */
    try {
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const storeId = parseInt(req.params.storeId, 10);

        const missions = await getStoreMission(storeId, cursor);
        res.success(missions);

    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

