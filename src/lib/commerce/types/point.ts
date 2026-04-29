export interface PointBalance {
    available_balance?: number
    total_earned?: number
    total_used?: number
    is_negative?: boolean
}

export interface PointTransaction {
    transaction_id?: string
    transaction_type?: number
    amount?: number
    balance_after?: number
    reason?: string
    type?: number
    order_id?: string | null
    review_id?: string | null
    earned_at?: string | null
    expires_at?: string | null
    expired?: boolean
    remaining_balance?: number
    created_at?: string | null
}

export interface PointTransactionsResponse {
    transactions: PointTransaction[]
    total_count: number
    page: number
    limit: number
    total_pages: number
}

export interface PointTransactionsParams {
    page?: number
    limit?: number
    transaction_type?: number
}

export interface PointPreviewUsageParams {
    amount: number
    order_total: number
}

export interface PointPreviewUsageResponse {
    current_balance?: number
    use_amount?: number
    balance_after?: number
    order_total?: number
    payment_amount?: number
    is_valid?: boolean
}

export interface PointCalculateLimitParams {
    order_total: number
}

export interface PointCalculateLimitResponse {
    max_usable?: number
    available_balance?: number
    order_total?: number
    max_rate?: number | null
    min_usage?: number
    reason?: string
}
