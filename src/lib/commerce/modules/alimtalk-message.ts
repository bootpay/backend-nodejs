import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    AlimtalkMessage,
    AlimtalkMessageListParams,
    AlimtalkMessageListResponse,
    AlimtalkMessageStatsParams,
    AlimtalkMessageStatsResponse
} from '../types'

/**
 * 알림톡 발송내역·집계 — GET /v1/alimtalk/messages 계열
 *
 * **유료** 알림톡만 조회된다(무료 커머스 알림톡은 포함되지 않는다).
 * 상태는 벤더 결과 동기화로 확정되므로 접수 직후에는 requested 로 보인다.
 */
export class AlimtalkMessageModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 발송내역 목록 조회
     * GET /v1/alimtalk/messages
     * ⚠️ 기간 기본값은 최근 30일이고 최대 조회 폭은 92일이다 — 초과분은 거부하지 않고 시작일을 당겨 잘라낸다.
     *    실제 적용된 구간은 응답의 period 로 확인한다.
     * @param params 조회 파라미터
     */
    async list(params?: AlimtalkMessageListParams): Promise<BootpayCommerceResponse<AlimtalkMessageListResponse>> {
        return this.bootpay.get<AlimtalkMessageListResponse>(this.withQuery('alimtalk/messages', params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 기간 집계 조회
     * GET /v1/alimtalk/messages/stats
     * 일자별 집계 원장에서 읽으므로 응답이 빠르다.
     * ⚠️ billing.unit_price_source 가 'default' 면 **잠정 단가**다(확정 청구액이 아니다).
     * ⚠️ billing.billable_count 는 성공 − 폴백이다 — 폴백분은 LMS 단가로 따로 계산된다.
     * @param params 조회 기간
     */
    async stats(params?: AlimtalkMessageStatsParams): Promise<BootpayCommerceResponse<AlimtalkMessageStatsResponse>> {
        return this.bootpay.get<AlimtalkMessageStatsResponse>(this.withQuery('alimtalk/messages/stats', params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 단건 발송 결과 조회
     * GET /v1/alimtalk/messages/{receipt_id}
     * 실패 사유는 error_code·error_message 에 담긴다.
     * fallback_type 은 폴백이 꺼진 건이면 null, 켜진 건이면 LMS 다.
     * 다른 프로젝트의 건이거나 없으면 404(3025).
     * @param receiptId 발송 접수 ID
     */
    async detail(receiptId: string): Promise<BootpayCommerceResponse<AlimtalkMessage>> {
        return this.bootpay.get<AlimtalkMessage>(`alimtalk/messages/${receiptId}`, {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 알림톡 요청 헤더
     * ★Idempotency-Key 를 싣지 않는다★ 알림톡 API 는 이 헤더를 읽지 않는다(멱등은 발송의 ref_id 로만 성립).
     * ★BOOTPAY-ROLE 은 항상 user★ 알림톡 스코프 키가 전부 user:alimtalk_* 다.
     *   인스턴스 role 이 manager/supervisor 로 바뀌어 있어도 여기서 고정한다.
     */
    private alimtalkHeaders(): Record<string, string> {
        return { 'BOOTPAY-ROLE': 'user' }
    }

    /**
     * null/undefined 를 뺀 값만 query string 으로 붙인다. (Ruby SDK 의 params.compact 와 동일 동작)
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
