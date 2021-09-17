import { BootpaySingleton } from "./lib/bootpay/singleton"
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios"
import { isBlank, isPresent, objectKeyToUnderscore } from "./lib/bootpay/support"

const API_URL: any = {
    development: 'https://dev-api.bootpay.co.kr',
    stage: 'https://stage-api.bootpay.co.kr',
    production: 'https://api.bootpay.co.kr'
}

export interface BootpayCommonResponse<T = any> {
    status: Number
    code: Number
    message?: String
    data?: T
}

export interface BootpayCancelData {
    receiptId: string, // 부트페이에서 발급한 영수증 id
    price?: number, // (선택사항) 부분취소 요청시 금액을 지정, 미지정시 전액 취소 (부분취소가 가능한 PG사, 결제수단에 한해 적용됨)
    name?: string, // 취소 요청자 이름
    reason?: string, // 취소 요청 사유
    refund?: BootpayRefundData
}

export interface BootpayRefundData {
    account: string,
    accountholder: string,
    bankcode: string
}

export interface BootpaySubscribeBillingData {
    orderId: string, // 개발사에서 지정하는 고유주문번호
    pg: string, // PG사의 Alias ex) danal, kcp, inicis 등
    itemName: string, // 상품명
    cardNo: string, // 카드 일련번호
    cardPw: string, // 카드 비밀번호 앞 2자리
    expireYear: string, // 카드 유효기간 년
    expireMonth: string, // 카드 유효기간 월
    identifyNumber: string, // 주민등록번호 또는 사업자번호
    userInfo?: BootpayUserInfoData, // 구매자 정보
    extra?: BootpaySubscribeExtraData //기타 옵션 
}

export interface BootpayRequestSubscribeBillingPaymentData {
    billingKey: string, // 발급받은 빌링키
    itemName: string, // 결제할 상품명
    price: number, // 결제할 상품금액
    taxFree?: number, // 면세금액
    orderId: string, // 개발사에서 지정하는 고유주문번호
    quota?: number, // 할부 개월수
    interest?: number, // 무이자 여부 ( 웰컴 페이먼츠만 가능 )
    userInfo?: BootpayUserInfoData, // 구매자 정보, 특정 PG사의 경우 구매자 휴대폰 번호를 필수로 받는다
    items?: Array<BootpayItemData>,  // 구매할 상품정보
    feedbackUrl?: string, // 결제 완료 후 피드백 받을 URL
    feedbackContentType?: string, // Feedback 받을 경우 content-type - json, urlencoded
    extra?: BootpaySubscribeExtraData//기타 옵션 
}

export interface BootpayReserveSubscribeBillingData {
    billingKey: string,  // 발급받은 빌링키
    itemName: string,  // 결제할 상품명
    price: number, // 결제할 상품금액
    taxFree: number, // 면세금액
    orderId: string, // 개발사에서 지정하는 고유주문번호
    quota?: number, // 할부 개월수
    interest?: number,  // 무이자 여부 ( 웰컴 페이먼츠만 가능 )
    schedulerType: string, // 실행 방법 - oneshot
    executeAt: number, // (예약) 결제 실행시간
    userInfo?: BootpayUserInfoData, // 구매자 정보, 특정 PG사의 경우 구매자 휴대폰 번호를 필수로 받는다
    items?: Array<BootpayItemData>, // 구매할 상품정보
    feedbackUrl: string, // 결제 완료 후 피드백 받을 URL
    feedbackContentType: string, // Feedback 받을 경우 content-type - json, urlencoded
    extra?: BootpaySubscribeExtraData//기타 옵션 
}

export interface BootpayRequestPaymentData {
    pg?: string, // [PG 결제] 사용하고자 하는 PG사의 Alias를 입력. ex) danal, kcp, inicis등, 미 지정시 통합결제창이 오픈
    method?: string, //card:카드, phone: 휴대폰, bank: 실시간 계좌이체, vbank: 가상계좌, auth: 본인인증, card_rebill: 정기결제, easy: 카카오,페이코,네이버페이 등의 간편결제, 미지정시 통합결제창 오픈
    methods?: Array<string>, // 통합결제시 사용할 method 배열 형태
    orderId: string, // 개발사에서 관리하는 고유결제번호
    price: number,  // 결제금액
    taxFree?: number, // 비과세 금액
    itemName: string, // 결제할 상품명
    // returnUrl?: string,
    params?: string,  // string 형태로 전달 할 값, 결제 후 똑같이 리턴해드림
    userInfo?: BootpayUserInfoData, // 구매자 정보
    items?: Array<BootpayItemData>, // 상품정보
    extra?: any // 기타 옵션
}

export interface BootpayRequestUserTokenData {
    userId: string, // 개발사에서 관리하는 회원 고유 id
    email?: string, // 회원 email
    name?: string, // 회원명
    gender?: number, // 0 - 여자, 1 - 남자
    birth?: string, // 생일 901004
    phone?: string //01012341234
}

