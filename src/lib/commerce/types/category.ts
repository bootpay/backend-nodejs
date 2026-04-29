export interface CommerceCategory {
    category_id?: string
    seller_id?: string
    project_id?: string
    name?: string
    parent_category_id?: string | null
    parent_categories?: string[]
    status_display?: boolean
    status_best?: boolean
    filter_color?: number
    filter_size?: number
    idx?: number
    created_at?: string
    updated_at?: string
}

export interface CategoryCreateParams {
    name: string
    parent_category_id?: string
    status_display?: boolean
    status_best?: boolean
    filter_color?: number
    filter_size?: number
}

export interface CategoryUpdateParams {
    category_id: string
    name?: string
    parent_category_id?: string
    status_display?: boolean
    status_best?: boolean
    filter_color?: number
    filter_size?: number
}
