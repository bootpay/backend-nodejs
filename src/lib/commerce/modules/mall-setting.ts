import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceMallSetting, MallSettingUpdateParams } from '../types'
import { randomUUID } from 'crypto'

export class MallSettingModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 몰 설정 조회
     * GET /v1/mall-setting
     * supervisor scope 토큰 전용
     */
    async getMallSetting(idempotencyKey?: string): Promise<BootpayCommerceResponse<CommerceMallSetting>> {
        return this.bootpay.get<CommerceMallSetting>('mall-setting', {
            headers: this.supervisorHeaders(idempotencyKey)
        })
    }

    async detail(idempotencyKey?: string): Promise<BootpayCommerceResponse<CommerceMallSetting>> {
        return this.getMallSetting(idempotencyKey)
    }

    /**
     * 몰 설정 수정
     * PUT /v1/mall-setting
     * supervisor scope 토큰 전용
     * 요청 바디는 flatten 형식이며 전달된 값(non-null)만 서버로 전송된다.
     * @param params 수정할 설정값
     * @param idempotencyKey 미지정시 자동 생성
     */
    async updateMallSetting(
        params: MallSettingUpdateParams,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceMallSetting>> {
        return this.bootpay.put<CommerceMallSetting>('mall-setting', this.compact(params), {
            headers: this.supervisorHeaders(idempotencyKey)
        })
    }

    async update(
        params: MallSettingUpdateParams,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceMallSetting>> {
        return this.updateMallSetting(params, idempotencyKey)
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작)
     */
    private compact(params: MallSettingUpdateParams): Record<string, any> {
        return Object.fromEntries(
            Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null)
        )
    }

    /**
     * supervisor 전용 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }
}
