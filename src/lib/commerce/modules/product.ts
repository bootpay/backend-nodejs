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
     * GET /v1/products
     *
     * ⚠️ 서버(v1/products_controller#index)가 읽는 것은
     *    page · limit · keyword · category_id · ex_uid · sort **뿐**이다.
     *    type / period_type / s_at / e_at / category_code 는 보내도 에러 없이 무시되고
     *    전체 목록이 돌아온다 (하위호환을 위해 전송 자체는 유지한다).
     *    keyword 는 26-08-26 서버 변경부터 적용된다 — 그 이전 배포본에서는 무시된다.
     * @param params 조회 파라미터
     */
    async list(params?: ProductListParams): Promise<BootpayCommerceResponse<{ items: CommerceProduct[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
            if (params.category_id) queryParams.append('category_id', params.category_id)
            if (params.ex_uid) queryParams.append('ex_uid', params.ex_uid)
            if (params.sort) queryParams.append('sort', params.sort)
            // 아래 4개는 서버가 읽지 않는다 — 기존 호출을 깨지 않으려고 전송만 유지한다
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
     * ⚠️ keyword 는 서버(v1/products_controller#index)가 읽지 않는다 — page/limit/category_id/ex_uid/sort 만 사용하며
     *    keyword 를 보내도 조용히 무시된다. 하위호환 때문에 인자는 남겨두되, 검색이 필요하면 서버 지원이 선행되어야 한다.
     * @param params 조회 파라미터
     */
    async products(params?: MallProductListParams): Promise<BootpayCommerceResponse<{ items: CommerceProduct[]; total: number }>> {
        const { user_jwt, idempotency_key, ...rest } = params || {}
        const queryParams = new URLSearchParams()
        queryParams.append('page', (rest.page === undefined ? 1 : rest.page).toString())
        queryParams.append('limit', (rest.limit === undefined ? 20 : rest.limit).toString())
        if (rest.category_id) queryParams.append('category_id', rest.category_id)
        if (rest.ex_uid) queryParams.append('ex_uid', rest.ex_uid)
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
     * 상품 생성
     * POST /v1/products
     * imagePaths 가 있으면 multipart/form-data, 없으면 JSON 으로 보낸다.
     * @param product 상품 정보 (여기 명시되지 않은 값도 서버 _product_params 로 그대로 전달된다)
     * @param imagePaths 이미지 파일 경로 배열
     * @param idempotencyKey 미지정시 자동 생성
     */
    async create(
        product: CommerceProduct,
        imagePaths?: string[],
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceProduct>> {
        const payload = this.compact(product as Record<string, any>)
        const headers = this.managerHeaders(idempotencyKey)

        if (!imagePaths || imagePaths.length === 0) {
            return this.bootpay.post<CommerceProduct>('products', payload, { headers })
        }

        const formData = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
            formData.append(key, this.multipartValue(value))
        })

        // ⚠️ Rails 는 반복된 `images` 를 배열로 받지 않는다. images[0], images[1] ... 로 인덱싱해야 한다.
        imagePaths.forEach((imagePath, index) => {
            formData.append(`images[${index}]`, fs.createReadStream(imagePath), path.basename(imagePath))
        })

        return this.bootpay.postMultipart<CommerceProduct>('products', formData, { headers })
    }

    /**
     * 상품 상세 조회
     * GET /v1/products/{product_id}
     * productDetail 과 uri·동작이 같다. 중복이지만 기존 사용자가 있어 남겨둔다 — 신규 코드는 productDetail 을 쓸 것.
     * @param productId 상품 ID
     * @param userJwt 회원 JWT (선택) — 있으면 회원 컨텍스트로 조회한다
     * @param idempotencyKey 미지정시 자동 생성
     */
    async detail(
        productId: string,
        userJwt?: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceProduct>> {
        return this.bootpay.get<CommerceProduct>(`products/${productId}`, {
            headers: this.mallHeaders(userJwt, idempotencyKey)
        })
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
     * PUT /v1/products/{product_id}
     * 바뀐 값만 보내면 된다. ⚠️ category_id 는 키 존재 여부로 '해제 의사'를 판별하므로 주의.
     * @param product 상품 정보
     * @param idempotencyKey 미지정시 자동 생성
     */
    async update(product: CommerceProduct, idempotencyKey?: string): Promise<BootpayCommerceResponse<CommerceProduct>> {
        if (!product.product_id) {
            return Promise.reject({ success: false, error: 'product_id is required' })
        }
        return this.bootpay.put<CommerceProduct>(
            `products/${product.product_id}`,
            this.compact(product as Record<string, any>),
            { headers: this.managerHeaders(idempotencyKey) }
        )
    }

    /**
     * 상품 판매/노출 상태 변경
     * PUT /v1/products/{product_id}/status
     * ⚠️ 재고(stock)는 여기가 아니라 update 로 바꾼다.
     * @param params 상태 변경 파라미터
     */
    async status(params: ProductStatusParams): Promise<BootpayCommerceResponse<CommerceProduct>> {
        if (!params.product_id) {
            return Promise.reject({ success: false, error: 'product_id is required' })
        }
        const { product_id, idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceProduct>(`products/${product_id}/status`, this.compact(payload), {
            headers: this.managerHeaders(idempotency_key)
        })
    }

    /**
     * 상품 삭제
     * DELETE /v1/products/{product_id}
     * @param productId 상품 ID
     * @param idempotencyKey 미지정시 자동 생성
     */
    async delete(productId: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`products/${productId}`, {
            headers: this.managerHeaders(idempotencyKey)
        })
    }

    /**
     * 상품 쓰기(등록/수정/삭제/상태변경) 요청 헤더
     * 서버가 manager scope 를 요구한다.
     */
    private managerHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'manager'
        }
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작)
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
        )
    }

    /**
     * multipart form 값 정규화 — 배열/객체는 JSON, 나머지는 문자열로 보낸다.
     */
    private multipartValue(value: any): string {
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
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
