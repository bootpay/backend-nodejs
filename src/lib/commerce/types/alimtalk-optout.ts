// 알림톡 수신거부 (/v1/alimtalk/optouts 계열)

/**
 * 수신거부 목록 조회 파라미터 (GET /v1/alimtalk/optouts)
 * phone 은 숫자만 남겨 **부분일치**로 찾는다(정확 매칭이 아니다). 50건 단위로 페이징된다.
 */
export interface AlimtalkOptoutListParams {
    phone?: string
    page?: number
}

/** 수신거부 등록 파라미터 (POST /v1/alimtalk/optouts) — 같은 번호를 다시 등록해도 멱등이다. */
export interface AlimtalkOptoutCreateParams {
    phone: string
    reason?: string
}

/**
 * 수신거부 사전 확인 파라미터 (POST /v1/alimtalk/optouts/check)
 * 단건(phone)·다건(phones) 모두 받는다.
 * ⚠️ 1회 최대 1,000건이고 넘으면 -48 이다(중복은 서버가 제거).
 */
export interface AlimtalkOptoutCheckParams {
    phones?: string[]
    phone?: string
}

export interface AlimtalkOptout {
    id?: string
    phone?: string
    scope?: string
    /** 부트페이 전역 차단 여부 */
    global?: boolean
    /** ⚠️ 전역 건은 조회는 되지만 해제할 수 없다 (false) */
    releasable?: boolean
    source?: string
    reason?: string | null
    opted_out_at?: string | null
    created_at?: string | null
}

export interface AlimtalkOptoutListResponse {
    list?: AlimtalkOptout[]
    count?: number
    page?: number
}

export interface AlimtalkOptoutCheckItem {
    phone?: string
    opted_out?: boolean
    global?: boolean
    releasable?: boolean
    opted_out_at?: string | null
}

export interface AlimtalkOptoutCheckResponse {
    list?: AlimtalkOptoutCheckItem[]
    count?: number
    opted_out_count?: number
}

export interface AlimtalkOptoutReleaseResponse {
    phone?: string
    released?: boolean
    /** 전역 차단은 해제되지 않는다 — "지웠는데 여전히 막히는" 상태를 이 값으로 드러낸다 */
    global_blocked?: boolean
}
