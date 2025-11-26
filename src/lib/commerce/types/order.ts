import { ListParams } from './common'

// Constants
export const SUBSCRIPTION_BILLING_TYPE_NONE = 0
export const SUBSCRIPTION_BILLING_TYPE_EACH = 1
export const SUBSCRIPTION_BILLING_TYPE_GROUP = 2

export interface CommerceChosenProductOption {
    chosen_product_option_id?: string
    product_id?: string
    product_option_id?: string
    product_name?: string
    option_name?: string
    price?: number
    tax_free_price?: number
    qty?: number
}

export interface CommerceOrder {
    order_id?: string
    order_pre_id?: string
    chosen_product_options?: CommerceChosenProductOption[]

    parent_order_id?: string
    user_id?: string
    seller_id?: string
    project_id?: string
    status?: number
    currency?: number
    is_subscription?: boolean
    is_leaf?: boolean
    total_price?: number
    tax_free_price?: number
    discount_amount?: number
    delivery_price?: number
    payment_method?: string
    receipt_id?: string
    webhook_url?: string
    created_at?: string
    updated_at?: string

    cancelled_request_history?: CommerceOrderCancellationRequestHistory[]
}

export interface CommerceOrderCancellationRequestHistory {
    order_cancellation_request_history_id?: string
    order_id?: string
    status?: number
    cancel_reason?: string
    cancel_type?: number
    requested_at?: string
    processed_at?: string
}

export interface OrderListParams extends ListParams {
    user_id?: string
    user_group_id?: string
    status?: number[]
    payment_status?: number[]
    cs_type?: string
    css_at?: string
    cse_at?: string
    subscription_billing_type?: number
    order_subscription_ids?: string[]
}
