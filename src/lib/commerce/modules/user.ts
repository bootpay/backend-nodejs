import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceUser,
    UserListParams,
    UserTokenResponse,
    UserLoginResponse,
    MallUserLoginParams,
    MallUserJoinParams,
    MallUserJoinCheckType,
    MallUserSessionResponse
} from '../types'
import { randomUUID } from 'crypto'

export class UserModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 사용자 토큰 발급
     * @param userId 사용자 ID
     */
    async token(userId: string): Promise<BootpayCommerceResponse<UserTokenResponse>> {
        return this.bootpay.post<UserTokenResponse>('users/login/token', { user_id: userId })
    }

    /**
     * 회원가입
     * @param user 사용자 정보
     */
    async join(user: CommerceUser): Promise<BootpayCommerceResponse<CommerceUser>> {
        return this.bootpay.post<CommerceUser>('users/join', user)
    }

    /**
     * 중복 체크
     * @param key 체크할 필드 (login_id, phone, email 등)
     * @param value 체크할 값
     */
    async checkExist(key: string, value: string): Promise<BootpayCommerceResponse<{ exists: boolean }>> {
        const encodedValue = encodeURIComponent(value)
        return this.bootpay.get<{ exists: boolean }>(`users/join/${key}?pk=${encodedValue}`)
    }

    /**
     * 본인인증 데이터 조회
     * @param standId 인증 ID
     */
    async authenticationData(standId: string): Promise<BootpayCommerceResponse<any>> {
        return this.bootpay.get<any>(`users/authenticate/${standId}`)
    }

    /**
     * 로그인
     * @param loginId 로그인 ID
     * @param loginPw 비밀번호
     */
    async login(loginId: string, loginPw: string): Promise<BootpayCommerceResponse<UserLoginResponse>> {
        return this.bootpay.post<UserLoginResponse>('users/login', {
            login_id: loginId,
            login_pw: loginPw
        })
    }

    /**
     * 회원 로그인 (V1 API)
     * POST /v1/users/login
     * v1 에는 단수 user/* 라우트가 없다. 로그인은 v1/users/login#create 다.
     * ⚠️ POST /v1/users/session 은 resource :session 이 만들어낸 라우트일 뿐 create 액션이 없다 — 그리로 보내면 안 된다.
     * ⚠️ 서버(LoginService)는 login_id/password 만 읽는다. corporate_type 은 전달돼도 무시된다.
     * @param params 로그인 파라미터 (corporate_type 미지정시 0)
     */
    async userLogin(params: MallUserLoginParams): Promise<BootpayCommerceResponse<UserLoginResponse>> {
        const { idempotency_key, corporate_type, ...rest } = params
        return this.bootpay.post<UserLoginResponse>(
            'users/login',
            this.compact({ ...rest, corporate_type: corporate_type === undefined ? 0 : corporate_type }),
            { headers: this.mallHeaders(undefined, idempotency_key) }
        )
    }

    /**
     * 회원 세션 조회 (V1 API)
     * GET /v1/users/session
     * @param userJwt 로그인시 발급받은 회원 JWT
     * @param idempotencyKey 미지정시 자동 생성
     */
    async userSession(
        userJwt?: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<MallUserSessionResponse>> {
        return this.bootpay.get<MallUserSessionResponse>('users/session', {
            headers: this.mallHeaders(userJwt, idempotencyKey)
        })
    }

    /**
     * 회원 로그아웃 (V1 API)
     * DELETE /v1/users/session
     * @param userJwt 로그인시 발급받은 회원 JWT
     * @param idempotencyKey 미지정시 자동 생성
     */
    async userLogout(userJwt: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>('users/session', {
            headers: this.mallHeaders(userJwt, idempotencyKey)
        })
    }

    /**
     * 회원가입 (V1 API) — 일반 회원가입용
     * POST /v1/users/join
     * ⚠️ join(user) 과 같은 엔드포인트를 부른다. 중복이 아니라 용도가 다르다 —
     *    이쪽은 password/corporate_type/group 을 쓰는 일반 회원가입, 저쪽은 uid/login_email/login_pw 를 쓰는 외부 uid 연동 가입이다.
     *    서버가 파라미터 조합으로 분기하므로 둘 다 유지한다.
     * @param params 회원가입 파라미터 (corporate_type 미지정시 0, 나머지 null/undefined 값은 전송하지 않는다)
     */
    async userJoin(params: MallUserJoinParams): Promise<BootpayCommerceResponse<CommerceUser>> {
        const { idempotency_key, corporate_type, ...rest } = params
        return this.bootpay.post<CommerceUser>(
            'users/join',
            this.compact({ ...rest, corporate_type: corporate_type === undefined ? 0 : corporate_type }),
            { headers: this.mallHeaders(undefined, idempotency_key) }
        )
    }

    /**
     * 회원가입 중복 확인 (V1 API) — key 를 인자로 받는 일반형
     * GET /v1/users/join/{type}?pk={pk}
     * ⚠️ uidExist 등 전용형과 기능이 겹치지만 둘 다 유지한다.
     *    일반형은 서버에 새 key 가 생겨도 SDK 수정 없이 쓸 수 있다.
     * @param type email-exist, id-exist, phone-exist, uid-exist, group-business-number-exist
     * @param pk 중복 확인할 값
     * @param idempotencyKey 미지정시 자동 생성
     */
    async userJoinCheck(
        type: MallUserJoinCheckType | string,
        pk: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<{ exists: boolean }>> {
        return this.bootpay.get<{ exists: boolean }>(`users/join/${type}?pk=${encodeURIComponent(pk)}`, {
            headers: this.mallHeaders(undefined, idempotencyKey)
        })
    }

    /**
     * 외부 uid(ex_uid) 중복 검사
     * GET /v1/users/join/uid-exist?pk={uid}
     * email-exist / id-exist / phone-exist / group-business-number-exist 와 같은 전용형이다.
     * @param uid 중복 확인할 외부 uid
     * @param idempotencyKey 미지정시 자동 생성
     */
    async uidExist(uid: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<{ exists: boolean }>> {
        return this.bootpay.get<{ exists: boolean }>(`users/join/uid-exist?pk=${encodeURIComponent(uid)}`, {
            headers: { ...this.mallHeaders(undefined, idempotencyKey), 'BOOTPAY-ROLE': 'user' }
        })
    }

    /**
     * 사용자 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: UserListParams): Promise<BootpayCommerceResponse<{ items: CommerceUser[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
            if (params.member_type !== undefined) queryParams.append('member_type', params.member_type.toString())
            if (params.type) queryParams.append('type', params.type)
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceUser[]; total: number }>(`users${query ? `?${query}` : ''}`)
    }

    /**
     * 사용자 상세 조회
     * @param userId 사용자 ID
     */
    async detail(userId: string): Promise<BootpayCommerceResponse<CommerceUser>> {
        return this.bootpay.get<CommerceUser>(`users/${userId}`)
    }

    /**
     * 사용자 정보 수정
     * @param user 사용자 정보
     */
    async update(user: CommerceUser): Promise<BootpayCommerceResponse<CommerceUser>> {
        if (!user.user_id) {
            return Promise.reject({ success: false, error: 'user_id is required' })
        }
        return this.bootpay.put<CommerceUser>(`users/${user.user_id}`, user)
    }

    /**
     * 사용자 삭제 (회원탈퇴)
     * @param userId 사용자 ID
     */
    async delete(userId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`users/${userId}`)
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작)
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
        )
    }

    /**
     * V1 Mall API 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성되고, Bootpay-User-JWT 는 값이 있을 때만 붙는다.
     */
    private mallHeaders(userJwt?: string, idempotencyKey?: string): Record<string, string> {
        const headers: Record<string, string> = {
            'Idempotency-Key': idempotencyKey || randomUUID()
        }
        if (userJwt !== undefined && userJwt !== null && userJwt !== '') {
            headers['Bootpay-User-JWT'] = userJwt
        }
        return headers
    }
}
