import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceNotice,
    NoticeCreateParams,
    NoticeDetailParams,
    NoticeListParams,
    NoticeListResponse,
    NoticeUpdateParams
} from '../types'
import { randomUUID } from 'crypto'

/**
 * 공지사항 — /v1/notices 계열 (몰 게시판)
 *
 * 조회는 고객 모드(BOOTPAY-ROLE: user)가 기본이고, 쓰기(등록·수정·삭제)는 supervisor 전용이다.
 * ⚠️ 고객 모드 조회는 몰 공지사항 사용여부가 꺼져 있으면 BOARD_FEATURE_DISABLED 로 거절된다.
 */
export class NoticeModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 공지사항 목록 조회
     * GET /v1/notices
     * supervisor: true 면 운영자 모드로 조회한다 — view: 'all' 로 비공개 공지까지 볼 수 있다.
     * @param params 조회 파라미터 (page 기본 1 · limit 기본 20)
     */
    async list(params?: NoticeListParams): Promise<BootpayCommerceResponse<NoticeListResponse>> {
        const { supervisor, idempotency_key, ...query } = params || {}
        return this.bootpay.get<NoticeListResponse>(this.withQuery('notices', this.withPaging(query)), {
            headers: this.boardHeaders(supervisor, idempotency_key)
        })
    }

    /**
     * 공지사항 단건 조회
     * GET /v1/notices/{notice_id}
     * 비공개 공지는 supervisor: true 일 때만 보인다(아니면 404 POST_NOT_FOUND).
     * @param noticeId 공지사항 ID
     * @param params 조회 옵션
     */
    async detail(noticeId: string, params?: NoticeDetailParams): Promise<BootpayCommerceResponse<CommerceNotice>> {
        const { supervisor, idempotency_key } = params || {}
        return this.bootpay.get<CommerceNotice>(`notices/${noticeId}`, {
            headers: this.boardHeaders(supervisor, idempotency_key)
        })
    }

    /**
     * 공지사항 등록
     * POST /v1/notices — supervisor 전용
     * @param params 공지사항 정보
     */
    async create(params: NoticeCreateParams): Promise<BootpayCommerceResponse<CommerceNotice>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceNotice>('notices', this.compact(payload), {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 공지사항 수정
     * PUT /v1/notices/{notice_id} — supervisor 전용
     * 보낸 필드만 바뀐다. images 는 보내면 목록 전체를 교체한다([] 면 모두 삭제).
     * @param noticeId 공지사항 ID
     * @param params 수정할 값
     */
    async update(noticeId: string, params: NoticeUpdateParams): Promise<BootpayCommerceResponse<CommerceNotice>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceNotice>(`notices/${noticeId}`, this.compact(payload), {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 공지사항 삭제
     * DELETE /v1/notices/{notice_id} — supervisor 전용
     * @param noticeId 공지사항 ID
     * @param idempotencyKey 미지정시 자동 생성
     */
    async delete(noticeId: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`notices/${noticeId}`, {
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
