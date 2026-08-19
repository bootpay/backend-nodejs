import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceUserGroup, UserGroupListParams, UserGroupLimitParams, UserGroupAggregateTransactionParams } from '../types'
import { randomUUID } from 'crypto'

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
        return this.bootpay.post<null>(`user-groups/${userGroupId}/user`, { user_id: userId })
    }

    /**
     * 그룹에서 사용자 제거
     * @param userGroupId 그룹 ID
     * @param userId 사용자 ID
     */
    async userDelete(userGroupId: string, userId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`user-groups/${userGroupId}/user/${userId}`)
    }

    /**
     * 그룹 구매한도 설정
     * PUT /v1/user-groups/{user_group_id}/limit
     * ⚠️ update 로는 한도가 절대 반영되지 않는다 — 서버 user_groups_controller#update 가
     *    use_limit / limit_message / limit_month_purchase / limit_week_purchase 를 명시적으로 제거하기 때문이다.
     *    한도는 이 전용 라우트로만 바뀐다. 서버 scope: manager:limit
     * @param params 제한 설정 파라미터
     */
    async limit(params: UserGroupLimitParams): Promise<BootpayCommerceResponse<CommerceUserGroup>> {
        if (!params.user_group_id) {
            return Promise.reject({ success: false, error: 'user_group_id is required' })
        }
        const { user_group_id, idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceUserGroup>(`user-groups/${user_group_id}/limit`, this.compact(payload), {
            headers: this.managerHeaders(idempotency_key)
        })
    }

    /**
     * 그룹 구독 합산청구(정산주기) 설정 변경
     * PUT /v1/user-groups/{user_group_id}/aggregate-transaction
     * update 에도 같은 이름의 인자가 있지만 서버는 이 전용 라우트에서만 처리한다.
     * @param params 집계 파라미터
     */
    async aggregateTransaction(params: UserGroupAggregateTransactionParams): Promise<BootpayCommerceResponse<any>> {
        if (!params.user_group_id) {
            return Promise.reject({ success: false, error: 'user_group_id is required' })
        }
        const { user_group_id, idempotency_key, ...payload } = params
        return this.bootpay.put<any>(`user-groups/${user_group_id}/aggregate-transaction`, this.compact(payload), {
            headers: this.managerHeaders(idempotency_key)
        })
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
     * 그룹 한도/합산청구 설정 요청 헤더 — 서버가 manager scope 를 요구한다.
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private managerHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'manager'
        }
    }
}
