import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceInquiry,
    InquiryCreateParams,
    InquiryDeleteParams,
    InquiryDetailParams,
    InquiryListParams,
    InquiryListResponse,
    InquiryUpdateParams
} from '../types'
import { randomUUID } from 'crypto'

/**
 * 1:1 문의 — /v1/inquiries 계열
 *
 * 회원 모드(BOOTPAY-ROLE: user)는 user_id·login_id·user_jwt 로 정한 회원 본인 문의만 다룬다.
 * supervisor: true 면 몰 전체 문의를 보며, 답변 등록·수정(answer)은 supervisor 전용이다.
 */
export class InquiryModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 1:1 문의 목록 조회
     * GET /v1/inquiries
     * supervisor: true 면 몰 전체 문의 — 이때 user_id 는 작성 회원 필터(선택)다.
     * answered: true 답변 완료만 / false 미답변만 / 미지정 전체.
     * @param params 조회 파라미터 (page 기본 1 · limit 기본 20)
     */
    async list(params?: InquiryListParams): Promise<BootpayCommerceResponse<InquiryListResponse>> {
        const { supervisor, user_jwt, idempotency_key, answered, ...rest } = params || {}
        const query = {
            ...rest,
            answered: answered === undefined || answered === null ? undefined : String(answered)
        }
        return this.bootpay.get<InquiryListResponse>(this.withQuery('inquiries', this.withPaging(query)), {
            headers: this.inquiryHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 1:1 문의 단건 조회
     * GET /v1/inquiries/{inquiry_id}
     * 회원 모드는 작성 회원 본인 문의만(다른 회원 문의는 404). supervisor: true 면 몰의 모든 문의.
     * @param inquiryId 문의 ID
     * @param params 조회 옵션 (회원 식별)
     */
    async detail(inquiryId: string, params?: InquiryDetailParams): Promise<BootpayCommerceResponse<CommerceInquiry>> {
        const { supervisor, user_jwt, idempotency_key, ...query } = params || {}
        return this.bootpay.get<CommerceInquiry>(this.withQuery(`inquiries/${inquiryId}`, query), {
            headers: this.inquiryHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 1:1 문의 작성
     * POST /v1/inquiries — 회원 전용
     * product_id 는 이 몰의 상품, order_id 는 작성 회원의 주문이어야 한다. option 은 상품 옵션 문구(product_id 필요).
     * @param params 문의 내용
     */
    async create(params: InquiryCreateParams): Promise<BootpayCommerceResponse<CommerceInquiry>> {
        const { user_jwt, idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceInquiry>('inquiries', this.compact(payload), {
            headers: this.inquiryHeaders(false, user_jwt, idempotency_key)
        })
    }

    /**
     * 1:1 문의 수정
     * PUT /v1/inquiries/{inquiry_id} — 작성 회원 본인, 답변 전만
     * 답변이 달린 문의는 409 INQUIRY_ALREADY_ANSWERED. title 에 '' 를 보내면 제목을 지운다.
     * @param inquiryId 문의 ID
     * @param params 수정할 값
     */
    async update(inquiryId: string, params: InquiryUpdateParams): Promise<BootpayCommerceResponse<CommerceInquiry>> {
        const { user_jwt, idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceInquiry>(`inquiries/${inquiryId}`, this.compact(payload), {
            headers: this.inquiryHeaders(false, user_jwt, idempotency_key)
        })
    }

    /**
     * 1:1 문의 삭제
     * DELETE /v1/inquiries/{inquiry_id} — 작성 회원 본인 또는 supervisor
     * 달린 답변도 함께 삭제된다.
     * @param inquiryId 문의 ID
     * @param params 삭제 옵션 (회원 식별)
     */
    async delete(inquiryId: string, params?: InquiryDeleteParams): Promise<BootpayCommerceResponse<null>> {
        const { supervisor, user_jwt, idempotency_key, ...query } = params || {}
        return this.bootpay.delete<null>(this.withQuery(`inquiries/${inquiryId}`, query), {
            headers: this.inquiryHeaders(supervisor, user_jwt, idempotency_key)
        })
    }

    /**
     * 1:1 문의 답변 등록·수정
     * PUT /v1/inquiries/{inquiry_id}/answer — supervisor 전용
     * 답변이 없으면 만들고, 있으면 내용을 바꾼다. 응답은 답변이 반영된 문의 객체다.
     * @param inquiryId 문의 ID
     * @param content 답변 내용
     * @param idempotencyKey 미지정시 자동 생성
     */
    async answer(
        inquiryId: string,
        content: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceInquiry>> {
        return this.bootpay.put<CommerceInquiry>(
            `inquiries/${inquiryId}/answer`,
            { content },
            { headers: this.inquiryHeaders(true, undefined, idempotencyKey) }
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
     * 1:1 문의 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성되고, Bootpay-User-JWT 는 값이 있을 때만 붙는다.
     */
    private inquiryHeaders(
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
