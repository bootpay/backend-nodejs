// 공지사항 (/v1/notices 계열)

/**
 * 공지사항 목록 조회 파라미터 (GET /v1/notices)
 * supervisor: true 면 운영자 모드(BOOTPAY-ROLE: supervisor) — view: 'all' 로 비공개 공지까지 조회할 수 있다.
 * 고객 모드는 몰 공지사항 사용여부가 꺼져 있으면 BOARD_FEATURE_DISABLED 로 거절된다.
 */
export interface NoticeListParams {
    page?: number
    limit?: number
    keyword?: string
    /** 'all' 은 supervisor 모드에서만 의미가 있다 (비공개 공지 포함) */
    view?: string
    supervisor?: boolean
    idempotency_key?: string
}

/**
 * 공지사항 단건 조회 파라미터 (GET /v1/notices/{notice_id})
 * 비공개 공지는 supervisor: true 일 때만 보인다(아니면 404 POST_NOT_FOUND).
 */
export interface NoticeDetailParams {
    supervisor?: boolean
    idempotency_key?: string
}

/** 공지사항 등록 파라미터 (POST /v1/notices) — supervisor 전용 */
export interface NoticeCreateParams {
    title: string
    content: string
    images?: Array<string | { url?: string }>
    /** 상단 고정 공지 여부 */
    is_notice?: boolean
    is_display?: boolean
    idempotency_key?: string
}

/**
 * 공지사항 수정 파라미터 (PUT /v1/notices/{notice_id}) — supervisor 전용
 * 보낸 필드만 바뀐다. images 는 보내면 목록 전체를 교체한다([] 면 모두 삭제).
 */
export interface NoticeUpdateParams {
    title?: string
    content?: string
    images?: Array<string | { url?: string }>
    is_notice?: boolean
    is_display?: boolean
    idempotency_key?: string
}

export interface CommerceNotice {
    id?: string
    title?: string
    content?: string
    images?: Array<{ url?: string }> | string[]
    is_notice?: boolean
    is_display?: boolean
    view_count?: number
    created_at?: string | null
    updated_at?: string | null
}

export interface NoticeListResponse {
    list?: CommerceNotice[]
    count?: number
    page?: number
    limit?: number
}
