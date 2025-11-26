// Constants
export const SUBSCRIPTION_ADJUSTMENT_TYPE_PERIOD_DISCOUNT = 1

export interface CommerceOrderSubscriptionAdjustment {
    order_subscription_adjustment_id?: string
    duration?: number
    price?: number
    tax_free_price?: number
    name?: string
    type?: number
    created_at?: string
}

export interface OrderSubscriptionAdjustmentUpdateParams {
    order_subscription_id: string
    order_subscription_adjustment_id?: string
    duration?: number
    price?: number
    tax_free_price?: number
    name?: string
    type?: number
}
