// 알림톡 발신프로필(카카오채널) 생명주기 (GET /v1/alimtalk/categories · /senders 계열)

/**
 * OTP 발송 파라미터 (POST /v1/alimtalk/senders/otp)
 * ⚠️ 채널 관리자 휴대폰으로 실제 문자가 나간다.
 */
export interface AlimtalkSenderOtpParams {
    /** 카카오채널 검색용 아이디 (@ 포함) */
    yellow_id: string
    /** 채널 관리자 휴대폰 번호 */
    phone: string
}

/**
 * 발신프로필 등록 파라미터 (POST /v1/alimtalk/senders)
 * ⚠️ 카카오에 발신프로필이 실제 등록된다. 같은 yellow_id 를 다시 등록하면 기존 프로필을 재사용한다(dedup).
 * 등록 성공 시 그룹키 등록까지 서버가 수행하므로 공식 카탈로그 전체를 바로 발송할 수 있다.
 */
export interface AlimtalkSenderCreateParams {
    /** alimtalk_sender_otp 로 받은 인증번호 */
    otp: string
    yellow_id: string
    phone: string
    /** alimtalkSender.categories() 로 조회한 카테고리 코드 */
    category_code: string
}

export interface AlimtalkSender {
    ksp_id?: string
    yellow_id?: string
    sender_key?: string
    phone?: string
    category_code?: string
    status?: string
    variable_examples?: Record<string, string>
    created_at?: string | null
}

export interface AlimtalkSenderListResponse {
    list?: AlimtalkSender[]
    count?: number
}
