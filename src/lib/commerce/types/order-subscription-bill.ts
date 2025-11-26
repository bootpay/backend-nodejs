import { ListParams } from './common'

export interface CommerceOrderSubscriptionBill {
    order_subscription_bill_id?: string
    order_subscription_id?: string
    user_id?: string
    user_group_id?: string

    subscription_billing_type?: number
    order_name?: string
    paid_wallet_id?: string
    reserved_wallet_id?: string

    order_number?: string
    order_pre_id?: string
    order_id?: string
    duration?: number
    total_subscription_duration?: number

    one_unit_price?: number
    one_unit_tax_free_price?: number
    setup_price?: number

    price?: number
    tax_free_price?: number
    unit?: number

    purchase_price?: number
    purchase_tax_free_price?: number

    cancelled_price?: number
    cancelled_tax_free_price?: number
    cancelled_fee?: number

    membership_type?: number

    address_id?: string
    user_address?: string
    username?: string
    user_phone?: string
    user_email?: string
    user_company_name?: string
    user_business_number?: string

    product_ids?: string[]
    product_option_ids?: string[]
    product_snapshot_ids?: string[]
    product_option_snapshot_ids?: string[]
    product_type?: number
    quantity?: number

    reserve_payment_at?: string
    purchased_at?: string
    revoked_at?: string
    last_error_at?: string

    status?: number
    cancel_status?: number
    test_code?: string

    service_start_at?: string
    service_end_at?: string
}

export interface OrderSubscriptionBillListParams extends ListParams {
    order_subscription_id?: string
    status?: number[]
}
