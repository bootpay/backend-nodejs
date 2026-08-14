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
    SubscribePaymentLookupResponse,
    SubscriptionBillingTransferRequestParameters,
    SubscriptionPaymentRequestParameters,
    WalletDataPart,
    WalletRequestParameters,
    WalletPaymentResponseParameters
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
            const { application_id, private_key, client_key, secret_key } = this.bootpayConfiguration
            const hasLegacyCredentials = application_id && private_key
            if ((client_key && !secret_key) || (!client_key && secret_key && !hasLegacyCredentials)) {
                return Promise.reject({
                    error_code: -101,
                    message: 'client_key/secret_key를 함께 입력해주세요.'
                })
            }
            // client_key/secret_key 인증은 매 요청 인터셉터가 Basic Auth 헤더를 직접 부착한다.
            // request/token 호출이 불필요하므로, 호환을 위해 합성 응답만 즉시 반환한다.
            if (client_key && secret_key) {
                return Promise.resolve({ access_token: '', expire_in: 0 })
            }
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
     * @param lookupUserData: boolean
     */
    async receiptPayment(receiptId: string, lookupUserData: boolean = false): Promise<ReceiptResponseParameters> {
        try {
            const response: ReceiptResponseParameters = await this.get<ReceiptResponseParameters>(`receipt/${ receiptId }?lookup_user_data=${ lookupUserData ? 'true' : 'false' }`)
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
     * lookupBillingKey
     * Comment by ehowlsla
     * @param billingKey: string
     * @returns Promise<SubscriptionBillingResponseParameters>
     */
    async lookupBillingKey(billingKey: string): Promise<SubscriptionBillingResponseParameters> {
        try {
            const response: SubscriptionBillingResponseParameters = await this.get<SubscriptionBillingResponseParameters>(`billing_key/${ billingKey }`)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * lookupSequentialBillingKey
     * 우선순위(순차) 결제 빌링키 조회
     * Comment by GOSOMI
     * @date: 2026-07-03
     * @param widgetKey: string
     * @param billingKey: string
     * @returns Promise<SubscriptionBillingResponseParameters>
     */
    async lookupSequentialBillingKey(widgetKey: string, billingKey: string): Promise<SubscriptionBillingResponseParameters> {
        try {
            const response: SubscriptionBillingResponseParameters = await this.get<SubscriptionBillingResponseParameters>(`subscribe/sequential_billing_key/${ billingKey }?widget_key=${ encodeURIComponent(widgetKey) }`)
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
     * requestSubscribePayment
     * Comment by ehowlsla
     * @param subscriptionRequest: SubscriptionPaymentRequestParameters
     * @returns Promise<ReceiptResponseParameters>
     */
    async requestSubscribePayment(subscriptionRequest: SubscriptionPaymentRequestParameters): Promise<ReceiptResponseParameters> {
        try {
            const response: ReceiptResponseParameters = await this.post<ReceiptResponseParameters>('subscribe/payment', {
                ...subscriptionRequest
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
    async subscribePaymentReserveLookup(reserveId: string) {
        try {
            const response: SubscribePaymentLookupResponse = await this.get<SubscribePaymentLookupResponse>(`subscribe/payment/reserve/${ reserveId }`)
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

    /**
     * 계좌 자동이체를 위한 빌링키 발급 요청
     * Comment by ehowlsla
     * @date: 2024-05-27
     */
    async requestSubscribeAutomaticTransferBillingKey(parameters: SubscriptionBillingTransferRequestParameters) {
        try {
            const response: ReceiptResponseParameters = await this.post<ReceiptResponseParameters>('request/subscribe/automatic-transfer', parameters)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 계좌 자동이체를 위한 출금 동의 확인 요청
     * Comment by ehowlsla
     * @date: 2024-05-27
     */
    async publishAutomaticTransferBillingKey(receipt_id: string) {
        try {
            const response: SubscriptionBillingResponseParameters = await this.post<SubscriptionBillingResponseParameters>('request/subscribe/automatic-transfer/publish', {
                "receipt_id": receipt_id
            })
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * 등록된 지갑 리스트 가져오기
     * Comment by ehowlsla
     * @date: 2025-03-16
     * @deprecated 다음 메이저 버전에서 제거 예정. wallet 엔드포인트는 폐기 예정이며, 결제는 Request::PaymentController#create 의 wallet_id + user_token 으로 처리됩니다.
     */
    async getUserWallets(user_id: string, sandbox: boolean): Promise<WalletDataPart[]> {
        try {
            const queryParams = new URLSearchParams({ user_id, sandbox: sandbox.toString() }).toString();
            const response: WalletDataPart[] =  await this.get<WalletDataPart[]>(`wallet?${queryParams}`);
            return Promise.resolve(response)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    // async getUserWallets(user_id: string, sandbox: boolean) {
    //     try {
    //         const response: WalletDataPart[] = await this.get<WalletDataPart[]>(`wallet?user_id=${user_id}&sandbox=${sandbox}`)
    //         return Promise.resolve(response)
    //     } catch (e) {
    //         return Promise.reject(e)
    //     }
    // }

    /** @deprecated wallet 엔드포인트는 폐기 예정. 다음 메이저 버전에서 제거됩니다. wallet_id + user_token 흐름으로 전환하세요. */
    async requestWalletPayment(walletRequest: WalletRequestParameters)    {
        try {
            const response: WalletPaymentResponseParameters = await this.post<WalletPaymentResponseParameters>('wallet/payment', {
                ...walletRequest
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

export * from './lib/response'
export * from './lib/resource'
export * from './bootpay-commerce'
