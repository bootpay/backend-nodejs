// 가맹점 자체 알림톡 템플릿 CRUD·등록·검수 (/v1/alimtalk/templates 계열)
//
// 흐름: (초안 생성 → 확인 → 대행사 등록) → 검수 요청 → 승인(APR) → 발송 가능
// ⚠️ 본문 변수는 `#{변수명}` 형식이고 템플릿 전체에서 최대 40개다.

/** NONE·TEXT(강조표기형)·IMAGE(이미지형)·ITEM_LIST(아이템리스트형) */
export type AlimtalkTemplateEmphasizeType = 'NONE' | 'TEXT' | 'IMAGE' | 'ITEM_LIST'
/** BA(기본형)·EX(부가정보형)·AD(채널추가형)·MI(복합형) */
export type AlimtalkTemplateMsgType = 'BA' | 'EX' | 'AD' | 'MI'

/**
 * 자체 템플릿 목록 조회 파라미터 (GET /v1/alimtalk/templates)
 * ⚠️ 페이지네이션이 없다 — 필터에 걸린 템플릿을 한 번에 모두 돌려준다.
 */
export interface AlimtalkTemplateListParams {
    /**
     * 검수상태 필터 — 1 REG(등록) / 2 REQ(검수요청) / 3 APR(승인) / 4 KRR(등록거절) / 5 REJ(승인반려).
     * 숫자·숫자문자열·벤더 문자열('APR' 등)을 모두 받는다. 해석 못 하는 값은 필터 없음으로 떨어진다.
     */
    ins?: number | string
    /** latest(기본)·oldest·code */
    sort?: string
    /** 코드·이름·본문·분류 부분일치 */
    keyword?: string
}

/**
 * 자체 템플릿 공통 본문 필드.
 * 여기 명시되지 않은 값도 서버로 그대로 전달된다(Ruby SDK 의 **attrs 와 동일).
 */
export interface AlimtalkTemplateBody {
    name?: string
    content?: string
    buttons?: Array<Record<string, any>>
    msg_type?: AlimtalkTemplateMsgType | string
    emphasize_type?: AlimtalkTemplateEmphasizeType | string
    /** TEXT 강조표기형 필수 (50자) */
    emphasize_title?: string
    /** TEXT 강조표기형 필수 (40자) */
    emphasize_subtitle?: string
    /** EX(부가정보형) 필수 */
    template_extra?: string
    template_header?: string
    item_highlight?: Record<string, any>
    /** ITEM_LIST 필수 — list 는 2~10개 */
    template_item?: Record<string, any>
    image_url?: string
    /** alimtalkTemplate.image() 로 올려 받은 URL */
    storage_image_url?: string
    security_flag?: boolean
    category?: string
    tags?: string[]
    /** 변수 예문(표시용). 주면 **모든 변수에 예문이 있어야** 한다(없으면 3017). */
    examples?: Record<string, string>
    template_code?: string
    [key: string]: any
}

/**
 * 자체 템플릿 생성 파라미터 (POST /v1/alimtalk/templates)
 * ⚠️ register 를 false 로 주지 않으면 대행사·카카오에 **실제 등록**된다(되돌리려면 삭제해야 한다).
 */
export interface AlimtalkTemplateCreateParams extends AlimtalkTemplateBody {
    ksp_id: string
    /** false 로 주면 초안만 만든다 — 확인 후 alimtalkTemplate.register() 로 올리는 것을 권장한다 */
    register?: boolean
}

/**
 * 자체 템플릿 수정 파라미터 (PUT /v1/alimtalk/templates/:id)
 * ⚠️ **부분 수정이 아니다.** 보내지 않은 필드는 null 로 덮어써지므로 항상 전체 필드를 보낸다.
 * ⚠️ 수정 가능 상태는 초안 / REG(등록) / REJ(승인반려) / KRR(등록거절) 뿐이다 — APR·REQ 는 거부된다.
 * storage_image_url 을 빈 값으로 보내면 **이미지 삭제**로 처리되어 벤더에도 전달된다.
 */
export interface AlimtalkTemplateUpdateParams extends AlimtalkTemplateBody {}

/**
 * 템플릿 목록 내보내기 파라미터 (GET /v1/alimtalk/templates/export)
 * ⚠️ SDK 기본 format 은 **json** 이다 — 서버 기본은 csv 지만 csv 본문은 JSON 이 아니라서
 *    파싱을 통과하지 못한다. csv 를 주면 파싱 없이 원문 문자열을 담아 돌려준다.
 * 1회 5,000건을 넘으면 3031 로 거부되므로 채널·상태 필터로 좁힌다.
 */
export interface AlimtalkTemplateExportParams {
    /** json(SDK 기본)·csv */
    format?: 'json' | 'csv' | string
    /** private(기본, 내 채널 자체 템플릿)·official(공식 카탈로그)·all */
    scope?: 'private' | 'official' | 'all' | string
    ksp_id?: string
    status?: string
    include_content?: boolean
}

export interface AlimtalkTemplate {
    template_id?: string
    template_code?: string
    ksp_id?: string
    name?: string
    content?: string
    status?: string
    inspection_status?: string
    msg_type?: AlimtalkTemplateMsgType | string
    emphasize_type?: AlimtalkTemplateEmphasizeType | string
    buttons?: Array<Record<string, any>>
    variables?: string[]
    required_variables?: string[]
    examples?: Record<string, string>
    /** 반려 사유 */
    comments?: Array<Record<string, any>>
    created_at?: string | null
    updated_at?: string | null
}

export interface AlimtalkTemplateListResponse {
    list?: AlimtalkTemplate[]
    count?: number
}

export interface AlimtalkTemplateImageResponse {
    image_url?: string
}
