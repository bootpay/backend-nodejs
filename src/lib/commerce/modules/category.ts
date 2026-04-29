import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceCategory, CategoryCreateParams, CategoryUpdateParams } from '../types'

export class CategoryModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 카테고리 트리 조회
     */
    async list(): Promise<BootpayCommerceResponse<CommerceCategory[]>> {
        return this.bootpay.get<CommerceCategory[]>('categories')
    }

    /**
     * 카테고리 단건 조회
     */
    async detail(categoryId: string): Promise<BootpayCommerceResponse<CommerceCategory>> {
        return this.bootpay.get<CommerceCategory>(`categories/${categoryId}`)
    }

    /**
     * 카테고리 생성
     */
    async create(params: CategoryCreateParams): Promise<BootpayCommerceResponse<CommerceCategory>> {
        return this.bootpay.post<CommerceCategory>('categories', params)
    }

    /**
     * 카테고리 수정
     */
    async update(params: CategoryUpdateParams): Promise<BootpayCommerceResponse<CommerceCategory>> {
        const { category_id, ...rest } = params
        return this.bootpay.put<CommerceCategory>(`categories/${category_id}`, rest)
    }

    /**
     * 카테고리 삭제
     */
    async destroy(categoryId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`categories/${categoryId}`)
    }
}
