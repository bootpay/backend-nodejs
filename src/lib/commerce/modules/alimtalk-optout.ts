import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    AlimtalkOptout,
    AlimtalkOptoutCheckParams,
    AlimtalkOptoutCheckResponse,
    AlimtalkOptoutCreateParams,
    AlimtalkOptoutListParams,
    AlimtalkOptoutListResponse,
    AlimtalkOptoutReleaseResponse
} from '../types'

/**
 * 알림톡 수신거부 — /v1/alimtalk/optouts 계열 (가맹점 CRM 수신거부 동기화용)
 *
 * 발송 판정과 **같은 기준**으로 다룬다 — 부트페이 전역(global) + 내 프로젝트.
 * ⚠️ 전역 건은 **조회는 되지만 해제할 수 없다**(releasable: false).
 *    이걸 노출하지 않으면 "화면엔 수신거부가 아닌데 발송은 3021 로 막히는" 상태가 된다.
 */
export class AlimtalkOptoutModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 수신거부 목록 조회
     * GET /v1/alimtalk/optouts
     * phone 은 숫자만 남겨 **부분일치**로 찾는다(정확 매칭이 아니다). 50건 단위로 페이징된다.
     * @param params 조회 파라미터
     */
    async list(params?: AlimtalkOptoutListParams): Promise<BootpayCommerceResponse<AlimtalkOptoutListResponse>> {
        return this.bootpay.get<AlimtalkOptoutListResponse>(this.withQuery('alimtalk/optouts', params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 수신거부 등록
     * POST /v1/alimtalk/optouts
     * 내 프로젝트 스코프로 등록된다(source: api). 같은 번호를 다시 등록해도 멱등이다.
     * @param params 등록 파라미터
     */
    async create(params: AlimtalkOptoutCreateParams): Promise<BootpayCommerceResponse<AlimtalkOptout>> {
        return this.bootpay.post<AlimtalkOptout>('alimtalk/optouts', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 발송 전 수신거부 사전 확인
     * POST /v1/alimtalk/optouts/check
     * 발송 판정과 **같은 축**으로 대조하므로, 벌크에서 skipped 로 낭비될 건을 미리 뺄 수 있다.
     * 단건(phone)·다건(phones) 모두 받는다.
     * ⚠️ 1회 최대 1,000건이고 넘으면 -48 이다(중복은 서버가 제거).
     * @param params 확인할 번호
     */
    async check(params: AlimtalkOptoutCheckParams): Promise<BootpayCommerceResponse<AlimtalkOptoutCheckResponse>> {
        return this.bootpay.post<AlimtalkOptoutCheckResponse>('alimtalk/optouts/check', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 수신거부 해제
     * DELETE /v1/alimtalk/optouts/{phone}
     * 내 프로젝트 스코프 건만 해제되며 멱등이다(없어도 성공).
     * ⚠️ 전역 차단은 해제되지 않고 global_blocked: true 로 알려 준다 —
     *    "지웠는데 여전히 막히는" 상태를 응답으로 드러내기 위함이다.
     * @param phone 수신거부를 해제할 번호
     */
    async release(phone: string): Promise<BootpayCommerceResponse<AlimtalkOptoutReleaseResponse>> {
        return this.bootpay.delete<AlimtalkOptoutReleaseResponse>(`alimtalk/optouts/${phone}`, {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 알림톡 요청 헤더
     * ★Idempotency-Key 를 싣지 않는다★ 알림톡 API 는 이 헤더를 읽지 않는다.
     * ★BOOTPAY-ROLE 은 항상 user★ 알림톡 스코프 키가 전부 user:alimtalk_* 다.
     */
    private alimtalkHeaders(): Record<string, string> {
        return { 'BOOTPAY-ROLE': 'user' }
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
