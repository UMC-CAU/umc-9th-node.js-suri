import type {Request, Response} from "express";
import {bodyToStore} from "../dtos/store.dtos";
import {addInsertStore} from "../service/store.service";


export const handleStoreInsert = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<Response | void> => {
    /*
    #swagger.summary = '가게 등록 API';
    #swagger.description = '새로운 가게를 등록합니다.';
    #swagger.tags = ['Store'];
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "food_category_id", "subscription", "address", "detail_address"],
            properties: {
              name: { type: "string", example: "맛있는 음식점" },
              food_category_id: { type: "number", example: 1 },
              subscription: { type: "string", example: "BASIC" },
              address: { type: "string", example: "서울시 강남구 테헤란로" },
              detail_address: { type: "string", example: "123번지 1층" }
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "가게 등록 성공",
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
                  name: { type: "string", example: "맛있는 음식점" },
                  food_category_id: { type: "number", example: 1 },
                  subscription: { type: "string", example: "BASIC" },
                  address: { type: "string", example: "서울시 강남구 테헤란로" },
                  detail_address: { type: "string", example: "123번지 1층" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "가게 정보 파라미터 오류",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "FAIL" },
              error: {
                type: "object",
                properties: {
                  errorCode: { type: "string", example: "S001" },
                  reason: { type: "string", example: "가게의 정보를 정확히 입력하십시오" },
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
        description: "가게 등록 실패",
        content: {
        "application/json": {
        schema: {
        type: "object",
        properties: {
        resultType: { type: "string", example: "FAIL" },
        error: {
        type: "object",
        properties: {
        errorCode: { type: "string", example: "S002" },
        reason: { type: "string", example: "가게 등록에 실패." },
        data: { type: "object", nullable: true }
        }
        },
        success: { type: "object", nullable: true, example: null }
        }
        }
        }
        }
    }
    */
    try {
        console.log("요청 데이터:", req.body);

        const storeData = bodyToStore(req.body);
        const result = await addInsertStore(storeData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};





