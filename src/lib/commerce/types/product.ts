import { ListParams } from './common'

export interface CommerceProduct {
    product_id?: string
    category_id?: string
    project_id?: string
    seller_id?: string
    subscription_setting_id?: string
    delivery_shipping_id?: string
    brand_id?: string
    manufacturer_id?: string

    ex_uid?: string

    name?: string
    description?: string
    images?: string[]
    type?: number
    tax_type?: number
    use_stock?: boolean
    stock?: number
    use_option_stock?: boolean
    use_stock_safe?: boolean
    stock_safe?: number

    display_price?: number
    tax_free_price?: number
    use_discount?: boolean
    discount_price?: number
    discount_price_type?: number
    use_discount_period?: boolean
    discount_start_at?: string
    discount_end_at?: string

    use_accumulation?: boolean
    accumulation_point?: number
    accumulation_point_type?: number

    status_display?: boolean
    use_display_period?: boolean
    display_start_at?: string
    display_end_at?: string
    status_sale?: boolean
    use_sale_period?: boolean
    sale_start_at?: string
    sale_end_at?: string

    count_sale?: number
    count_qna?: number
    count_like?: number
    count_review?: number

    barcode?: string
    sku?: string
    search_tags?: string[]
    event_tags?: string[]
    target_user_tags?: string[]
    delivery_tags?: string[]
    emotion_tags?: string[]

    use_coupon?: boolean
    use_minor?: boolean
    use_free_gift?: boolean
    free_gift?: string

    use_bulk_purchase_discount?: boolean
    bulk_purchase_discount?: Record<string, any>

    use_review_point?: boolean
    review_point?: Record<string, any>

    use_seo?: boolean
    seo_page_title?: string
    seo_meta_description?: string
    seo_meta_tags?: string[]

    model_id?: string
    model_name?: string
    manufacturer_name?: string
    brand_name?: string
    origin_code?: string
    origin_name?: string
    importer?: string

    used?: boolean
    expired_at?: string
    manufactured_at?: string

    use_setup_fee?: boolean
    setup_fee_value?: number
    setup_fee_type?: number
    setup_fee_name?: string
    setup_fee_text?: string

    use_delivery_shipping?: boolean
    delivery_shipping_fee_type?: number
    use_overseas_shipping?: boolean
    use_delivery_shipping_bundle?: boolean
    delivery_shipping_bundle_id?: string

    use_subscription?: boolean
    use_subscription_times?: boolean
    use_product_price?: boolean

    use_cancel?: boolean
    use_able_refund?: boolean
    use_able_cart?: boolean

    created_at?: string
    updated_at?: string

    options?: CommerceProductOption[]
    subscription_setting?: CommerceSubscriptionSetting
}

export interface CommerceProductOption {
    option_id?: string
    name?: string
    price?: number
    stock?: number
}

export interface CommerceSubscriptionSetting {
    subscription_setting_id?: string
    period_type?: string
    period_value?: number
    billing_day?: number
    billing_count?: number
}

export interface ProductListParams extends ListParams {
    type?: number
    period_type?: string
    s_at?: string
    e_at?: string
    category_code?: string
}

/**
 * 상품 목록 조회 파라미터 (V1 Mall API)
 * GET /v1/products
 */
export interface MallProductListParams extends ProductListParams {
    category_id?: string
    sort?: string
    user_jwt?: string
    idempotency_key?: string
}

export interface ProductStatusParams {
    product_id: string
    status: number
    status_display?: boolean
    status_sale?: boolean
}
