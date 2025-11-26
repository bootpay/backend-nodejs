// Common Types for Commerce API

export interface ListParams {
    page?: number
    limit?: number
    keyword?: string
}

export interface CommerceAddress {
    address_id?: string
    zipcode?: string
    addr1?: string
    addr2?: string
    phone?: string
    name?: string
    memo?: string
    is_default?: boolean
}

export interface CommerceAddressInstruction {
    instruction_type?: number
    instruction?: string
}
