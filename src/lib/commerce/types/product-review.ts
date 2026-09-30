// 상품평 (/v1/reviews 계열)

/**
 * 상품평 목록 조회 파라미터 (GET /v1/reviews)
 * 회원 모드: user_id·login_id·user_jwt 로 정한 회원이 쓴 상품평만 본다.
 * supervisor: true 면 몰 전체 상품평 — 이때 user_id 는 작성 회원 필터(선택)다.
 * 상품 상세의 공개 상품평 목록은 기존 GET /v1/products/{product_id}/reviews 를 쓴다.
 */
export interface ProductReviewListParams {
    page?: number
    limit?: number
    product_id?: string
    view?: string
    user_id?: string
    login_id?: string
    /** 로그인시 발급받은 회원 JWT (Bootpay-User-JWT 헤더로 나간다) */
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

/**
 * 상품평 단건 조회 파라미터 (GET /v1/reviews/{product_review_id})
 * 공개 상품평은 누구나, 숨김 상품평은 작성 회원 본인 또는 supervisor 만 본다.
 */
export interface ProductReviewDetailParams {
    user_id?: string
    login_id?: string
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

/**
 * 상품평 작성 파라미터 (POST /v1/reviews) — 회원 전용
 * order_id 는 회원의 구매확정 주문, product_id(·product_option_id)는 그 주문에 담긴 상품이어야 한다.
 * images 는 사진 URL 최대 5개(문자열 또는 { url } 객체). 파일 업로드는 지원하지 않는다.
 */
export interface ProductReviewCreateParams {
    order_id: string
    product_id: string
    rating: number
    content: string
    product_option_id?: string
    images?: Array<string | { url?: string }>
    user_id?: string
    login_id?: string
    user_jwt?: string
    idempotency_key?: string
}

/**
 * 상품평 수정 파라미터 (PUT /v1/reviews/{product_review_id}) — 작성 회원 본인, 작성 후 7일 이내
 * images 는 보내면 통째로 교체한다([] 면 모두 삭제). 7일이 지나면 REVIEW_EDIT_TIME_EXPIRED.
 */
export interface ProductReviewUpdateParams {
    rating?: number
    content?: string
    images?: Array<string | { url?: string }>
    user_id?: string
    login_id?: string
    user_jwt?: string
    idempotency_key?: string
}

/**
 * 상품평 삭제 파라미터 (DELETE /v1/reviews/{product_review_id}) — 작성 회원 본인 또는 supervisor
 * 지급된 적립금 회수·상품 통계 차감이 함께 일어난다. reason 은 운영자 모드의 삭제 사유.
 */
export interface ProductReviewDeleteParams {
    reason?: string
    user_id?: string
    login_id?: string
    user_jwt?: string
    supervisor?: boolean
    idempotency_key?: string
}

export interface CommerceProductReviewReply {
    content?: string
    replied_at?: string | null
}

export interface CommerceProductReview {
    id?: string
    order_id?: string
    product_id?: string
    product_option_id?: string | null
    user_id?: string | null
    login_id?: string | null
    rating?: number
    content?: string
    images?: Array<{ url?: string }> | string[]
    is_display?: boolean
    /** 판매자 답글 */
    reply?: CommerceProductReviewReply | null
    created_at?: string | null
    updated_at?: string | null
}

export interface ProductReviewListResponse {
    list?: CommerceProductReview[]
    count?: number
    page?: number
    limit?: number
}
