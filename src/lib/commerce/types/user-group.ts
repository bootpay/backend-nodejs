import { ListParams } from './common'

export interface CommerceUserGroup {
    user_group_id?: string
    seller_id?: string
    project_id?: string
    corporate_type?: number

    bank?: string
    bank_code?: string

    count?: number
    last_updated_at?: string
    status?: number

    phone?: string
    email?: string
    zipcode?: string
    address?: string
    address_detail?: string
    corporate_extension?: Record<string, any>
    auth_bank?: boolean

    company_name?: string
    business_number?: string
    registration_number?: string
    corporate_established?: string
    business_type?: string
    business_category?: string
    ceo_name?: string
    auth_company?: boolean

    manager_name?: string
    manager_phone?: string
    manager_email?: string

    personal_customs_clearance_code?: string

    point?: number
    accumulation?: number
    marketing_accept_type?: number
    marketing_accept_create_at?: string
    marketing_accept_update_at?: string

    use_subscription_aggregate_transaction?: boolean
    subscription_month_day?: number
    subscription_week_day?: number

    use_limit?: boolean
    purchase_limit?: number
    subscribed_limit?: number
    limit_message?: string
    external_uid?: string
    is_external?: string
}

// Constants
export const CORPORATE_TYPE_INDIVIDUAL = 1
export const CORPORATE_TYPE_CORPORATE = 2

export interface UserGroupListParams extends ListParams {
    corporate_type?: number
}

export interface UserGroupLimitParams {
    user_group_id: string
    use_limit?: boolean
    purchase_limit?: number
    subscribed_limit?: number
    limit_message?: string
}

export interface UserGroupAggregateTransactionParams {
    user_group_id: string
    use_subscription_aggregate_transaction?: boolean
    subscription_month_day?: number
    subscription_week_day?: number
}
