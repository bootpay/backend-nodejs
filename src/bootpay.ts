import { BootpayBackendNodejsResource } from './lib/resource'
import {
    AccessTokenResponseParameters,
    CancelPaymentParameters,
    CertificateResponseParameters,
    DestroySubscribeResponseParameters,
    ReceiptResponseParameters,
    SubscriptionBillingRequestParameters,
    SubscriptionBillingResponseParameters,
    SubscriptionCardPaymentRequestParameters, UserTokenRequestParameters, UserTokenResponseParameters,
    SubscribePaymentReserveParameters,
    SubscribePaymentReserveResponse,
    CancelSubscribeReserveResponse
} from './lib/response'

class BootpayBackendNodejs extends BootpayBackendNodejsResource {
    constructor() {
        super()
    }

    /**
     * Get Access Token
     * Comment by GOSOMI
     * @returns Promise<AccessTokenResponseParameters>
     */
    async getAccessToken(): Promise<AccessTokenResponseParameters> {
        try {
            const { application_id, private_key } = this.bootpayConfiguration
            const response: AccessTokenResponseParameters = await this.post<AccessTokenResponseParameters>('request/token', {
                application_id,
                private_key
            })
            // set Token
            this.setToken(response.access_token)
            return Promise.resolve(response)
        } catch (e: any) {
            return Promise.reject(e)
        }
    }

    /**
     * Lookup Receipt
     * Comment by GOSOMI
     * @param receiptId: string
     */
    async receiptPayment(receiptId: string): Promise<ReceiptResponseParameters> {
        try {
            const response: ReceiptResponseParameters = await this.get<ReceiptResponseParameters>(`receipt/${ receiptId }`)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * Cancel Payment
     * Comment by GOSOMI
     * @param cancelPayment: CancelPaymentParameters
     * @returns Promise<CancelPaymentParameters>
     */
    async cancelPayment(cancelPayment: CancelPaymentParameters): Promise<ReceiptResponseParameters> {
        try {
            const response: ReceiptResponseParameters = await this.post<ReceiptResponseParameters>('cancel', {
                ...cancelPayment
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * Lookup Certificate Data
     * Comment by GOSOMI
     * @param receiptId: string
     * @returns Promise<CertificateResponseParameters>
     */
    async certificate(receiptId: string): Promise<CertificateResponseParameters> {
        try {
            const response: CertificateResponseParameters = await this.get<CertificateResponseParameters>(`certificate/${ receiptId }`)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * ConfirmPayment
     * Comment by GOSOMI
     * @param receiptId: string
     * @returns Promise<ReceiptResponseParameters>
     */
    async confirmPayment(receiptId: string): Promise<ReceiptResponseParameters> {
        try {
            const response: ReceiptResponseParameters = await this.post<ReceiptResponseParameters>('confirm', {
                receipt_id: receiptId
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * lookupSubscribeBillingKey
     * Comment by GOSOMI
     * @param receiptId: string
     * @returns Promise<SubscriptionBillingResponseParameters>
     */
    async lookupSubscribeBillingKey(receiptId: string): Promise<SubscriptionBillingResponseParameters> {
        try {
            const response: SubscriptionBillingResponseParameters = await this.get<SubscriptionBillingResponseParameters>(`subscribe/billing_key/${ receiptId }`)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * requestSubscribeBillingKey
     * Comment by GOSOMI
     * @param subscriptionBillingRequest: SubscriptionBillingRequestParameters
     * @returns Promise<SubscriptionBillingResponseParameters>
     */
    async requestSubscribeBillingKey(subscriptionBillingRequest: SubscriptionBillingRequestParameters): Promise<SubscriptionBillingResponseParameters> {
        try {
            const response: SubscriptionBillingResponseParameters = await this.post<SubscriptionBillingResponseParameters>('request/subscribe', {
                ...subscriptionBillingRequest
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * requestSubscribeCardPayment
     * Comment by GOSOMI
     * @param subscriptionCardRequest: SubscriptionCardPaymentRequestParameters
     * @returns Promise<ReceiptResponseParameters>
     */
    async requestSubscribeCardPayment(subscriptionCardRequest: SubscriptionCardPaymentRequestParameters): Promise<ReceiptResponseParameters> {
        try {
            const response: ReceiptResponseParameters = await this.post<ReceiptResponseParameters>('subscribe/payment', {
                ...subscriptionCardRequest
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * destroyBillingKey
     * Comment by GOSOMI
     * @param billingKey:string
     * @returns Promise<DestroySubscribeResponseParameters>
     */
    async destroyBillingKey(billingKey: string): Promise<DestroySubscribeResponseParameters> {
        try {
            const response: DestroySubscribeResponseParameters = await this.delete<DestroySubscribeResponseParameters>(`subscribe/billing_key/${ billingKey }`)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * requestUserToken
     * Comment by GOSOMI
     * @param userTokenRequest:UserTokenRequestParameters
     * @returns Promise<UserTokenResponseParameters>
     */
    async requestUserToken(userTokenRequest: UserTokenRequestParameters): Promise<UserTokenResponseParameters> {
        try {
            const response: UserTokenResponseParameters = await this.post<UserTokenResponseParameters>('request/user/token', {
                ...userTokenRequest
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * subscribePaymentReserve
     * Comment by GOSOMI
     * @param subscribePaymentReserveRequest:SubscribePaymentReserveParameters
     * @returns Promise<SubscribePaymentReserveResponse>
     */
    async subscribePaymentReserve(subscribePaymentReserveRequest: SubscribePaymentReserveParameters) {
        try {
            const response: SubscribePaymentReserveResponse = await this.post<SubscribePaymentReserveResponse>('subscribe/payment/reserve', {
                ...subscribePaymentReserveRequest
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * cancelSubscribeReserve
     * Comment by GOSOMI
     * @param reserveId:string
     * @returns Promise<CancelSubscribeReserveResponse>
     */
    async cancelSubscribeReserve(reserveId: string) {
        try {
            const response: CancelSubscribeReserveResponse = await this.delete<CancelSubscribeReserveResponse>(`subscribe/payment/reserve/${ reserveId }`)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}

export const Bootpay: BootpayBackendNodejs = new BootpayBackendNodejs()