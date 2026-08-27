import { BootpayCommerceResource, BootpayCommerceRawResponse, BootpayCommerceResponse } from '../../commerce-resource'
import {
    AlimtalkTemplate,
    AlimtalkTemplateCreateParams,
    AlimtalkTemplateExportParams,
    AlimtalkTemplateImageResponse,
    AlimtalkTemplateListParams,
    AlimtalkTemplateListResponse,
    AlimtalkTemplateUpdateParams
} from '../types'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

/** 이미지 업로드 입력 — 파일 경로(String)·Buffer·ReadStream 을 모두 받는다. */
export type AlimtalkTemplateImageInput = string | Buffer | NodeJS.ReadableStream

/**
 * 가맹점 자체 알림톡 템플릿 CRUD·등록·검수 — /v1/alimtalk/templates 계열
 *
 * 흐름: (초안 생성 → 확인 → 대행사 등록) → 검수 요청 → 승인(APR) → 발송 가능
 *   create({ register: false }) 로 초안만 만들고, 내용을 확인한 뒤 register() 로 올리는 것을 권장한다.
 *
 * ⚠️ register 를 명시적으로 false 로 주지 않으면 **생성 즉시 대행사·카카오에 실제 등록**된다.
 * ⚠️ 본문 변수는 `#{변수명}` 형식이고 템플릿 전체에서 최대 40개다.
 */
