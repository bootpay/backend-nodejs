import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    AlimtalkSender,
    AlimtalkSenderCreateParams,
    AlimtalkSenderListResponse,
    AlimtalkSenderOtpParams
} from '../types'

/**
 * 알림톡 발신프로필(카카오채널) 생명주기 — GET /v1/alimtalk/categories · /senders 계열
 *
 * 카테고리 조회 → OTP 발송 → 발신프로필 등록 → 목록/상세 → 연동 해지 순으로 쓴다.
 * 등록이 끝나면 서버가 그룹키 등록까지 자동으로 하므로, 공식 템플릿은 별도 채택 없이 바로 발송된다.
 *
 * ⚠️ 실제 부작용: otp() 는 채널 관리자 휴대폰으로 **문자를 실제 발송**하고,
 *    create() 는 카카오에 발신프로필을 **실제 등록**한다. 샌드박스가 없다.
 */
export class AlimtalkSenderModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 카카오 카테고리 목록 조회
     * GET /v1/alimtalk/categories
     * 발신프로필 등록 시 필요한 category_code 후보다. 벤더 응답을 그대로 프록시한다.
     */
    async categories(): Promise<BootpayCommerceResponse<any>> {
        return this.bootpay.get<any>('alimtalk/categories', { headers: this.alimtalkHeaders() })
    }

    /**
     * 채널 관리자폰으로 OTP 발송
     * POST /v1/alimtalk/senders/otp
     * ⚠️ 실제로 문자가 나간다. 여기서 받은 인증번호를 create() 의 otp 로 넘긴다.
     * @param params yellow_id / phone
     */
    async otp(params: AlimtalkSenderOtpParams): Promise<BootpayCommerceResponse<any>> {
        return this.bootpay.post<any>('alimtalk/senders/otp', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 발신프로필 등록
     * POST /v1/alimtalk/senders
     * ⚠️ 카카오에 발신프로필이 실제 등록된다. 같은 yellow_id 를 다시 등록하면 기존 프로필을 재사용한다(dedup).
     * 등록 성공 시 그룹키 등록까지 서버가 수행하므로 공식 카탈로그 전체를 바로 발송할 수 있다.
     * @param params otp / yellow_id / phone / category_code
     */
    async create(params: AlimtalkSenderCreateParams): Promise<BootpayCommerceResponse<AlimtalkSender>> {
        return this.bootpay.post<AlimtalkSender>('alimtalk/senders', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 연동한 채널 목록 조회
     * GET /v1/alimtalk/senders
     * 자체 DB 만 조회하며 벤더를 호출하지 않는다.
     */
    async list(): Promise<BootpayCommerceResponse<AlimtalkSenderListResponse>> {
        return this.bootpay.get<AlimtalkSenderListResponse>('alimtalk/senders', {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 채널 상세 조회
     * GET /v1/alimtalk/senders/{ksp_id}
     * sync 가 true 면 벤더에서 채널 상태를 다시 읽어 반영한다(느리다). 미지정이면 자체 DB 만 본다.
     * ⚠️ 미연동/미존재 채널은 404, 다른 프로젝트의 채널은 403 으로 오며 둘 다 error_code 는 3024 다.
     * @param kspId 채널 ID
     * @param sync 벤더 동기화 여부 (선택)
     */
    async detail(kspId: string, sync?: boolean): Promise<BootpayCommerceResponse<AlimtalkSender>> {
        return this.bootpay.get<AlimtalkSender>(this.withQuery(`alimtalk/senders/${kspId}`, { sync }), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 채널 연동 해지
     * DELETE /v1/alimtalk/senders/{ksp_id}
     * 이 프로젝트와의 연동만 끊는다 — 채널 모델과 템플릿은 보존된다. 성공 시 본문은 null 이다.
     * @param kspId 채널 ID
     */
    async release(kspId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`alimtalk/senders/${kspId}`, { headers: this.alimtalkHeaders() })
    }

    /**
     * 채널 변수 예문 사전 갱신
     * PUT /v1/alimtalk/senders/{ksp_id}/variable_examples
     * 템플릿 미리보기에서 #{user_name} 대신 '홍길동' 처럼 읽히게 하는 **표시용** 값이다.
     * ⚠️ 발송값이 아니다 — 벤더로 전송되지 않으므로 검수 상태와 무관하다. 보낸 키만 덮어쓴다(부분 갱신).
     * @param kspId 채널 ID
     * @param examples { user_name: '홍길동' } — 키에 '.' 이나 선행 '$' 는 쓸 수 없다
     */
    async variableExamples(
        kspId: string,
        examples: Record<string, string>
    ): Promise<BootpayCommerceResponse<AlimtalkSender>> {
        return this.bootpay.put<AlimtalkSender>(
            `alimtalk/senders/${kspId}/variable_examples`,
            this.compact({ examples }),
            { headers: this.alimtalkHeaders() }
        )
    }

    /**
     * 알림톡 요청 헤더
     * ★Idempotency-Key 를 싣지 않는다★ 알림톡 API 는 이 헤더를 읽지 않는다(멱등은 발송의 ref_id 로만 성립).
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
