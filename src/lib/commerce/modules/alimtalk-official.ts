import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    AlimtalkOfficialListParams,
    AlimtalkOfficialListResponse,
    AlimtalkOfficialRecommendParams,
    AlimtalkOfficialTemplate
} from '../types'

/**
 * 부트페이 공식 알림톡 템플릿 카탈로그 — GET/POST /v1/alimtalk/official 계열
 *
 * 부트페이가 미리 카카오 승인을 받아 둔 템플릿이라, 그룹키가 등록된 채널이면 **검수 없이 즉시 발송**된다.
 * alimtalkSender.create() 로 채널을 등록하면 그룹 등록이 함께 끝나므로 따로 채택할 것이 없다.
 * (채택 endpoint 는 서버에서 비활성화되어 SDK 에도 두지 않는다)
 *
 * 전부 조회 계열이라 부작용이 없다(자체 DB 만 본다).
 */
export class AlimtalkOfficialModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 공식 템플릿 검색
     * GET /v1/alimtalk/official
     * keyword 는 본문·이름·분류를 부분일치(대소문자 무시)로 훑는다.
     * msg_type 은 BA(기본형)·EX(부가정보형)만 존재한다 — 그룹 템플릿이라 AD/MI 는 쓸 수 없다.
     * ksp_id 를 주면 그 채널의 변수 예문 사전으로 variable_examples 를 채워 준다(표시용).
     * @param params 검색 파라미터
     */
    async list(params?: AlimtalkOfficialListParams): Promise<BootpayCommerceResponse<AlimtalkOfficialListResponse>> {
        const { keyword, ...rest } = params || {}
        // 서버는 q 를 먼저 보고 없으면 keyword 를 본다 — 정본 키인 q 로 보낸다
        return this.bootpay.get<AlimtalkOfficialListResponse>(
            this.withQuery('alimtalk/official', { q: keyword, ...rest }),
            { headers: this.alimtalkHeaders() }
        )
    }

    /**
     * 보내려는 문구로 공식 템플릿 추천받기
     * POST /v1/alimtalk/official/recommend
     * 유사도 score(0~1) 내림차순으로 돌려준다.
     * @param params 추천 파라미터
     */
    async recommend(
        params: AlimtalkOfficialRecommendParams
    ): Promise<BootpayCommerceResponse<AlimtalkOfficialListResponse>> {
        return this.bootpay.post<AlimtalkOfficialListResponse>('alimtalk/official/recommend', this.compact(params), {
            headers: this.alimtalkHeaders()
        })
    }

    /**
     * 공식 템플릿 상세 조회
     * GET /v1/alimtalk/official/{code}
     * code 는 서버 채번 코드(슬래시를 포함하지 않는다). 없거나 미노출이면 404(3015).
     * @param code 공식 템플릿 코드
     * @param kspId 변수 예문을 채워 볼 채널 ID (선택)
     */
    async detail(code: string, kspId?: string): Promise<BootpayCommerceResponse<AlimtalkOfficialTemplate>> {
        return this.bootpay.get<AlimtalkOfficialTemplate>(
            this.withQuery(`alimtalk/official/${code}`, { ksp_id: kspId }),
            { headers: this.alimtalkHeaders() }
        )
    }

    /**
     * 알림톡 요청 헤더
     * ★Idempotency-Key 를 싣지 않는다★ 알림톡 API 는 이 헤더를 읽지 않는다.
     * ★BOOTPAY-ROLE 은 항상 user★ 알림톡 스코프 키가 전부 user:alimtalk_* 다.
     */
    private alimtalkHeaders(): Record<string, string> {
        return { 'BOOTPAY-ROLE': 'user' }
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
