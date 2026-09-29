import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceFaq,
    FaqCreateParams,
    FaqDetailParams,
    FaqListParams,
    FaqListResponse,
    FaqUpdateParams
} from '../types'
import { randomUUID } from 'crypto'

/**
 * FAQ — /v1/faqs 계열 (몰 게시판)
 *
 * 조회는 고객 모드(BOOTPAY-ROLE: user)가 기본이고, 쓰기(등록·수정·삭제)는 supervisor 전용이다.
 * ⚠️ 고객 모드 조회는 몰 FAQ 사용여부가 꺼져 있으면 BOARD_FEATURE_DISABLED 로 거절된다.
 */
export class FaqModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * FAQ 목록 조회
     * GET /v1/faqs
     * supervisor: true 면 운영자 모드로 조회한다 — view: 'all' 로 비공개 FAQ 까지 볼 수 있다.
     * @param params 조회 파라미터 (page 기본 1 · limit 기본 20)
     */
    async list(params?: FaqListParams): Promise<BootpayCommerceResponse<FaqListResponse>> {
        const { supervisor, idempotency_key, ...query } = params || {}
        return this.bootpay.get<FaqListResponse>(this.withQuery('faqs', this.withPaging(query)), {
            headers: this.boardHeaders(supervisor, idempotency_key)
        })
    }

    /**
     * FAQ 단건 조회
     * GET /v1/faqs/{faq_id}
     * 비공개 FAQ 는 supervisor: true 일 때만 보인다(아니면 404 POST_NOT_FOUND).
     * @param faqId FAQ ID
     * @param params 조회 옵션
     */
    async detail(faqId: string, params?: FaqDetailParams): Promise<BootpayCommerceResponse<CommerceFaq>> {
        const { supervisor, idempotency_key } = params || {}
        return this.bootpay.get<CommerceFaq>(`faqs/${faqId}`, {
            headers: this.boardHeaders(supervisor, idempotency_key)
        })
    }

    /**
     * FAQ 등록
     * POST /v1/faqs — supervisor 전용
     * @param params FAQ 정보
     */
    async create(params: FaqCreateParams): Promise<BootpayCommerceResponse<CommerceFaq>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceFaq>('faqs', this.compact(payload), {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * FAQ 수정
     * PUT /v1/faqs/{faq_id} — supervisor 전용
     * 보낸 필드만 바뀐다. images 는 보내면 목록 전체를 교체한다([] 면 모두 삭제).
     * @param faqId FAQ ID
     * @param params 수정할 값
     */
    async update(faqId: string, params: FaqUpdateParams): Promise<BootpayCommerceResponse<CommerceFaq>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceFaq>(`faqs/${faqId}`, this.compact(payload), {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * FAQ 삭제
     * DELETE /v1/faqs/{faq_id} — supervisor 전용
     * @param faqId FAQ ID
     * @param idempotencyKey 미지정시 자동 생성
     */
    async delete(faqId: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`faqs/${faqId}`, {
            headers: this.supervisorHeaders(idempotencyKey)
        })
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
     * 게시판 조회 요청 헤더 — supervisor: true 면 운영자 모드로 읽는다.
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private boardHeaders(supervisor?: boolean, idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': supervisor ? 'supervisor' : 'user'
        }
    }

    /**
     * 게시판 쓰기 요청 헤더 — 서버가 supervisor scope 를 요구한다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return this.boardHeaders(true, idempotencyKey)
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
