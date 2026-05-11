export interface CommerceCoupon {
    coupon_id?: string
    coupon_template_id?: string
    user_id?: string
    project_id?: string
    name?: string
    discount_type?: number
    discount_value?: number
    min_order_amount?: number
    max_discount_amount?: number
    status?: number
    issued_at?: string
    used_at?: string | null
    expires_at?: string | null
    created_at?: string
}

export interface CouponListParams {
    status?: string
    page?: number
    limit?: number
}

export interface CouponDownloadParams {
    coupon_template_id: string
}