export interface BootpayItemData {
    unique: string, // 상품 고유키
    qty: number, // 수량
    itemName: string, // 상품명
    price: number, // 상품단가
    cat1?: string, // 카테고리 상
    cat2?: string, // 카테고리 중 
    cat3?: string // 카테고리 하 
}

export interface BootpaySubscribeExtraData {
    subscribeTestPayment: number, // 100원 결제 후 결제가 되면 billing key를 발행, 결제가 실패하면 에러
    rawData?: number //PG 오류 코드 및 메세지까지 리턴
}

export interface BootpayUserInfoData {
    id: string, // 개발사에서 관리하는 회원 고유 id
    username?: string, //구매자 이름
    email?: string, // 구매자 email
    phone?: string, //01012341234
    gender?: number, //0:여자, 1:남자
    area?: string, // 서울|인천|대구|광주|부산|울산|경기|강원|충청북도|충북|충청남도|충남|전라북도|전북|전라남도|전남|경상북도|경북|경상남도|경남|제주|세종|대전 중 택 1
    birth?: string 
}


class BootpayRestClient extends BootpaySingleton {

    $http: AxiosInstance
    $token?: string
    applicationId?: string
    privateKey?: string
    mode: string

    constructor() {
        super()
        this.mode = 'production'
        this.$token = undefined
        this.$http = axios.create({
            timeout: 60000
        })
        this.$http.interceptors.response.use((response: AxiosResponse<BootpayCommonResponse>): any => {
            if (isPresent(response.request) && isPresent(response.headers)) {
                return response.data as BootpayCommonResponse
            } else {
                return {
                    code: -100,
                    status: 500,
                    message: `오류가 발생했습니다. ${ response }`,
                    data: response
                } as BootpayCommonResponse
            }
        }, function (error) {
            if (isPresent(error.response)) {
                return Promise.reject(error.response.data)
            } else {
                return Promise.reject({
                    code: -100,
                    message: `통신오류가 발생하였습니다. ${ error.message }`,
                    status: 500
                })
            }
        })
        this.$http.interceptors.request.use((config: AxiosRequestConfig) => {
            if (isPresent(this.$token)) {
                config.headers.authorization = this.$token
            }
            config.headers['Content-Type'] = 'application/json'
            config.headers['Accept'] = 'application/json'
            return config
        }, (error) => {
            return Promise.reject(error)
        })
    }

    /**
     * rest api configure
     * Comment by rumi
     * @date: 2020-10-27
     * @param (applicationId, privateKey, mode)
     * @returns void
     */
    setConfig(applicationId: string, privateKey: string, mode: string = 'production') {
        this.applicationId = applicationId
        this.privateKey = privateKey
        this.mode = isPresent(mode) ? mode : 'production'
        if (isBlank(API_URL[this.mode])) {
            throw new Error(`환경설정 설정이 잘못되었습니다. 현재 설정된 모드: ${ this.mode }, 가능한 모드: development, stage, production`)
        }
        return
    }

    /**
     * 1. 토큰 발급 
     * getting access token
     * Comment by rumi
     * @date: 2020-10-27
     * @param void
     * @returns Promise<BootpayCommonResponse>
     */
    async getAccessToken(): Promise<BootpayCommonResponse> {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('request/token'),
                {
                    application_id: this.applicationId,
                    private_key: this.privateKey
                }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        this.$token = response.data.token
        return Promise.resolve(response)
    }

    /**
     * 2. 결제 검증 
     * receipt verify
     * Comment by rumi
     * @date: 2020-10-27
     * @param receiptId
     * @returns Promise<BootpayCommonResponse>
     */
    async verify(receiptId: string): Promise<BootpayCommonResponse> {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.get(
                this.getApiUrl(`receipt/${ receiptId }`)
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }

    /**
     * 3. 결제 취소 (전액 취소 / 부분 취소)
     * Payment Cancel
     * Comment by rumi
     * @date: 2020-10-27
     * @param data: BootpayCancelData
     * @returns Promise<BootpayCommonResponse>
     */
    async cancel(data: BootpayCancelData) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('cancel'),
                {
                    receipt_id: data.receiptId,
                    price: data.price,
                    name: data.name,
                    reason: data.reason,
                    refund: data.refund
                }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }

