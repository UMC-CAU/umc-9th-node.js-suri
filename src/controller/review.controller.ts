import type {NextFunction, Request, Response} from "express";
import {bodyToReview} from "../dtos/review.dtos";
import {addMemReview, listMemberReviews} from "../service/review.service";
import {listStoreReview} from "../service/store.service";


export const handleInsertReview = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<Response | void> => {
    /*
    #swagger.summary = '리뷰 작성 API';
    #swagger.description = '가게에 대한 리뷰를 작성합니다.';
    #swagger.tags = ['Review'];
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["member_id", "store_id", "grade", "description"],
            properties: {
              member_id: { type: "number", example: 1 },
              store_id: { type: "number", example: 1 },
              grade: { type: "string", example: "5" },
              description: { type: "string", example: "정말 맛있는 음식점입니다!" }
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "리뷰 작성 성공",
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
                  store_id: { type: "number", example: 1 },
                  grade: { type: "string", example: "5" },
                  description: { type: "string", example: "정말 맛있는 음식점입니다!" },
                  created_at: { type: "string", format: "date-time" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "리뷰 작성 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "R001" },
                  reason: { type: "string", example: "리뷰의 정보를 정확히 입력해주세요" },
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
      description: "리뷰 등록에 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "R002" },
                  reason: { type: "string", example: "리뷰 등록에 실패" },
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
        console.log("Request Data : ", req.body);

        const reviewData = bodyToReview(req.body);
        const result = await addMemReview(reviewData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleGetMemberReview = async (
    req: Request<{ memberId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    /*
    #swagger.summary = '사용자 리뷰 조회 API';
    #swagger.description = '특정 사용자가 작성한 리뷰 목록을 조회합니다.';
    #swagger.tags = ['Review'];
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
      description: "사용자 리뷰 조회 성공",
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
                    nickname: { type: "string", example: "닉네임" },
                    store_name: { type: "string", example: "맛있는 음식점" },
                    grade: { type: "string", example: "5" },
                    description: { type: "string", example: "정말 맛있는 음식점입니다!" },
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
      description: "멤버 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "LM001" },
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
     #swagger.responses[401] = {
      description: "리뷰 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "LM001" },
                  reason: { type: "string", example: "리뷰를 찾을 수 없습니다." },
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
        const memberId = parseInt(req.params.memberId, 10);

        const reviews = await listMemberReviews(
            memberId, cursor
        );
        res.success(reviews);


    } catch (err: any) {
        console.error("Error:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetStoreReivew = async (
    req: Request<{ storeId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    /*
    #swagger.summary = '가게 리뷰 조회 API';
    #swagger.description = '특정 가게에 대한 리뷰 목록을 조회합니다.';
    #swagger.tags = ['Review'];
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
      description: "가게 리뷰 조회 성공",
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
                    nickname: { type: "string", example: "닉네임" },
                    store_name: { type: "string", example: "맛있는 음식점" },
                    grade: { type: "string", example: "5" },
                    description: { type: "string", example: "정말 맛있는 음식점입니다!" },
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
      description: "가게 리뷰 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "LS001" },
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
    #swagger.responses[401] = {
      description: "리뷰 조회 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "LS001" },
                  reason: { type: "string", example: "리뷰를 찾을 수 없습니다." },
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
        const cursor = parseInt(req.query.cursor as string, 10);

        const storeID = parseInt(req.params.storeId, 10);


        const reviews = await listStoreReview(
            storeID, cursor
        );
        res.success(reviews);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}
