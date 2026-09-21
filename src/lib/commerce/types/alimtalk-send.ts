// 알림톡 발송 (POST /alimtalk/send · /send/bulk · DELETE /send/:receipt_id)

/**
 * 단건 발송 파라미터 (POST /alimtalk/send)
 *
 * ⚠️ 실제로 카카오톡이 발송되고 과금된다. 샌드박스가 없다.
 * - **멱등**: 같은 (프로젝트, ref_id) 로 재요청하면 기존 receipt 를 그대로 돌려준다.
 * - **필수 변수**: 템플릿 응답의 required_variables 를 모두 채워야 한다. 하나라도 비면 3017 로 거부된다.
 * - **채널**: sender_key(공개키)로 지정한다. 생략하면 프로젝트 연동 채널로 해석하며,
 *   연동 채널이 둘 이상일 때만 필수다(ksp_id 는 내부 문서 id 라 발송 API 에 쓰지 않는다).
 */
export interface AlimtalkSendParams {
    template_code: string
    /** 수신번호 */
    to: string
    /** { company_name: '부트페이몰', user_name: '홍길동' } 형태의 치환값 */
    variables?: Record<string, any>
    /** 가맹점 발송 식별자 — **멱등 키**로 쓰인다 */
    ref_id?: string
    /**
     * 알림톡 실패 시 문자(LMS) 대체발송 여부.
     * ⚠️ **미지정(undefined)과 false 는 다르다** — 미지정이면 프로젝트 기본값을 따르고, false 는 명시적으로 끈다.
     * 켜면 발신번호가 등록돼 있어야 하며 없으면 3030 으로 거부된다.
     */
    fallback?: boolean
    /** 예약 발송 시각(ISO8601). 생략하면 즉시 발송 */
    reserved_at?: string
    /** 발신 채널 공개키 */
    sender_key?: string
    user_id?: string
    /**
     * 이 건의 결과 웹훅을 받을 주소(26-09-21).
     * 주면 발송 성공·실패·문자 대체발송·예약취소 웹훅이 **이 주소로만** 간다(프로젝트 웹훅 설정은 쓰이지 않는다).
     * https 만 허용하며 2,000자를 넘으면 3028 로 거부된다. 서명은 프로젝트 시크릿으로 하고,
     * 시크릿만 필요하면 alimtalkWebhook.rotateSecret 으로 설정 없이 발급받을 수 있다.
     * ⚠️ 같은 ref_id 로 이미 접수·성공한 건을 다시 요청하면 기존 접수가 그대로 돌아와 새 주소는 무시된다.
     */
    webhook_url?: string
}

/** 벌크 발송 수신자 */
export interface AlimtalkSendBulkRecipient {
    to: string
    ref_id?: string
    variables?: Record<string, any>
}

/**
 * 벌크 발송 파라미터 (POST /alimtalk/send/bulk) — 1요청 = N수신자
 * ⚠️ 수신자 수만큼 실제 발송되고 과금된다.
 * - 쿼터를 넘으면 요청 시점에 **전체 거부**된다(3022) — 일부만 나가지 않는다.
 * - 수신거부 번호는 skipped 이며 과금되지 않고 발송 기록도 만들지 않는다.
 * - fallback 은 요청 단위로 한 번만 판정한다 — 발신번호가 없으면 요청 전체가 3030 으로 거부된다.
 * - webhook_url 도 요청 단위 하나다 — 이 요청으로 나간 모든 수신자 건의 결과 웹훅이 그 주소로 간다.
 */
export interface AlimtalkSendBulkParams {
    template_code: string
    recipients: AlimtalkSendBulkRecipient[]
    fallback?: boolean
    reserved_at?: string
    sender_key?: string
    user_id?: string
    /**
     * 이 요청으로 나간 모든 수신자 건의 결과 웹훅을 받을 주소(26-09-21).
     * 주면 프로젝트 웹훅 설정 대신 **이 주소로만** 간다.
     * 형식이 틀리면(https 아님·2,000자 초과) 요청 전체가 3028 로 거부된다.
     */
    webhook_url?: string
}

export interface AlimtalkSendReceipt {
    receipt_id?: string
    ref_id?: string
    to?: string
    /** 접수 직후에는 requested */
    status?: string
}

export interface AlimtalkSendBulkResponse {
    count?: number
    requested?: number
    skipped?: number
    rejected?: number
    receipts?: AlimtalkSendReceipt[]
}