    /**
     * 4. 빌링키 발급 
     * Request Subscribe Card Billing Key
     * Comment by rumi
     * @date: 2020-10-27
     * @param data: BootpaySubscribeBillingData
     * @returns Promise<BootpayCommonResponse>
     */
    async requestSubscribeBillingKey(data: BootpaySubscribeBillingData) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('request/card_rebill'),
                {
                    order_id: data.orderId,
                    pg: data.pg,
                    item_name: data.itemName,
                    card_no: data.cardNo,
                    card_pw: data.cardPw,
                    expire_year: data.expireYear,
                    expire_month: data.expireMonth,
                    identify_number: data.identifyNumber,
                    user_info: data.userInfo,
                    extra: objectKeyToUnderscore(data.extra)
                }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }


    /**
     * 4-1. 발급된 빌링키로 결제 승인 요청 
     * subscribe payment by billing key
     * Comment by rumi
     * @date: 2020-10-27
     * @param data: BootpayRequestSubscribeBillingPaymentData
     * @returns Promise<BootpayCommonResponse>
     */
    async requestSubscribeBillingPayment(data: BootpayRequestSubscribeBillingPaymentData) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('subscribe/billing'),
                {
                    billing_key: data.billingKey,
                    order_id: data.orderId,
                    item_name: data.itemName,
                    price: data.price,
                    tax_free: data.taxFree,
                    interest: data.interest,
                    quota: data.quota,
                    items: objectKeyToUnderscore(data.items),
                    user_info: objectKeyToUnderscore(data.userInfo),
                    feedback_url: data.feedbackUrl,
                    feedback_content_type: data.feedbackContentType,
                    extra: data.extra
                }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }

    /**
     * 4-2. 발급된 빌링키로 결제 예약 요청
     * reserve payment by billing key
     * Comment by rumi
     * @date: 2020-10-27
     * @param data: BootpayReserveSubscribeBillingData
     * @returns Promise<BootpayCommonResponse>
     */
    async reserveSubscribeBilling(data: BootpayReserveSubscribeBillingData) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('subscribe/billing/reserve'),
                {
                    billing_key: data.billingKey,
                    order_id: data.orderId,
                    price: data.price,
                    tax_free: data.taxFree,
                    user_info: objectKeyToUnderscore(data.userInfo),
                    item_info: objectKeyToUnderscore(data.items),
                    item_name: data.itemName,
                    feedback_url: data.feedbackUrl,
                    feedback_content_type: data.feedbackContentType,
                    scheduler_type: data.schedulerType,
                    execute_at: data.executeAt
                }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }

    /**
     * 4-2-1. 발급된 빌링키로 결제 예약 - 취소 요청 
     * Cancel Reserve Subscribe Billing
     * Comment by rumi
     * @date: 2020-10-27
     * @param reserveId: string
     * @returns Promise<BootpayCommonResponse>
     */
    async destroyReserveSubscribeBilling(reserveId: string) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.delete(
                this.getApiUrl(`subscribe/billing/reserve/${ reserveId }`)
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }


    /**
     * 4-3. 빌링키 삭제 
     * destroy billing key
     * Comment by rumi
     * @date: 2020-10-27
     * @param billingKey: string
     * @returns Promise<BootpayCommonResponse>
     */
     async destroySubscribeBillingKey(billingKey: string) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.delete(
                this.getApiUrl(`subscribe/billing/${ billingKey }`)
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }


    /**
     * 5. (부트페이 단독 - 간편결제창, 생체인증 기반의 사용자를 위한) 사용자 토큰 발급 
     * get user token
     * Comment by rumi
     * @date: 2020-10-27
     * @param data: BootpayRequestUserTokenData
     * @returns Promise<BootpayCommonResponse>
     */
     async requestUserToken(data: BootpayRequestUserTokenData) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('request/user/token'),
                {
                    user_id: data.userId,
                    email: data.email,
                    name: data.name,
                    gender: data.gender,
                    birth: data.birth,
                    phone: data.phone
                }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }

    /**
     * 6. 결제링크 생성 
     * REST API로 결제 요청을 합니다
     * Comment by rumi
     * @date: 2020-10-27
     * @param data: any
     * @returns Promise<BootpayCommonResponse>
     */
     async requestPayment(data: BootpayRequestPaymentData) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('request/payment'),
                {
                    pg: data.pg,
                    method: data.method,
                    methods: data.methods,
                    order_id: data.orderId,
                    price: data.price,
                    params: data.params,
                    tax_free: data.taxFree,
                    name: data.itemName,
                    user_info: objectKeyToUnderscore(data.userInfo),
                    items: objectKeyToUnderscore(data.items),
                    // return_url: data.returnUrl,
                    extra: objectKeyToUnderscore(data.extra)
                }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }


    /**
     * 7. 서버 승인 요청 
     * Server Submit method
     * Comment by rumi
     * @date: 2020-10-27
     * @param receiptId
     * @returns Promise<BootpayCommonResponse>
     */
     async submit(receiptId: string): Promise<BootpayCommonResponse> {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.post(
                this.getApiUrl('submit'),
                { receipt_id: receiptId }
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    }


    /**
     * 8. 본인 인증 결과 검증 
     * Certificate Data
     * Comment by rumi
     * @date: 2020-10-27
     * @param receiptId: string
     * @returns Promise<BootpayCommonResponse>
     */
    async certificate(receiptId: string) {
        let response: BootpayCommonResponse
        try {
            response = await this.$http.get(
                this.getApiUrl(`certificate/${ receiptId }`)
            )
        } catch (e) {
            return Promise.reject(e)
        }
        return Promise.resolve(response)
    } 

    private getApiUrl(uri: string) {
        return [API_URL[this.mode], uri].join('/')
    }
}

export const Bootpay = BootpayRestClient.currentInstance<BootpayRestClient>()