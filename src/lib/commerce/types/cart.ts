export interface CartItemPayload {
    product_id: string
    product_option_id?: string
    quantity?: number
    is_subscription?: boolean
    subscription_period_id?: string
}

export interface ShippingAddressPayload {
    zipcode?: string
}

export interface OrderPreviewParams {
    member_mode?: 'guest' | 'member'
    cart_items?: CartItemPayload[]
    shipping_address?: ShippingAddressPayload
    coupon_ids?: string[]
    point_amount?: number
    user_group_id?: string
}

export interface DeliveryGroupItem {
    cart_item_id?: string
    product_id: string
    product_option_id?: string
    product_name?: string
    quantity: number
    price: number
    subtotal?: number
}

export interface DeliveryGroup {
    group_key?: string
    seller_id?: string
    delivery_shipping_id?: string
    delivery_shipping_bundle_id?: string
    bundle_id?: string
    items: DeliveryGroupItem[]
    total_price: number
    total_quantity: number
    delivery_fee: number
    delivery_extra_fee_jeju?: number
    delivery_extra_fee_remote?: number
    shipping_available?: boolean
}

export interface AppliedCouponSnapshot {
    coupon_id?: string
    coupon_template_id?: string
    name?: string
    discount_type?: number
    discount_value?: number
    actual_discount_amount?: number
    [key: string]: unknown
}

export interface OrderPreviewSummary {
    total_items: number
    total_quantity: number
    total_product_price: number
    total_delivery_fee: number
    total_delivery_extra_fee: number
    coupon_discount_amount: number
    applied_coupons: AppliedCouponSnapshot[]
    point_use_amount: number
    point_max_usable: number
    point_balance_after: number
    total_order_price: number
}

export interface OrderPreviewUnavailableItem {
    cart_item_id?: string
    product_id: string
    product_name?: string
    reason?: string
}

export interface OrderPreviewResponse {
    cart_id?: string
    user_id?: string
    delivery_groups: DeliveryGroup[]
    summary: OrderPreviewSummary
    unavailable_items?: OrderPreviewUnavailableItem[]
}
