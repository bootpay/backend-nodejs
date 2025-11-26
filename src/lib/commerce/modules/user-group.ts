import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceUserGroup, UserGroupListParams, UserGroupLimitParams, UserGroupAggregateTransactionParams } from '../types'

export class UserGroupModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 사용자 그룹 생성
     * @param userGroup 그룹 정보
     */
    async create(userGroup: CommerceUserGroup): Promise<BootpayCommerceResponse<CommerceUserGroup>> {
        return this.bootpay.post<CommerceUserGroup>('user-groups', userGroup)
    }

    /**
     * 사용자 그룹 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: UserGroupListParams): Promise<BootpayCommerceResponse<{ items: CommerceUserGroup[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
            if (params.corporate_type !== undefined) queryParams.append('corporate_type', params.corporate_type.toString())
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceUserGroup[]; total: number }>(`user-groups${query ? `?${query}` : ''}`)
    }

    /**
     * 사용자 그룹 상세 조회
     * @param userGroupId 그룹 ID
     */
    async detail(userGroupId: string): Promise<BootpayCommerceResponse<CommerceUserGroup>> {
        return this.bootpay.get<CommerceUserGroup>(`user-groups/${userGroupId}`)
    }

    /**
     * 사용자 그룹 수정
     * @param userGroup 그룹 정보
     */
    async update(userGroup: CommerceUserGroup): Promise<BootpayCommerceResponse<CommerceUserGroup>> {
        if (!userGroup.user_group_id) {
            return Promise.reject({ success: false, error: 'user_group_id is required' })
        }
        return this.bootpay.put<CommerceUserGroup>(`user-groups/${userGroup.user_group_id}`, userGroup)
    }

    /**
     * 그룹에 사용자 추가
     * @param userGroupId 그룹 ID
     * @param userId 사용자 ID
     */
    async userCreate(userGroupId: string, userId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.post<null>(`user-groups/${userGroupId}/add_user`, { user_id: userId })
    }

    /**
     * 그룹에서 사용자 제거
     * @param userGroupId 그룹 ID
     * @param userId 사용자 ID
     */
    async userDelete(userGroupId: string, userId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`user-groups/${userGroupId}/remove_user?user_id=${userId}`)
    }

    /**
     * 그룹 제한 설정
     * @param params 제한 설정 파라미터
     */
    async limit(params: UserGroupLimitParams): Promise<BootpayCommerceResponse<CommerceUserGroup>> {
        if (!params.user_group_id) {
            return Promise.reject({ success: false, error: 'user_group_id is required' })
        }
        return this.bootpay.put<CommerceUserGroup>(`user-groups/${params.user_group_id}/limit`, params)
    }

    /**
     * 그룹 거래 집계 조회
     * @param params 집계 파라미터
     */
    async aggregateTransaction(params: UserGroupAggregateTransactionParams): Promise<BootpayCommerceResponse<any>> {
        if (!params.user_group_id) {
            return Promise.reject({ success: false, error: 'user_group_id is required' })
        }
        return this.bootpay.put<any>(`user-groups/${params.user_group_id}/aggregate-transaction`, params)
    }
}
