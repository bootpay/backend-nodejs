import { BootpayCommerceResource, CommerceConfiguration, BootpayCommerceResponse } from './lib/commerce-resource'
import { UserModule } from './lib/commerce/modules/user'
import { UserGroupModule } from './lib/commerce/modules/user-group'
import { ProductModule } from './lib/commerce/modules/product'
import { InvoiceModule } from './lib/commerce/modules/invoice'
import { OrderModule } from './lib/commerce/modules/order'
import { OrderCancelModule } from './lib/commerce/modules/order-cancel'
import { OrderSubscriptionModule } from './lib/commerce/modules/order-subscription'
import { OrderSubscriptionBillModule } from './lib/commerce/modules/order-subscription-bill'
import { OrderSubscriptionAdjustmentModule } from './lib/commerce/modules/order-subscription-adjustment'
import { OrderSubscriptionRequestModule } from './lib/commerce/modules/order-subscription-request'
import { CategoryModule } from './lib/commerce/modules/category'
import { CouponModule } from './lib/commerce/modules/coupon'
import { PointModule } from './lib/commerce/modules/point'
import { CartModule } from './lib/commerce/modules/cart'
import { StoreModule } from './lib/commerce/modules/store'
import { MallSettingModule } from './lib/commerce/modules/mall-setting'

export interface CommerceTokenResponse {
    access_token: string
    expired_at?: string
}

export class BootpayCommerce extends BootpayCommerceResource {
    public user!: UserModule
    public userGroup!: UserGroupModule
    public product!: ProductModule
    public invoice!: InvoiceModule
    public order!: OrderModule
    public orderCancel!: OrderCancelModule
    public orderSubscription!: OrderSubscriptionModule
    public orderSubscriptionBill!: OrderSubscriptionBillModule
    public orderSubscriptionAdjustment!: OrderSubscriptionAdjustmentModule
    public orderSubscriptionRequest!: OrderSubscriptionRequestModule
    public category!: CategoryModule
    public coupon!: CouponModule
    public point!: PointModule
    public cart!: CartModule
    public store!: StoreModule
    public mallSetting!: MallSettingModule

    constructor(configuration?: CommerceConfiguration) {
        super()
        if (configuration) {
            this.setConfiguration(configuration)
        }
        this.initModules()
    }

    private initModules(): void {
        this.user = new UserModule(this)
        this.userGroup = new UserGroupModule(this)
        this.product = new ProductModule(this)
        this.invoice = new InvoiceModule(this)
        this.order = new OrderModule(this)
        this.orderCancel = new OrderCancelModule(this)
        this.orderSubscription = new OrderSubscriptionModule(this)
        this.orderSubscriptionBill = new OrderSubscriptionBillModule(this)
        this.orderSubscriptionAdjustment = new OrderSubscriptionAdjustmentModule(this)
        this.orderSubscriptionRequest = new OrderSubscriptionRequestModule(this)
        this.category = new CategoryModule(this)
        this.coupon = new CouponModule(this)
        this.point = new PointModule(this)
        this.cart = new CartModule(this)
        this.store = new StoreModule(this)
        this.mallSetting = new MallSettingModule(this)
    }

    /**
     * 액세스 토큰 발급
     * client_key/secret_key로 인증
     */
    async getAccessToken(): Promise<any> {
        try {
            const { client_key, secret_key } = this.commerceConfiguration

            const response: any = await this.postWithBasicAuth<CommerceTokenResponse>('request/token', {
                client_key,
                secret_key
            })

            if (response?.access_token) {
                this.setToken(response.access_token)
            }

            return response
        } catch (e: any) {
            return Promise.reject(e)
        }
    }

    /**
     * 토큰을 발급받아 설정합니다. (메서드 체이닝 지원)
     */
    async withToken(): Promise<BootpayCommerce> {
        await this.getAccessToken()
        return this
    }

    /**
     * 현재 설정된 토큰을 반환합니다.
     */
    getCurrentToken(): string | undefined {
        return this.getToken()
    }

    /**
     * 토큰이 설정되어 있는지 확인합니다.
     */
    hasToken(): boolean {
        const token = this.getToken()
        return token !== undefined && token !== ''
    }

    /**
     * 현재 role을 설정합니다. (메서드 체이닝 지원)
     * @param role 설정할 role
     */
    withRole(role: string): BootpayCommerce {
        this.setRole(role)
        return this
    }

    /**
     * 일반 사용자 role로 설정합니다.
     */
    asUser(): BootpayCommerce {
        return this.withRole('user')
    }

    /**
     * 매니저 role로 설정합니다.
     */
    asManager(): BootpayCommerce {
        return this.withRole('manager')
    }

    /**
     * 파트너 role로 설정합니다.
     */
    asPartner(): BootpayCommerce {
        return this.withRole('partner')
    }

    /**
     * 벤더 role로 설정합니다.
     */
    asVendor(): BootpayCommerce {
        return this.withRole('vendor')
    }

    /**
     * 슈퍼바이저 role로 설정합니다.
     */
    asSupervisor(): BootpayCommerce {
        return this.withRole('supervisor')
    }

    /**
     * 현재 role을 반환합니다.
     */
    getCurrentRole(): string {
        return this.getRole()
    }

    /**
     * role을 기본값(user)으로 초기화합니다.
     */
    clearRole(): BootpayCommerce {
        this.setRole('user')
        return this
    }
}

export { BootpayCommerceResource, CommerceConfiguration, BootpayCommerceResponse }
export * from './lib/commerce/types'
export * from './lib/commerce/modules'
