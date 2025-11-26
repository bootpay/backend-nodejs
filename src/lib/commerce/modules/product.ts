import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceProduct, ProductListParams, ProductStatusParams } from '../types'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

export class ProductModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 상품 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: ProductListParams): Promise<BootpayCommerceResponse<{ items: CommerceProduct[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
            if (params.type !== undefined) queryParams.append('type', params.type.toString())
            if (params.period_type) queryParams.append('period_type', params.period_type)
            if (params.s_at) queryParams.append('s_at', params.s_at)
            if (params.e_at) queryParams.append('e_at', params.e_at)
            if (params.category_code) queryParams.append('category_code', params.category_code)
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceProduct[]; total: number }>(`products${query ? `?${query}` : ''}`)
    }

    /**
     * 상품 생성 (이미지 포함)
     * @param product 상품 정보
     * @param imagePaths 이미지 파일 경로 배열
     */
    async create(product: CommerceProduct, imagePaths?: string[]): Promise<BootpayCommerceResponse<CommerceProduct>> {
        const formData = new FormData()

        // 상품 정보를 JSON으로 변환하여 추가
        Object.entries(product).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, String(value))
                }
            }
        })

        // 이미지 파일 추가
        if (imagePaths && imagePaths.length > 0) {
            for (const imagePath of imagePaths) {
                const fileName = path.basename(imagePath)
                formData.append('images', fs.createReadStream(imagePath), fileName)
            }
        }

        const mode = this.bootpay.commerceConfiguration.mode || 'production'
        const url = `${this.bootpay.API_ENTRYPOINTS[mode]}/products`

        return this.bootpay.$http.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${this.bootpay.getToken()}`,
                'BOOTPAY-ROLE': this.bootpay.getRole() || 'user'
            }
        })
    }

    /**
     * 상품 상세 조회
     * @param productId 상품 ID
     */
    async detail(productId: string): Promise<BootpayCommerceResponse<CommerceProduct>> {
        return this.bootpay.get<CommerceProduct>(`products/${productId}`)
    }

    /**
     * 상품 수정
     * @param product 상품 정보
     */
    async update(product: CommerceProduct): Promise<BootpayCommerceResponse<CommerceProduct>> {
        if (!product.product_id) {
            return Promise.reject({ success: false, error: 'product_id is required' })
        }
        return this.bootpay.put<CommerceProduct>(`products/${product.product_id}`, product)
    }

    /**
     * 상품 상태 변경
     * @param params 상태 변경 파라미터
     */
    async status(params: ProductStatusParams): Promise<BootpayCommerceResponse<CommerceProduct>> {
        if (!params.product_id) {
            return Promise.reject({ success: false, error: 'product_id is required' })
        }
        return this.bootpay.put<CommerceProduct>(`products/${params.product_id}/status`, params)
    }

    /**
     * 상품 삭제
     * @param productId 상품 ID
     */
    async delete(productId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`products/${productId}`)
    }
}
