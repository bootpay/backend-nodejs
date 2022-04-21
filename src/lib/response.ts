export interface AccessTokenResponseParameters {
    expire_in: number
    access_token: string
}

export interface ReceiptResponseParameters {
    receipt_id: string
    order_id: string
    price: number
    tax_free: number
    cancelled_price: number
    cancelled_tax_free: number
    order_name: string
    company_name: string
    gateway_url: string
    metadata: string
    sandbox: boolean
    pg: string
    method: string
    method_origin: string
    purchased_at?: Date
    requested_at: Date
    cancelled_at?: Date
    escrow_status?: string
    status: number
    card_data?: CardData,
    phone_data?: PhoneData,
    bank_data?: BankData
    vbank_data?: BankData
}

export interface ExtraModel {
    subscribe_test_payment: boolean
}

export interface UserModel {
    id: string
    username: string
    phone: string
    email: string
}

export interface ItemModel {
    id: string
    name: string
    qty: number
    price: number
}

export interface BillingData {
    card_no: string
    card_company: string
    card_company_code: string
    card_type: string
    card_hash: string
}

export interface CardData {
    tid: string
    card_approve_no: string
    card_no: string
    card_quota: string
    card_company_code: string
    card_company: string
    card_interest: string
    receipt_url: string
    card_type?: string
    card_owner_type?: string
    point?: number
}

export interface PhoneData {
    tid: string
    auth_no?: string
    phone?: string
}

export interface BankData {
    tid: string
    bank_code: string
    bank_name: string
    back_username: string
    bank_account?: string
    sender_name?: string
    expired_at?: Date
    cash_receipt_tid?: string
    cash_receipt_type?: string
    cash_receipt_no?: string
}

export interface CancelPaymentParameters {
    receipt_id: string
    cancel_price?: number
    cancel_tax_free?: number
    cancel_id?: string
    cancel_username?: string
    cancel_message?: string
    refund: Refund
}

export interface Refund {
    bank_account: string
    back_username: string
    bank_code: string
}

export interface CertificateResponseParameters {
    receipt_id: string
    authenticate_id: string
    authenticated_at: Date
    status: number
    authenticate_data: AuthenticateData
}

export interface AuthenticateData {
    phone?: string
    unique: string
    birth: Date
    gender: number
    foreigner?: number
    carrier?: string
    tid: string
}

export interface SubscriptionBillingRequestParameters {
    pg: string
    method?: string
    order_name: string
    subscription_id: string
    card_no: string
    card_pw: string
    card_identity_no: string
    card_expire_year: string
    card_expire_month: string
    price: number
    tax_free: number
    extra: ExtraModel
    user: UserModel
    metadata: object
}

export interface SubscriptionBillingResponseParameters {
    billing_key: string
    billing_data: BillingData
    receipt_id: string
    subscription_id: string
    metadata: object
    pg: string
    method: string
    published_at: Date
    requested_at: Date
    receipt_Data: ReceiptResponseParameters
    billing_expire_at: Date
}

export interface SubscriptionCardPaymentRequestParameters {
    billing_key: string
    order_name: string
    price: number
    tax_free: number
    card_quota?: string
    card_interest?: string
    order_id: string
    items?: Array<ItemModel>
    user?: UserModel
    extra?: ExtraModel
}

export interface DestroySubscribeResponseParameters {
    billing_key: string
}

export interface UserTokenRequestParameters {
    user_id: string
    email?: string
    username?: string
    gender?: number
    birth?: string
    phone?: string
}

export interface UserTokenResponseParameters {
    user_token: string
    expired_at: Date
}

export interface SubscribePaymentReserveParameters {
    billing_key: string
    order_name: string
    price: number
    tax_free?: number
    user?: UserModel
    items?: ItemModel
    reserve_execute_at: string
}

export interface SubscribePaymentReserveResponse {
    reserve_id: string
    reserve_execute_at: string
}

export interface CancelSubscribeReserveResponse {
    reserve_id: string
    success: boolean
}