import { ListParams } from './common'

export interface CommerceOrderSubscription {
    order_subscription_id?: string
    seller_id?: string
    project_id?: string
    order_id?: string
    order_pre_id?: string
    user_id?: string
    user_group_id?: string
    wallet_id?: string

    subscription_billing_type?: number
    subscription_payment_cycle_type?: number
    subscription_payment_date?: number
    subscription_billing_base_day?: number

    quantity?: number
    is_first_prepaid?: boolean

    one_unit_price?: number
    one_unit_tax_free_price?: number
    price?: number
    tax_free_price?: number
    setup_price?: number

    unit?: number
    order_name?: string
    product_name?: string
    option_names?: string[]

    service_start_at?: string
    service_end_at?: string

    last_billing_created_at?: string
    latest_purchased_at?: string
    latest_failed_at?: string
    payment_next_at?: string

    current_duration?: number
    created_last_duration?: number
    payment_last_duration?: number
    total_subscription_duration?: number

    membership_type?: number
    use_subscription_times?: boolean

    renewal_status?: number
    cancel_status?: number
    status?: number
    cancel_at?: string
}

export interface OrderSubscriptionListParams extends ListParams {
    s_at?: string
    e_at?: string
    request_type?: string
    user_group_id?: string
    user_id?: string
}

export interface OrderSubscriptionUpdateParams {
    order_subscription_id: string
    next_billing_at?: string
    billing_key?: string
    status?: number
    payment_next_at?: string
    service_end_at?: string
}

// Request Ing Types
export interface OrderSubscriptionPauseParams {
    order_subscription_id?: string
    order_number?: string
    reason?: string
    paused_at?: string
    expected_resume_at?: string
}

export interface OrderSubscriptionResumeParams {
    order_subscription_id?: string
    order_number?: string
    resume_at?: string
}

export interface OrderSubscriptionTerminationParams {
    order_subscription_id?: string
    order_number?: string
    termination_fee?: number
    last_bill_refund_price?: number
    final_fee?: number
    service_end_at?: string
    reason?: string
}

export interface CalcTerminateFeeResponse {
    termination_fee?: number
    refund_amount?: number
    last_bill_refund_price?: number
    final_fee?: number
}

export interface SupervisorOrderSubscriptionApproveParams {
    reason?: string
}

export interface SupervisorOrderSubscriptionRejectParams {
    reason?: string
}

export interface SupervisorOrderSubscriptionTerminateParams {
    reason?: string
    termination_fee?: number
    last_bill_refund_price?: number
    final_fee?: number
    service_end_at?: string
    cancel_date?: string
}

export interface SupervisorOrderSubscriptionPauseParams {
    reason?: string
    paused_at: string
    expected_resume_at?: string
}

export interface SupervisorOrderSubscriptionResumeParams {
    reason?: string
}
