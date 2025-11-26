export interface OrderCancelListParams {
    order_id?: string
    order_number?: string
}

export interface CancelProduct {
    order_product_id?: string
    product_id?: string
    qty?: number
    cancel_price?: number
}

export interface CancelOrderSubscriptionBill {
    order_subscription_bill_id?: string
    cancel_price?: number
}

export interface RequestCancelParameter {
    cancel_products?: CancelProduct[]
    cancel_order_subscription_bills?: CancelOrderSubscriptionBill[]
    cancel_reason?: string
    cancel_type?: number
    refund_price?: number
}

export interface OrderCancelParams {
    order_number?: string
    request_cancel_parameters?: RequestCancelParameter
    is_supervisor?: boolean
}

export interface OrderCancelActionParams {
    order_cancel_request_history_id: string
    cancel_reason?: string
    refund_price?: number
}

export interface CommerceOrderCancelRequestHistory {
    order_cancel_request_history_id?: string
    order_id?: string
    order_number?: string
    status?: number
    cancel_reason?: string
    cancel_type?: number
    requested_at?: string
    processed_at?: string
    refund_price?: number
}
