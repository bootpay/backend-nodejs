import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceUser, UserListParams, UserTokenResponse, UserLoginResponse } from '../types'

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
     * 회원 로그인 (Mall API alias)
     */
    async userLogin(loginId: string, loginPw: string): Promise<BootpayCommerceResponse<UserLoginResponse>> {
        return this.login(loginId, loginPw)
    }

    /**
     * 회원가입 (Mall API alias)
     */
    async userJoin(user: CommerceUser): Promise<BootpayCommerceResponse<CommerceUser>> {
        return this.join(user)
    }

    /**
     * 회원가입 중복 확인 (Mall API alias)
     */
    async userJoinCheck(type: string, pk: string): Promise<BootpayCommerceResponse<{ exists: boolean }>> {
        return this.checkExist(type, pk)
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
}
