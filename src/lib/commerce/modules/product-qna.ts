import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceProductQna,
    ProductQnaCreateParams,
    ProductQnaDeleteParams,
    ProductQnaDetailParams,
    ProductQnaListParams,
    ProductQnaListResponse,
    ProductQnaUpdateParams
} from '../types'
import { randomUUID } from 'crypto'

/**
 * 상품문의 — /v1/product-qnas 계열
 *
 * 회원(user_id·login_id·user_jwt) 또는 비회원(guest_name + guest_password)이 작성한다.
 * ⚠️ 다른 사람의 비밀글은 목록에서 is_viewable: false 로 본문 없이 오고,
 *    단건 조회는 403 PRODUCT_QNA_SECRET_FORBIDDEN 이다. supervisor: true 면 비밀글·숨김 글도 본다.
 */
export class ProductQnaModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 상품문의 목록 조회
     * GET /v1/product-qnas
     * 고객 모드는 product_id 필수. 회원을 보내면 그 회원이 쓴 비밀글 본문이 보인다.
     * supervisor: true + view: 'all' 이면 몰 전체(숨김 포함) — 이때 product_id 는 선택 필터다.
     * @param params 조회 파라미터 (page 기본 1 · limit 기본 20)
     */
    async list(params?: ProductQnaListParams): Promise<BootpayCommerceResponse<ProductQnaListResponse>> {
        const { supervisor, user_jwt, idempotency_key, ...query } = params || {}
        return this.bootpay.get<ProductQnaListResponse>(this.withQuery('product-qnas', this.withPaging(query)), {
            headers: this.productQnaHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품문의 단건 조회
     * GET /v1/product-qnas/{product_qna_id}
     * 다른 사람의 비밀글은 403 PRODUCT_QNA_SECRET_FORBIDDEN. supervisor: true 면 비밀글·숨김 글도 본다.
     * @param productQnaId 상품문의 ID
     * @param params 조회 옵션 (회원 식별)
     */
    async detail(
        productQnaId: string,
        params?: ProductQnaDetailParams
    ): Promise<BootpayCommerceResponse<CommerceProductQna>> {
        const { supervisor, user_jwt, idempotency_key, ...query } = params || {}
        return this.bootpay.get<CommerceProductQna>(this.withQuery(`product-qnas/${productQnaId}`, query), {
            headers: this.productQnaHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품문의 작성
     * POST /v1/product-qnas
     * 회원(user_id·login_id·user_jwt) 또는 비회원(guest_name + guest_password, 몰이 비회원 작성을 허용할 때).
     * 회원 문의면 guest_* 는 무시된다.
     * @param params 문의 내용
     */
    async create(params: ProductQnaCreateParams): Promise<BootpayCommerceResponse<CommerceProductQna>> {
        const { user_jwt, idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceProductQna>('product-qnas', this.compact(payload), {
            headers: this.productQnaHeaders(false, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품문의 수정
     * PUT /v1/product-qnas/{product_qna_id} — 작성 회원 본인 또는 비회원 비밀번호, 답변 전만
     * 답변이 달린 문의는 409 PRODUCT_QNA_ALREADY_ANSWERED,
     * 비회원 비밀번호가 틀리면 403 PRODUCT_QNA_GUEST_PASSWORD_INVALID.
     * @param productQnaId 상품문의 ID
     * @param params 수정할 값
     */
    async update(
        productQnaId: string,
        params: ProductQnaUpdateParams
    ): Promise<BootpayCommerceResponse<CommerceProductQna>> {
        const { user_jwt, idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceProductQna>(`product-qnas/${productQnaId}`, this.compact(payload), {
            headers: this.productQnaHeaders(false, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품문의 삭제
     * DELETE /v1/product-qnas/{product_qna_id} — 작성 회원 본인·비회원 비밀번호 또는 supervisor
     * ⚠️ guest_password 는 URL 쿼리가 아니라 본문으로 보낸다(액세스 로그 노출 방지 — 서버는 둘 다 받는다).
     * @param productQnaId 상품문의 ID
     * @param params 삭제 옵션 (회원 식별 · 비회원 비밀번호)
     */
    async delete(productQnaId: string, params?: ProductQnaDeleteParams): Promise<BootpayCommerceResponse<null>> {
        const { supervisor, user_jwt, idempotency_key, ...payload } = params || {}
        return this.bootpay.delete<null>(`product-qnas/${productQnaId}`, {
            data: this.compact(payload),
            headers: this.productQnaHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 상품문의 답변 등록·수정
     * PUT /v1/product-qnas/{product_qna_id}/answer — supervisor 전용
     * 답변이 없으면 만들고, 있으면 내용을 바꾼다. 응답은 답변이 반영된 상품문의 객체다.
     * @param productQnaId 상품문의 ID
     * @param content 답변 내용
     * @param idempotencyKey 미지정시 자동 생성
     */
    async answer(
        productQnaId: string,
        content: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceProductQna>> {
        return this.bootpay.put<CommerceProductQna>(
            `product-qnas/${productQnaId}/answer`,
            { content },
            { headers: this.productQnaHeaders(true, undefined, idempotencyKey) }
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
     * 상품문의 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성되고, Bootpay-User-JWT 는 값이 있을 때만 붙는다.
     */
    private productQnaHeaders(
        supervisor?: boolean,
        userJwt?: string,
        idempotencyKey?: string
    ): Record<string, string> {
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
