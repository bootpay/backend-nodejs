// 부트페이 공식 알림톡 템플릿 카탈로그 (GET/POST /v1/alimtalk/official 계열)

/** 공식 템플릿은 그룹 템플릿이라 BA(기본형)·EX(부가정보형)만 존재한다 (AD/MI 는 쓸 수 없다). */
export type AlimtalkOfficialMsgType = 'BA' | 'EX'

/**
 * 공식 템플릿 검색 파라미터 (GET /v1/alimtalk/official)
 * keyword 는 본문·이름·분류를 부분일치(대소문자 무시)로 훑는다.
 */
export interface AlimtalkOfficialListParams {
    /** 서버는 q 를 먼저 보고 없으면 keyword 를 본다 — SDK 는 정본 키인 q 로 보낸다 */
    keyword?: string
    category?: string
    msg_type?: AlimtalkOfficialMsgType | string
    page?: number
    /** 서버 기본 20, 최대 100 으로 clamp */
    per?: number
    /** 주면 그 채널의 변수 예문 사전으로 variable_examples 를 채워 준다(표시용) */
    ksp_id?: string
}

/**
 * 공식 템플릿 추천 파라미터 (POST /v1/alimtalk/official/recommend)
 * 유사도 score(0~1) 내림차순으로 돌려준다.
 */
export interface AlimtalkOfficialRecommendParams {
    /** 보내려는 문구 */
    text: string
    category?: string
    /** 서버 기본 5 */
    limit?: number
    ksp_id?: string
}

export interface AlimtalkOfficialTemplate {
    code?: string
    name?: string
    content?: string
    category?: string
    msg_type?: AlimtalkOfficialMsgType | string
    buttons?: Array<Record<string, any>>
    variables?: string[]
    required_variables?: string[]
    variable_examples?: Record<string, string>
    /** recommend 응답에만 담긴다 (0~1) */
    score?: number
}

export interface AlimtalkOfficialListResponse {
    list?: AlimtalkOfficialTemplate[]
    count?: number
    page?: number
    per?: number
    categories?: string[]
}
