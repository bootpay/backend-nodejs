import { BootpayBackendNodejsResource } from './lib/resource'
import {
    AccessTokenResponseParameters,
    CancelPaymentParameters,
    CertificateResponseParameters,
    DestroySubscribeResponseParameters,
    ReceiptResponseParameters,
    SubscriptionBillingRequestParameters,
    SubscriptionBillingResponseParameters,
    SubscriptionCardPaymentRequestParameters,
    UserTokenRequestParameters,
    UserTokenResponseParameters,
    SubscribePaymentReserveParameters,
    SubscribePaymentReserveResponse,
    CancelSubscribeReserveResponse,
    ShippingRequestParameters,
    CashReceiptPublishOnReceiptParameters,
    CashReceiptCancelOnReceiptParameters,
    RequestCashReceiptParameters,
    CancelCashReceiptParameters,
    RequestAuthenticateParameters,
    AuthenticateData,
    SubscribeLookupResponse
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
     * SubscribeReserve Lookup
     * Comment by GOSOMI
     * @date: 2023-03-07
     * @param reserveId: string
     * @returns Promise<SubscribeLookupResponse>
     */
    async subscribeReserveLookup(reserveId: string) {
        try {
            const response: SubscribeLookupResponse = await this.get<SubscribeLookupResponse>(`subscribe/payment/reserve/${ reserveId }`)
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

    /**
     * 배송시작 REST API 시작
     * Comment by GOSOMI
     * @date: 2022-06-14
     */
    async shippingStart(shippingRequest: ShippingRequestParameters): Promise<ReceiptResponseParameters | any> {
        try {
            const response: ReceiptResponseParameters = await this.put<ReceiptResponseParameters>(`escrow/shipping/start/${ shippingRequest.receipt_id }`, shippingRequest)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 기존결제 현금영수증 발행 API
     * Comment by GOSOMI
     * @date: 2022-07-28
     */
    async cashReceiptPublishOnReceipt(cashReceiptPublishRequest: CashReceiptPublishOnReceiptParameters) {
        try {
            const response: ReceiptResponseParameters = await this.post<ReceiptResponseParameters>('request/receipt/cash/publish', cashReceiptPublishRequest)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 기존 결제 현금영수증 발행 취소 API
     * Comment by GOSOMI
     * @date: 2022-08-09
     */
    async cashReceiptCancelOnReceipt(cashReceiptCancelRequest: CashReceiptCancelOnReceiptParameters) {
        try {
            const response: null = await this.delete<null>(`request/receipt/cash/cancel/${ cashReceiptCancelRequest.receipt_id }`, {
                params: cashReceiptCancelRequest
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 별건 현금영수증 발행하기
     * Comment by GOSOMI
     * @date: 2022-08-09
     */
    async requestCashReceipt(cashReceiptRequest: RequestCashReceiptParameters) {
        try {
            const response: ReceiptResponseParameters = await this.post<ReceiptResponseParameters>('request/cash/receipt', cashReceiptRequest)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 별건 현금영수증 취소하기
     * Comment by GOSOMI
     * @date: 2022-08-09
     */
    async cancelCashReceipt(cancelCashReceiptRequest: CancelCashReceiptParameters) {
        try {
            const response: ReceiptResponseParameters = await this.delete<ReceiptResponseParameters>(`request/cash/receipt/${ cancelCashReceiptRequest.receipt_id }`, {
                params: cancelCashReceiptRequest
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 본인인증 REST API 요청
     * Comment by GOSOMI
     * @date: 2022-11-07
     */
    async requestAuthentication(authenticateRequest: RequestAuthenticateParameters) {
        try {
            const response: CertificateResponseParameters = await this.post<CertificateResponseParameters>('request/authentication', authenticateRequest)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 본인인증 승인하기
     * Comment by GOSOMI
     * @date: 2022-11-07
     */
    async confirmAuthentication(receipt_id: string, otp: null | string = null) {
        try {
            const response: CertificateResponseParameters = await this.post<CertificateResponseParameters>('authenticate/confirm', {
                receipt_id,
                otp
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 본인인증 SMS 재전송
     * Comment by GOSOMI
     * @date: 2022-11-07
     */
    async realarmAuthentication(receipt_id: string) {
        try {
            const response: CertificateResponseParameters = await this.post<CertificateResponseParameters>('authenticate/realarm', {
                receipt_id
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}

const Bootpay: BootpayBackendNodejs = new BootpayBackendNodejs()

export { Bootpay }

export default Bootpay
