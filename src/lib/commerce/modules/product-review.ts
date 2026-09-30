import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceProductReview,
    ProductReviewCreateParams,
    ProductReviewDeleteParams,
    ProductReviewDetailParams,
    ProductReviewListParams,
    ProductReviewListResponse,
    ProductReviewUpdateParams
} from '../types'
import { randomUUID } from 'crypto'

/**
 * 상품평 — /v1/reviews 계열
 *
 * 회원 모드(BOOTPAY-ROLE: user)는 user_id·login_id·user_jwt 로 정한 회원이 쓴 상품평만 본다.
 * supervisor: true 면 몰 전체 상품평을 보며, 판매자 답글(reply)은 supervisor 전용이다.
 * ⚠️ 상품 상세의 공개 상품평 목록은 기존 GET /v1/products/{product_id}/reviews 를 쓴다.
 */
export class ProductReviewModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 상품평 목록 조회
     * GET /v1/reviews
     * supervisor: true 면 몰 전체 상품평 — 이때 user_id 는 작성 회원 필터(선택)다.
     * @param params 조회 파라미터 (page 기본 1 · limit 기본 20)
     */
    async list(params?: ProductReviewListParams): Promise<BootpayCommerceResponse<ProductReviewListResponse>> {
        const { supervisor, user_jwt, idempotency_key, ...query } = params || {}
        return this.bootpay.get<ProductReviewListResponse>(this.withQuery('reviews', this.withPaging(query)), {
            headers: this.reviewHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품평 단건 조회
     * GET /v1/reviews/{product_review_id}
     * 공개 상품평은 누구나, 숨김 상품평은 작성 회원 본인 또는 supervisor 만 본다.
     * @param productReviewId 상품평 ID
     * @param params 조회 옵션 (회원 식별)
     */
    async detail(
        productReviewId: string,
        params?: ProductReviewDetailParams
    ): Promise<BootpayCommerceResponse<CommerceProductReview>> {
        const { supervisor, user_jwt, idempotency_key, ...query } = params || {}
        return this.bootpay.get<CommerceProductReview>(this.withQuery(`reviews/${productReviewId}`, query), {
            headers: this.reviewHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품평 작성
     * POST /v1/reviews — 회원 전용
     * order_id 는 회원의 구매확정 주문, product_id(·product_option_id)는 그 주문에 담긴 상품이어야 한다.
     * images 는 사진 URL 최대 5개(문자열 또는 { url } 객체). 파일 업로드는 지원하지 않는다.
     * @param params 상품평 내용
     */
    async create(params: ProductReviewCreateParams): Promise<BootpayCommerceResponse<CommerceProductReview>> {
        const { user_jwt, idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceProductReview>('reviews', this.compact(payload), {
            headers: this.reviewHeaders(false, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품평 수정
     * PUT /v1/reviews/{product_review_id} — 작성 회원 본인, 작성 후 7일 이내
     * images 는 보내면 통째로 교체한다([] 면 모두 삭제). 7일이 지나면 REVIEW_EDIT_TIME_EXPIRED.
     * @param productReviewId 상품평 ID
     * @param params 수정할 값
     */
    async update(
        productReviewId: string,
        params: ProductReviewUpdateParams
    ): Promise<BootpayCommerceResponse<CommerceProductReview>> {
        const { user_jwt, idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceProductReview>(`reviews/${productReviewId}`, this.compact(payload), {
            headers: this.reviewHeaders(false, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품평 삭제
     * DELETE /v1/reviews/{product_review_id} — 작성 회원 본인 또는 supervisor
     * 지급된 적립금 회수·상품 통계 차감이 함께 일어난다. reason 은 운영자 모드의 삭제 사유.
     * @param productReviewId 상품평 ID
     * @param params 삭제 옵션 (회원 식별 · 삭제 사유)
     */
    async delete(productReviewId: string, params?: ProductReviewDeleteParams): Promise<BootpayCommerceResponse<null>> {
        const { supervisor, user_jwt, idempotency_key, ...query } = params || {}
        return this.bootpay.delete<null>(this.withQuery(`reviews/${productReviewId}`, query), {
            headers: this.reviewHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품평 판매자 답글 등록·수정
     * PUT /v1/reviews/{product_review_id}/reply — supervisor 전용
     * 답글이 없으면 만들고, 있으면 내용을 바꾼다(10자 이상). 응답은 답글이 반영된 상품평 객체다.
     * @param productReviewId 상품평 ID
     * @param content 답글 내용
     * @param idempotencyKey 미지정시 자동 생성
     */
    async reply(
        productReviewId: string,
        content: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceProductReview>> {
        return this.bootpay.put<CommerceProductReview>(
            `reviews/${productReviewId}/reply`,
            { content },
            { headers: this.reviewHeaders(true, undefined, idempotencyKey) }
        )
    }

    /**
     * 목록 조회 기본값 — 서버 기본과 같은 page 1 · limit 20 을 명시적으로 싣는다.
     */
    private withPaging(query: Record<string, any>): Record<string, any> {
        return {
            ...query,
            page: query.page === undefined ? 1 : query.page,
            limit: query.limit === undefined ? 20 : query.limit
        }
    }

    /**
     * 상품평 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성되고, Bootpay-User-JWT 는 값이 있을 때만 붙는다.
     */
    private reviewHeaders(supervisor?: boolean, userJwt?: string, idempotencyKey?: string): Record<string, string> {
        const headers: Record<string, string> = {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': supervisor ? 'supervisor' : 'user'
        }
        if (userJwt !== undefined && userJwt !== null && userJwt !== '') {
            headers['Bootpay-User-JWT'] = userJwt
        }
        return headers
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작)
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload || {}).filter(([, value]) => value !== undefined && value !== null)
        )
    }

    /**
     * null/undefined 를 뺀 값만 query string 으로 붙인다.
     */
    private withQuery(uri: string, params?: Record<string, any>): string {
        const queryParams = new URLSearchParams()
        Object.entries(params || {}).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            queryParams.append(key, String(value))
        })
        const query = queryParams.toString()
        return query ? `${uri}?${query}` : uri
    }
}
