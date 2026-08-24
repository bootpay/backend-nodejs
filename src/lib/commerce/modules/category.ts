import { randomUUID } from 'crypto'
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
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async create(params: CategoryCreateParams): Promise<BootpayCommerceResponse<CommerceCategory>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceCategory>('categories', payload, {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 카테고리 수정
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async update(params: CategoryUpdateParams): Promise<BootpayCommerceResponse<CommerceCategory>> {
        const { category_id, idempotency_key, ...rest } = params
        return this.bootpay.put<CommerceCategory>(`categories/${category_id}`, rest, {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 카테고리 삭제
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async destroy(categoryId: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`categories/${categoryId}`, {
            headers: this.supervisorHeaders(idempotencyKey)
        })
    }

    /**
     * 카테고리 쓰기(등록/수정/삭제) 요청 헤더 — 서버가 supervisor scope 를 요구한다.
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }
}
