import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { AlimtalkSendBulkParams, AlimtalkSendBulkResponse, AlimtalkSendParams, AlimtalkSendReceipt } from '../types'

/**
 * 알림톡 발송 — POST /v1/alimtalk/send · /send/bulk · DELETE /send/:receipt_id
 *
 * ⚠️ **실제로 카카오톡이 발송되고 과금된다. 샌드박스가 없다.**
 *
 * 처리 순서: 멱등 확인 → 템플릿·채널 해석 → 발송권한 → 지갑 자격 → 발송제어 → 폴백 확정(발신번호 확보)
 *   → 수신거부 대조 → 변수 치환·규격검증 → 접수(READY) → 워커 전송
 *
 * - **멱등**: 같은 (프로젝트, ref_id) 로 재요청하면 기존 receipt 를 그대로 돌려준다. 실패한 건만 재발송된다.
 * - **필수 변수**: 템플릿 응답의 required_variables 를 모두 채워야 한다. 하나라도 비면 3017 로 거부된다.
 *   ⚠️ 다만 실제로 치환되어 나가는 건 본문·강조 타이틀·버튼 링크뿐이다 — 보조문구와 아이템리스트형
 *   요소는 발송 페이로드에 자리가 없어 카카오가 등록된 템플릿 문구 그대로 렌더한다.
 * - **채널**: sender_key(공개키)로 지정한다. 생략하면 프로젝트 연동 채널로 해석하며,
 *   연동 채널이 둘 이상일 때만 필수다(ksp_id 는 내부 문서 id 라 발송 API 에 쓰지 않는다).
 */
export class AlimtalkSendModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 단건 발송
     * POST /v1/alimtalk/send
     * ⚠️ fallback 은 **미지정(undefined)과 false 가 다르다** — 미지정이면 프로젝트 기본값을 따르고,
     *    false 는 명시적으로 끈다. compact 는 null/undefined 만 걷어내므로 false 는 그대로 전달된다.
     * @param params 발송 파라미터
     */
    async send(params: AlimtalkSendParams): Promise<BootpayCommerceResponse<AlimtalkSendReceipt>> {
        return this.bootpay.post<AlimtalkSendReceipt>('alimtalk/send', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 벌크 발송 (1요청 = N수신자)
     * POST /v1/alimtalk/send/bulk
     * ⚠️ 수신자 수만큼 실제 발송되고 과금된다.
     * - 쿼터를 넘으면 요청 시점에 **전체 거부**된다(3022) — 일부만 나가지 않는다.
     * - 개별 수신자의 실패는 건별 rejected 로 표시되고 나머지는 정상 발송된다.
     * - 수신거부 번호는 skipped 이며 **과금되지 않고 발송 기록도 만들지 않는다**.
     * - fallback 은 요청 단위로 한 번만 판정한다 — 발신번호가 없으면 요청 전체가 3030 으로 거부된다.
     * @param params 벌크 발송 파라미터
     */
    async bulk(params: AlimtalkSendBulkParams): Promise<BootpayCommerceResponse<AlimtalkSendBulkResponse>> {
        return this.bootpay.post<AlimtalkSendBulkResponse>('alimtalk/send/bulk', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 예약 발송 취소
     * DELETE /v1/alimtalk/send/{receipt_id}
     * 접수(READY) 상태의 예약 건만 취소할 수 있다 — 이미 전송에 들어갔으면 3023 이다.
     * @param receiptId 발송 접수 ID
     */
    async cancel(receiptId: string): Promise<BootpayCommerceResponse<AlimtalkSendReceipt>> {
        return this.bootpay.delete<AlimtalkSendReceipt>(`alimtalk/send/${receiptId}`, {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 알림톡 요청 헤더
     * ★Idempotency-Key 를 싣지 않는다★ 알림톡 API 는 이 헤더를 읽지 않는다 —
     *   멱등은 발송의 ref_id 로만 성립하므로, 헤더를 붙이면 서버가 주지 않는 보장을 주는 것처럼 보인다.
     * ★BOOTPAY-ROLE 은 항상 user★ 알림톡 스코프 키가 전부 user:alimtalk_* 다.
     */
    private alimtalkHeaders(): Record<string, string> {
        return { 'BOOTPAY-ROLE': 'user' }
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작 — false 는 남는다)
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload || {}).filter(([, value]) => value !== undefined && value !== null)
        )
    }
}
