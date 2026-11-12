import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceDeposit,
    DepositAccountsResponse,
    DepositCreateParams,
    DepositWebhookSecretResponse
} from '../types'
import { randomUUID } from 'crypto'

/**
 * 뱅크알람 입금대기 — /v1/sdk/deposits 계열
 *
 * 가맹점 서버가 아직 입금되지 않은 주문을 등록하면, 판매자 폰의 입금 알림 중 금액·입금자명이 맞는 것을
 * 뱅크알람이 그 주문에 연결해 입금을 확인하고 입금 웹훅으로 알린다.
 * 전부 supervisor 전용이다 — 인스턴스 role 과 무관하게 BOOTPAY-ROLE: supervisor 로 나간다.
 * 조회·취소의 id 는 가맹점 주문번호(merchant_order_id) 또는 부트페이 주문번호(order_number)다.
 */
export class DepositModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 판매자 입금 계좌 목록
     * GET /v1/sdk/deposits/accounts
     * 첫 계좌가 대표 계좌(primary: true)다. 손님에게 보낼 계좌를 고르게 할 때 쓴다.
     */
    async accounts(): Promise<BootpayCommerceResponse<DepositAccountsResponse>> {
        return this.bootpay.get<DepositAccountsResponse>('sdk/deposits/accounts', {
            headers: this.supervisorHeaders()
        })
    }

    /**
     * 웹훅 서명 비밀값 발급
     * POST /v1/sdk/deposits/webhook_secret
     * ⚠️ 원문은 **이 응답에서만** 준다. 다시 부르면 바뀐다(이미 만든 웹훅은 이전 비밀값으로 서명된다).
     * 웹훅은 X-Bootpay-Signature: sha256=HMAC_SHA256(secret, "{X-Bootpay-Timestamp}.{raw_body}") 로 서명된다.
     * @param idempotencyKey 미지정시 자동 생성
     */
    async webhookSecret(idempotencyKey?: string): Promise<BootpayCommerceResponse<DepositWebhookSecretResponse>> {
        return this.bootpay.post<DepositWebhookSecretResponse>('sdk/deposits/webhook_secret', {}, {
            headers: this.supervisorHeaders(idempotencyKey)
        })
    }

    /**
     * 입금대기 등록
     * POST /v1/sdk/deposits
     * 같은 merchant_order_id 로 다시 부르면 기존 주문을 돌려준다(금액·입금자명·계좌가 다르면 18110).
     * webhook_url 을 주려면 webhookSecret() 으로 비밀값을 먼저 발급받아야 한다(18131).
     * notify(구매자 알림톡)는 유료이며, 보낼 준비가 안 됐으면 주문을 만들지 않는다(18133).
     * @param params 입금대기 주문 정보
     */
    async create(params: DepositCreateParams): Promise<BootpayCommerceResponse<CommerceDeposit>> {
        const { idempotency_key, ...payload } = params
        const body = this.compact(payload)
        // notify 안의 null 도 뺀다 (다른 SDK 와 같은 본문, false 는 유지)
        if (body.notify && typeof body.notify === 'object') body.notify = this.compact(body.notify)
        return this.bootpay.post<CommerceDeposit>('sdk/deposits', body, {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 입금대기 조회
     * GET /v1/sdk/deposits/{id}
     * 기한이 지났으면 조회 시점에 만료(expired)로 닫힌다.
     * @param depositId 가맹점 주문번호 또는 부트페이 주문번호
     */
    async detail(depositId: string): Promise<BootpayCommerceResponse<CommerceDeposit>> {
        return this.bootpay.get<CommerceDeposit>(`sdk/deposits/${encodeURIComponent(depositId)}`, {
            headers: this.supervisorHeaders()
        })
    }

    /**
     * 입금대기 취소
     * DELETE /v1/sdk/deposits/{id}
     * 기한이 지났으면 만료로 닫고, 이미 닫힌 주문은 그대로 돌려준다. 입금 확인된 주문은 18108.
     * @param depositId 가맹점 주문번호 또는 부트페이 주문번호
     * @param idempotencyKey 미지정시 자동 생성
     */
    async cancel(depositId: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<CommerceDeposit>> {
        return this.bootpay.delete<CommerceDeposit>(`sdk/deposits/${encodeURIComponent(depositId)}`, {
            headers: this.supervisorHeaders(idempotencyKey)
        })
    }

    /**
     * 입금대기 API 는 supervisor scope(order_deposit_*)를 요구한다.
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작)
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload || {}).filter(([, value]) => value !== undefined && value !== null)
        )
    }
}
