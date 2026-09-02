import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    AlimtalkWebhookDeliveriesParams,
    AlimtalkWebhookDeliveriesResponse,
    AlimtalkWebhookSetting,
    AlimtalkWebhookTestResponse,
    AlimtalkWebhookUpdateParams
} from '../types'

/**
 * 알림톡 발송결과·검수결과 웹훅 설정 — /v1/alimtalk/webhook 계열
 *
 * ⚠️ **주문·구독 통합 웹훅과 완전히 별개다.** 알림톡 이벤트를 기존 주문 웹훅 URL 로 태우면
 *    그 수신 서버가 모르는 payload 를 받아 기존 연동이 깨진다. 그래서 수신 URL 을 따로 둔다.
 *    (webhook.sendTest 는 주문 웹훅용이다 — 이 모듈의 test() 와 혼동하지 말 것)
 *
 * ## 서명 검증
 * 요청에 다음 헤더가 붙는다.
 *   X-Bootpay-Signature: sha256=HMAC_SHA256(secret, "{X-Bootpay-Timestamp}.{raw_body}")
 * 타임스탬프가 5분 이상 지난 요청은 거부한다(replay 방지).
 */
export class AlimtalkWebhookModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 웹훅 설정 조회
     * GET /v1/alimtalk/webhook
     * 시크릿은 앞 12자만 노출된다. 미설정이면 { configured: false } 로 온다.
     */
    async detail(): Promise<BootpayCommerceResponse<AlimtalkWebhookSetting>> {
        return this.bootpay.get<AlimtalkWebhookSetting>('alimtalk/webhook', { headers: this.alimtalkHeaders() })
    }

    /**
     * 웹훅 설정 저장
     * PUT /v1/alimtalk/webhook
     * url 은 **https 만** 허용한다(아니면 3028). 최초 저장 시 서명 시크릿이 자동 발급된다.
     * events 는 목록에 없는 값을 저장 시 조용히 버린다(유령 구독 방지).
     *   300 발송 접수(기본 미구독) / 301 전달 성공 / 302 전달 실패 / 303 예약 취소 /
     *   304 문자(LMS) 대체발송 전환 / 310 검수 승인 / 311 검수 반려 / 320 수신거부 등록(기본 미구독)
     * events 를 비우면 기본 구독셋(301·302·303·304·310·311)이 적용된다.
     * @param params url / events / enabled
     */
    async update(params?: AlimtalkWebhookUpdateParams): Promise<BootpayCommerceResponse<AlimtalkWebhookSetting>> {
        return this.bootpay.put<AlimtalkWebhookSetting>('alimtalk/webhook', this.compact(params || {}), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 테스트 이벤트 1건 발송
     * POST /v1/alimtalk/webhook/test
     * ⚠️ **설정된 URL 로 실제 HTTP 요청이 나간다.** 구독 여부와 무관하게 보낸다.
     * 웹훅이 설정돼 있지 않으면 3029.
     */
    async test(): Promise<BootpayCommerceResponse<AlimtalkWebhookTestResponse>> {
        return this.bootpay.post<AlimtalkWebhookTestResponse>('alimtalk/webhook/test', {}, {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 서명 시크릿 재발급
     * POST /v1/alimtalk/webhook/secret
     * ⚠️ **이 응답에서만 secret 원문을 돌려준다**(이후 조회는 마스킹된다).
     * ⚠️ 이미 큐에 있는 전송 건은 발송 당시 시크릿으로 서명된다.
     */
    async rotateSecret(): Promise<BootpayCommerceResponse<AlimtalkWebhookSetting>> {
        return this.bootpay.post<AlimtalkWebhookSetting>('alimtalk/webhook/secret', {}, {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 웹훅 전송 이력 조회
     * GET /v1/alimtalk/webhook/deliveries
     * 성공·실패를 모두 남긴다.
     * @param params page / limit (서버 기본 20, 최대 100)
     */
    async deliveries(
        params?: AlimtalkWebhookDeliveriesParams
    ): Promise<BootpayCommerceResponse<AlimtalkWebhookDeliveriesResponse>> {
        return this.bootpay.get<AlimtalkWebhookDeliveriesResponse>(
            this.withQuery('alimtalk/webhook/deliveries', params),
            { headers: this.alimtalkHeaders() }
        )
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
