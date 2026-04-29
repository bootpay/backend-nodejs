export interface OrderSubscriptionRequest {
    order_subscription_request_history_id?: string
    order_subscription_id?: string
    project_id?: string
    user_id?: string
    request_type?: number
    status?: number
    reason?: string
    requested_at?: string
    processed_at?: string | null
    created_at?: string
    updated_at?: string
}

export interface OrderSubscriptionRequestListParams {
    project_id?: string
    page?: number
    limit?: number
    request_type?: number
    status?: number
    s_at?: string
    e_at?: string
    keyword?: string
}

export type OrderSubscriptionRequestApprovalAction = 'approve' | 'reject'

export interface OrderSubscriptionRequestUpdateParams {
    order_subscription_request_history_id: string
    approval: OrderSubscriptionRequestApprovalAction
    reason?: string
    [extra: string]: unknown
}
