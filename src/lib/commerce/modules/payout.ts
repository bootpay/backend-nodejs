import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommercePayout, PayoutCreateParams, PayoutListParams } from '../types'
import { randomUUID } from 'crypto'

/**
 * 입점사 지급 요청 — /v1/sdk/payouts 계열
 *
 * 가맹점 지정 금액(manual) 정산 방식의 쇼핑몰이 입점사와 지급액을 정해 지급 원장에 등록한다.
 * 실제 송금은 부트페이 배치가 처리하므로 등록 직후 status 는 ready 다.
 * 전부 supervisor 전용이다 — 인스턴스 role 과 무관하게 BOOTPAY-ROLE: supervisor 로 나간다.
 */
export class PayoutModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 지급 요청 등록
     * POST /v1/sdk/payouts
     * 같은 merchant_payout_id 로 다시 부르면 처음 만든 항목을 돌려준다(금액·입점사·지급일은 바꿀 수 없다).
     * 정산 방식이 manual 이 아니면 18360, PG 미등록 입점사는 18378, 준비 전이면 18374.
     * @param params 지급 요청 정보
     */
    async create(params: PayoutCreateParams): Promise<BootpayCommerceResponse<CommercePayout>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommercePayout>('sdk/payouts', this.compact(payload), {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 지급 항목 조회
     * GET /v1/sdk/payouts/{id}
     * 현재 프로젝트의 항목만 조회된다. 없으면 404 PAYOUT_RESULT_INVALID(18366).
     * @param payoutId merchant_payout_id 또는 지급 항목 id
     * @param idempotencyKey 미지정시 자동 생성
     */
    async detail(payoutId: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<CommercePayout>> {
        return this.bootpay.get<CommercePayout>(`sdk/payouts/${encodeURIComponent(payoutId)}`, {
            headers: this.supervisorHeaders(idempotencyKey)
        })
    }

    /**
     * 지급 목록 조회
     * GET /v1/sdk/payouts
     * 응답은 이번 페이지의 항목 배열이다(전체 개수 없음 — 받은 수가 limit 보다 적으면 마지막 페이지).
     * @param params 필터·페이지 (page 기본 1 · limit 기본 20, 최대 100)
     */
    async list(params?: PayoutListParams): Promise<BootpayCommerceResponse<CommercePayout[]>> {
        const { idempotency_key, ...query } = params || {}
        return this.bootpay.get<CommercePayout[]>(this.withQuery('sdk/payouts', query), {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 지급 API 는 supervisor scope(payout_*)를 요구한다.
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }

    /**
     * null/undefined 값을 제거한다.
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload || {}).filter(([, value]) => value !== undefined && value !== null)
        )
    }

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
