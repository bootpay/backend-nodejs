// 상품문의 (/v1/product-qnas 계열)

/**
 * 상품문의 목록 조회 파라미터 (GET /v1/product-qnas)
 * 고객 모드는 product_id 필수. 다른 사람의 비밀글은 is_viewable: false 로 본문 없이 온다.
 * 회원(user_id·login_id·user_jwt)을 보내면 그 회원이 쓴 비밀글 본문이 보인다.
 * supervisor: true + view: 'all' 이면 몰 전체(숨김 포함) — 이때 product_id 는 선택 필터다.
 */
export interface ProductQnaListParams {
    product_id?: string
    view?: string
    page?: number
    limit?: number
    user_id?: string
    login_id?: string
    /** 로그인시 발급받은 회원 JWT (Bootpay-User-JWT 헤더로 나간다) */
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

/**
 * 상품문의 단건 조회 파라미터 (GET /v1/product-qnas/{product_qna_id})
 * 다른 사람의 비밀글은 403 PRODUCT_QNA_SECRET_FORBIDDEN. supervisor: true 면 비밀글·숨김 글도 본다.
 */
export interface ProductQnaDetailParams {
    user_id?: string
    login_id?: string
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

/**
 * 상품문의 작성 파라미터 (POST /v1/product-qnas)
 * 회원(user_id·login_id·user_jwt) 또는 비회원(guest_name + guest_password, 몰이 비회원 작성을 허용할 때).
 * 회원 문의면 guest_* 는 무시된다.
 */
export interface ProductQnaCreateParams {
    product_id: string
    content: string
    title?: string
    product_option_id?: string
    option_text?: string
    is_secret?: boolean
    guest_name?: string
    guest_password?: string
    user_id?: string
    login_id?: string
    user_jwt?: string
    idempotency_key?: string
}

/**
 * 상품문의 수정 파라미터 (PUT /v1/product-qnas/{product_qna_id}) — 작성 회원 본인 또는 비회원 비밀번호, 답변 전만
 * 답변이 달린 문의는 409 PRODUCT_QNA_ALREADY_ANSWERED,
 * 비회원 비밀번호가 틀리면 403 PRODUCT_QNA_GUEST_PASSWORD_INVALID.
 */
export interface ProductQnaUpdateParams {
    title?: string
    content?: string
    is_secret?: boolean
    guest_password?: string
    user_id?: string
    login_id?: string
    user_jwt?: string
    idempotency_key?: string
}

/**
 * 상품문의 삭제 파라미터 (DELETE /v1/product-qnas/{product_qna_id}) — 작성 회원 본인·비회원 비밀번호 또는 supervisor
 * guest_password 는 URL 쿼리가 아닌 본문으로 보낸다(서버는 둘 다 받는다).
 */
export interface ProductQnaDeleteParams {
    guest_password?: string
    user_id?: string
    login_id?: string
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

export interface CommerceProductQnaAnswer {
    content?: string
    answered_at?: string | null
}

export interface CommerceProductQna {
    id?: string
    product_id?: string
    product_option_id?: string | null
    option_text?: string | null
    user_id?: string | null
    login_id?: string | null
    guest_name?: string | null
    title?: string | null
    content?: string | null
    is_secret?: boolean
    /** 비밀글을 볼 수 있는지 — false 면 본문 없이 온다 */
    is_viewable?: boolean
    is_display?: boolean
    answered?: boolean
    answer?: CommerceProductQnaAnswer | null
    created_at?: string | null
    updated_at?: string | null
}

export interface ProductQnaListResponse {
    list?: CommerceProductQna[]
    count?: number
    page?: number
    limit?: number
}
