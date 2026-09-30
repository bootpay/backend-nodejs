// 1:1 문의 (/v1/inquiries 계열)

/**
 * 1:1 문의 목록 조회 파라미터 (GET /v1/inquiries)
 * 회원 모드: user_id(Bootpay 회원 _id 또는 외부 회원 ID)·login_id·user_jwt 중 하나로 회원을 정하고 본인 문의만 본다.
 * supervisor: true 면 몰 전체 문의 — 이때 user_id 는 작성 회원 필터(선택)다.
 */
export interface InquiryListParams {
    user_id?: string
    login_id?: string
    /** 로그인시 발급받은 회원 JWT (Bootpay-User-JWT 헤더로 나간다) */
    user_jwt?: string
    /** true 답변 완료만 / false 미답변만 / 미지정 전체 */
    answered?: boolean
    page?: number
    limit?: number
    supervisor?: boolean
    idempotency_key?: string
}

/**
 * 1:1 문의 단건 조회 파라미터 (GET /v1/inquiries/{inquiry_id})
 * 회원 모드는 작성 회원 본인 문의만(다른 회원 문의는 404). supervisor: true 면 몰의 모든 문의.
 */
export interface InquiryDetailParams {
    user_id?: string
    login_id?: string
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

/**
 * 1:1 문의 작성 파라미터 (POST /v1/inquiries) — 회원 전용
 * product_id 는 이 몰의 상품, order_id 는 작성 회원의 주문이어야 한다. option 은 상품 옵션 문구(product_id 필요).
 */
export interface InquiryCreateParams {
    content: string
    user_id?: string
    login_id?: string
    user_jwt?: string
    title?: string
    product_id?: string
    option?: string
    order_id?: string
    idempotency_key?: string
}

/**
 * 1:1 문의 수정 파라미터 (PUT /v1/inquiries/{inquiry_id}) — 작성 회원 본인, 답변 전만
 * 답변이 달린 문의는 409 INQUIRY_ALREADY_ANSWERED. title 에 '' 를 보내면 제목을 지운다.
 */
export interface InquiryUpdateParams {
    user_id?: string
    login_id?: string
    user_jwt?: string
    title?: string
    content?: string
    idempotency_key?: string
}

/**
 * 1:1 문의 삭제 파라미터 (DELETE /v1/inquiries/{inquiry_id}) — 작성 회원 본인 또는 supervisor
 * 달린 답변도 함께 삭제된다.
 */
export interface InquiryDeleteParams {
    user_id?: string
    login_id?: string
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

export interface CommerceInquiryAnswer {
    content?: string
    answered_at?: string | null
}

export interface CommerceInquiry {
    id?: string
    user_id?: string
    login_id?: string
    title?: string
    content?: string
    product_id?: string | null
    option?: string | null
    order_id?: string | null
    answered?: boolean
    answer?: CommerceInquiryAnswer | null
    created_at?: string | null
    updated_at?: string | null
}

export interface InquiryListResponse {
    list?: CommerceInquiry[]
    count?: number
    page?: number
    limit?: number
}
