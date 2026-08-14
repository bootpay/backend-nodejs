import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceProduct, ProductListParams, MallProductListParams, ProductStatusParams } from '../types'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

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
     * 상품 목록 조회 (V1 Mall API)
     * GET /v1/products
     * page/limit 은 미지정시 각각 1 / 20 이 적용되고, 나머지 값은 지정된 것만 전송한다.
     * @param params 조회 파라미터
     */
    async products(params?: MallProductListParams): Promise<BootpayCommerceResponse<{ items: CommerceProduct[]; total: number }>> {
        const { user_jwt, idempotency_key, ...rest } = params || {}
        const queryParams = new URLSearchParams()
        queryParams.append('page', (rest.page === undefined ? 1 : rest.page).toString())
        queryParams.append('limit', (rest.limit === undefined ? 20 : rest.limit).toString())
        if (rest.category_id) queryParams.append('category_id', rest.category_id)
        if (rest.sort) queryParams.append('sort', rest.sort)
        if (rest.keyword) queryParams.append('keyword', rest.keyword)
        if (rest.type !== undefined) queryParams.append('type', rest.type.toString())
        if (rest.period_type) queryParams.append('period_type', rest.period_type)
        if (rest.s_at) queryParams.append('s_at', rest.s_at)
        if (rest.e_at) queryParams.append('e_at', rest.e_at)
        if (rest.category_code) queryParams.append('category_code', rest.category_code)

        return this.bootpay.get<{ items: CommerceProduct[]; total: number }>(`products?${queryParams.toString()}`, {
            headers: this.mallHeaders(user_jwt, idempotency_key)
        })
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
                Authorization: this.bootpay.authorizationHeader(),
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
     * 상품 상세 조회 (V1 Mall API)
     * GET /v1/products/{product_id}
     * @param productId 상품 ID
     * @param userJwt 회원 JWT (선택)
     * @param idempotencyKey 미지정시 자동 생성
     */
    async productDetail(
        productId: string,
        userJwt?: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceProduct>> {
        return this.bootpay.get<CommerceProduct>(`products/${productId}`, {
            headers: this.mallHeaders(userJwt, idempotencyKey)
        })
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

    /**
     * V1 Mall API 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성되고, Bootpay-User-JWT 는 값이 있을 때만 붙는다.
     */
    private mallHeaders(userJwt?: string, idempotencyKey?: string): Record<string, string> {
        const headers: Record<string, string> = {
            'Idempotency-Key': idempotencyKey || randomUUID()
        }
        if (userJwt !== undefined && userJwt !== null && userJwt !== '') {
            headers['Bootpay-User-JWT'] = userJwt
        }
        return headers
    }
}
