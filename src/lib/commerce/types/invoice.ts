import { ListParams } from './common'

// Constants
export const INVOICE_SEND_TYPE_SMS = 1
export const INVOICE_SEND_TYPE_KAKAO = 2
export const INVOICE_SEND_TYPE_EMAIL = 3
export const INVOICE_SEND_TYPE_PUSH = 4

export interface CommerceInvoice {
    invoice_id?: string
    project_id?: string
    seller_id?: string

    name?: string
    title?: string
    memo?: string
    product_name?: string

    created_owner_id?: string
    created_owner_type?: number

    unit?: number
    metadata?: Record<string, any>

    request_id?: string
    sku?: string

    use_redirect?: boolean
    redirect_url?: string

    type?: number
    parent_id?: string

    subscription_type?: number
    subscription_start_at?: string
    subscription_end_at?: string

    expired_at?: string
    status?: number
    deleted?: boolean

    user_collection_type?: number
    use_link_redirect?: boolean

    user_id?: string

    send_status?: number
    send_types?: number[]

    message_template_id?: string
    message_id?: string
    message_from?: string
    message_type?: number
    message_response?: string

    sent_at?: string
    pay_at?: string

    price?: number
    tax_free_price?: number

    use_editable_username?: boolean
    use_editable_phone?: boolean
    use_editable_email?: boolean
    use_memo?: boolean

    product_ids?: string[]
    product_option_ids?: string[]

    tags?: string[]

    password?: string
    order_id?: string
    uuid?: string

    webhook_url?: string
    header_content_type?: number
    webhook_retry_count?: number

    product_type?: number
    is_open_link?: boolean

    invoice_items?: CommerceInvoiceItem[]
    selected_users?: string[]
}

export interface CommerceInvoiceItem {
    invoice_item_id?: string
    name?: string
    price?: number
    qty?: number
    tax_free_price?: number
}

export interface InvoiceListParams extends ListParams {}

export interface InvoiceCreateParams {
    user_id?: string
    user_group_id?: string
    title: string
    name?: string
    description?: string
    price: number
    tax_free_price?: number
    expired_at?: string
    invoice_items?: CommerceInvoiceItem[]
    send_types?: number[]
    webhook_url?: string
    metadata?: Record<string, any>
}