export class AlimtalkTemplateModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 내 자체 템플릿 목록 조회
     * GET /v1/alimtalk/templates
     * ins: 검수상태 필터 — 1 REG(등록) / 2 REQ(검수요청) / 3 APR(승인) / 4 KRR(등록거절) / 5 REJ(승인반려).
     *      숫자·숫자문자열·벤더 문자열('APR' 등)을 모두 받는다. 해석 못 하는 값은 필터 없음으로 떨어진다.
     * ⚠️ 페이지네이션이 없다 — 필터에 걸린 템플릿을 한 번에 모두 돌려준다.
     * @param params 조회 파라미터
     */
    async list(params?: AlimtalkTemplateListParams): Promise<BootpayCommerceResponse<AlimtalkTemplateListResponse>> {
        return this.bootpay.get<AlimtalkTemplateListResponse>(this.withQuery('alimtalk/templates', params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 자체 템플릿 생성
     * POST /v1/alimtalk/templates
     * ⚠️ register 를 false 로 주지 않으면 대행사·카카오에 **실제 등록**된다(되돌리려면 삭제해야 한다).
     *
     * emphasize_type: NONE·TEXT(강조표기형)·IMAGE(이미지형)·ITEM_LIST(아이템리스트형)
     *   - TEXT 는 emphasize_title·emphasize_subtitle 둘 다 필수(각 50자·40자)
     *   - IMAGE 는 이미지 필수 — image() 로 올린 URL 을 storage_image_url 로 넘긴다
     *   - ITEM_LIST 는 template_item.list(2~10개) 필수 + template_header·item_highlight·이미지 중 하나 이상
     * msg_type: BA(기본형)·EX(부가정보형, template_extra 필수)·AD(채널추가형)·MI(복합형)
     *   - AD·MI 는 채널추가(AC) 버튼이 필수다
     * examples: 변수 예문(표시용). 주면 **모든 변수에 예문이 있어야** 한다(없으면 3017).
     * @param params 템플릿 정보 (여기 명시되지 않은 값도 서버로 그대로 전달된다)
     */
    async create(params: AlimtalkTemplateCreateParams): Promise<BootpayCommerceResponse<AlimtalkTemplate>> {
        return this.bootpay.post<AlimtalkTemplate>('alimtalk/templates', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 자체 템플릿 상세 조회
     * GET /v1/alimtalk/templates/{template_id}
     * template_id 는 문서 id 이고, ObjectId 형식이 아니면 **템플릿 코드**로 해석한다.
     * ⚠️ sync 는 서버 기본값이 **true** 라 조회만 해도 벤더 상태 동기화가 일어난다.
     *    초안(등록 전)을 조회할 때는 sync 를 false 로 주는 것을 권장한다.
     * @param templateId 템플릿 ID 또는 템플릿 코드
     * @param sync 벤더 동기화 여부 (선택, 서버 기본 true)
     */
    async detail(templateId: string, sync?: boolean): Promise<BootpayCommerceResponse<AlimtalkTemplate>> {
        return this.bootpay.get<AlimtalkTemplate>(this.withQuery(`alimtalk/templates/${templateId}`, { sync }), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 자체 템플릿 수정
     * PUT /v1/alimtalk/templates/{template_id}
     * ⚠️ **부분 수정이 아니다.** 보내지 않은 필드는 null 로 덮어써지므로 항상 전체 필드를 보낸다.
     * ⚠️ 등록된 템플릿을 수정하면 벤더에도 수정 요청이 나간다.
     *    수정 가능 상태는 초안 / REG(등록) / REJ(승인반려) / KRR(등록거절) 뿐이다 — APR·REQ 는 거부된다.
     * storage_image_url 을 빈 값으로 보내면 **이미지 삭제**로 처리되어 벤더에도 전달된다.
     * @param templateId 템플릿 ID
     * @param params 템플릿 정보 (여기 명시되지 않은 값도 서버로 그대로 전달된다)
     */
    async update(
        templateId: string,
        params: AlimtalkTemplateUpdateParams
    ): Promise<BootpayCommerceResponse<AlimtalkTemplate>> {
        return this.bootpay.put<AlimtalkTemplate>(`alimtalk/templates/${templateId}`, this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 자체 템플릿 삭제
     * DELETE /v1/alimtalk/templates/{template_id}
     * 초안(등록 전)은 대행사 거부와 무관하게 로컬에서 삭제된다.
     * ⚠️ 등록분은 **대행사 삭제가 성공해야** 삭제된다 — 승인(APR) 템플릿은 카카오가 거부하므로
     *    500(3013)이 오고 템플릿은 남는다. 같은 코드가 대행사에 선점된 채 로컬만 사라지는 것을 막기 위함이다.
     * @param templateId 템플릿 ID
     */
    async delete(templateId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`alimtalk/templates/${templateId}`, { headers: this.alimtalkHeaders() })
    }

    /**
     * 초안을 대행사에 등록
     * POST /v1/alimtalk/templates/{template_id}/register
     * ⚠️ 대행사·카카오에 실제 등록된다. 등록 전(초안) 상태에서만 호출할 수 있다.
     * @param templateId 템플릿 ID
     */
    async register(templateId: string): Promise<BootpayCommerceResponse<AlimtalkTemplate>> {
        return this.bootpay.post<AlimtalkTemplate>(`alimtalk/templates/${templateId}/register`, {}, {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 검수 요청
     * POST /v1/alimtalk/templates/{template_id}/inspect
     * ⚠️ **카카오에 검수를 요청하며 취소할 수 없다.**
     * 대행사 등록이 끝난 대기(R) + REG(등록) 상태에서만 호출할 수 있다 — 초안은 먼저 register() 를 부른다.
     * 반려(REJ/KRR)된 건은 재요청이 아니라 **수정 후 재요청**이다. 반려 사유는 응답의 comments 에 담긴다.
     * @param templateId 템플릿 ID
     */
    async inspect(templateId: string): Promise<BootpayCommerceResponse<AlimtalkTemplate>> {
        return this.bootpay.post<AlimtalkTemplate>(`alimtalk/templates/${templateId}/inspect`, {}, {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 템플릿 목록 내보내기
     * GET /v1/alimtalk/templates/export
     * scope: private(기본, 내 채널 자체 템플릿)·official(공식 카탈로그)·all
     * ⚠️ 기본 format 을 **json 으로 둔다** — 서버 기본은 csv 지만, csv 본문은 JSON 이 아니라서
     *    일반 조회 경로로는 파싱이 깨진다. csv 를 주면 파싱 없이 원문 문자열을 담아
     *    { body, content_type } 으로 돌려준다.
     * 1회 5,000건을 넘으면 3031 로 거부되므로 채널·상태 필터로 좁힌다.
     * @param params 내보내기 파라미터
     */
    async export(
        params?: AlimtalkTemplateExportParams
    ): Promise<BootpayCommerceResponse<any> | BootpayCommerceRawResponse> {
        const format = params?.format === undefined ? 'json' : params.format
        const query = this.withQuery('alimtalk/templates/export', { ...(params || {}), format })

        if (String(format) === 'csv') {
            return this.bootpay.getRaw(query, { headers: this.alimtalkHeaders('*/*') })
        }

        return this.bootpay.get<any>(query, { headers: this.alimtalkHeaders() })
    }

    /**
     * 이미지형 템플릿의 원본 이미지 업로드
     * POST /v1/alimtalk/templates/image
     * 돌려받은 image_url 을 템플릿 생성/수정의 storage_image_url 로 넘긴다.
     * 규격을 업로드 **전에** 서버가 검사한다 — jpg/png · 500KB 이하 · 가로 500px 이상 · 2:1.
     * @param image 파일 경로 / Buffer / ReadStream
     * @param replaceUrl 주면 업로드 성공 후에 기존 파일을 지운다
     */
    async image(
        image: AlimtalkTemplateImageInput,
        replaceUrl?: string
    ): Promise<BootpayCommerceResponse<AlimtalkTemplateImageResponse>> {
        return this.bootpay.postMultipart<AlimtalkTemplateImageResponse>(
            'alimtalk/templates/image',
            this.imageForm(image, replaceUrl),
            { headers: this.alimtalkHeaders() }
        )
    }

    /**
     * 아이템리스트형의 하이라이트 썸네일 업로드
     * POST /v1/alimtalk/templates/highlight_image
     * ⚠️ 본문 이미지와 **규격이 다르다** — jpg/png · 500KB 이하 · 가로 **108px** 이상 · **1:1**.
     *    본문 이미지 endpoint 로 올리면 거부된다.
     * 돌려받은 image_url 은 item_highlight.storage_image_url 로 넘긴다.
     * ⚠️ 썸네일을 붙이면 하이라이트 글자 한도가 줄어든다(타이틀 30→21, 설명 19→13).
     * @param image 파일 경로 / Buffer / ReadStream
     * @param replaceUrl 주면 업로드 성공 후에 기존 파일을 지운다
     */
    async highlightImage(
        image: AlimtalkTemplateImageInput,
        replaceUrl?: string
    ): Promise<BootpayCommerceResponse<AlimtalkTemplateImageResponse>> {
        return this.bootpay.postMultipart<AlimtalkTemplateImageResponse>(
            'alimtalk/templates/highlight_image',
            this.imageForm(image, replaceUrl),
            { headers: this.alimtalkHeaders() }
        )
    }

    /**
     * 이미지 업로드용 multipart form 을 만든다.
     * 경로(String)를 주면 ReadStream 으로 열고 파일명을 함께 붙인다 — 파일명이 없으면 서버가 확장자를 못 읽는다.
     */
    private imageForm(image: AlimtalkTemplateImageInput, replaceUrl?: string): FormData {
        const form = new FormData()
        if (typeof image === 'string') {
            form.append('image', fs.createReadStream(image), path.basename(image))
        } else {
            form.append('image', image as any)
        }
        if (replaceUrl !== undefined && replaceUrl !== null && replaceUrl !== '') {
            form.append('replace_url', String(replaceUrl))
        }
        return form
    }

    /**
     * 알림톡 요청 헤더
     * ★Idempotency-Key 를 싣지 않는다★ 알림톡 API 는 이 헤더를 읽지 않는다(멱등은 발송의 ref_id 로만 성립).
     * ★BOOTPAY-ROLE 은 항상 user★ 알림톡 스코프 키가 전부 user:alimtalk_* 다.
     * @param accept CSV 원문 수신처럼 JSON 이 아닌 응답을 받을 때 지정한다
     */
    private alimtalkHeaders(accept?: string): Record<string, string> {
        const headers: Record<string, string> = { 'BOOTPAY-ROLE': 'user' }
        if (accept) headers['Accept'] = accept
        return headers
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작)
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload || {}).filter(([, value]) => value !== undefined && value !== null)
        )
    }

    /**
     * null/undefined 를 뺀 값만 query string 으로 붙인다.
     */
    private withQuery(uri: string, params?: Record<string, any>): string {
        const queryParams = new URLSearchParams()
        Object.entries(params || {}).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            queryParams.append(key, String(value))
        })
        const query = queryParams.toString()
        return query ? `${uri}?${query}` : uri
    }
}
