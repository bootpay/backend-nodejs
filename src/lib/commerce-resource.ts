import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import FormData from 'form-data'

export interface BootpayCommerceRestApiErrorResponse<T = any> {
    error_code?: number
    message?: string
}

interface CommerceEntrypoints {
    development: string
    stage: string
    production: string
}

export interface CommerceConfiguration {
    client_key?: string
    secret_key?: string
    mode?: 'development' | 'production' | 'stage'
}

export interface BootpayCommerceResponse<T = any> {
    success: boolean
    data: T
    error?: string
}

/**
 * JSON 이 아닌 본문(CSV 등)을 파싱하지 않고 그대로 담아 돌려주는 응답.
 * 알림톡 템플릿 내보내기(format=csv)처럼 서버가 JSON 을 주지 않는 endpoint 에서 쓴다.
 */
export interface BootpayCommerceRawResponse {
    body: string
    content_type: string
}

export class BootpayCommerceResource {
    $http: AxiosInstance
    $token?: string
    $role: string
    mode: 'development' | 'production' | 'stage'
    commerceConfiguration: CommerceConfiguration
    API_ENTRYPOINTS: CommerceEntrypoints
    apiVersion: string = '1.0.0'
    sdkVersion: string = '1.0.0'

    constructor() {
        this.mode = 'production'
        this.$role = 'user'
        this.$http = axios.create({
            timeout: 60000
        })
        this.$token = undefined
        this.commerceConfiguration = {
            client_key: '',
            secret_key: '',
            mode: 'production'
        }
        this.API_ENTRYPOINTS = {
            development: 'https://dev-api.bootapi.com/v1',
            stage: 'https://stage-api.bootapi.com/v1',
            production: 'https://api.bootapi.com/v1'
        }

        this.$http.interceptors.response.use(
            (response: AxiosResponse): any => {
                // ⚠️ 원문 응답을 요청한 경우(CSV 등)에는 파싱된 data 만 돌려주면 Content-Type 이 사라진다.
                //    호출부가 JSON 인지 CSV 인지 구분할 수 없게 되므로 본문과 함께 실어 보낸다.
                if ((response.config as any)?.__bootpayRaw === true) {
                    return {
                        body: typeof response.data === 'string' ? response.data : String(response.data ?? ''),
                        content_type: String(response.headers?.['content-type'] ?? '')
                    }
                }
                return response.data
            },
            (error: any) => {
                if (error.response !== undefined) {
                    return Promise.reject(error.response.data)
                } else {
                    return Promise.reject({
                        error: `Request Rest Api Failed to Bootpay Commerce Server, ${error.message}`
                    })
                }
            }
        )

        this.$http.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // ⚠️ 요청이 Content-Type 을 직접 지정한 경우(multipart/form-data 등) 덮어쓰지 않는다.
                // 덮어쓰면 form-data 가 붙인 boundary 가 사라져 본문이 서버에서 null 로 파싱된다.
                if (!config.headers.has('Content-Type')) {
                    config.headers.set('Content-Type', 'application/json')
                }
                // ⚠️ 원문 응답 요청(CSV 등)만 요청이 지정한 Accept 를 살린다.
                //    axios 가 기본 Accept 를 항상 채워 두므로 'has' 로는 구분할 수 없다.
                if ((config as any).__bootpayRaw !== true) {
                    config.headers.set('Accept', 'application/json')
                }
                config.headers.set('Accept-Charset', 'utf-8')
                config.headers.set('BOOTPAY-SDK-VERSION', this.sdkVersion)
                config.headers.set('BOOTPAY-API-VERSION', this.apiVersion)
                config.headers.set('BOOTPAY-SDK-TYPE', '301')
                // 요청별로 role 이 지정된 경우(supervisor 전용 endpoint 등)에는 그 값을 유지한다.
                if (!config.headers.has('BOOTPAY-ROLE')) {
                    config.headers.set('BOOTPAY-ROLE', this.$role || 'user')
                }

                const authorization = this.authorizationHeader()
                if (authorization) {
                    config.headers.set('Authorization', authorization)
                }
                return config
            },
            (error: any) => {
                return Promise.reject(error)
            }
        )
    }

    setConfiguration(configuration: CommerceConfiguration): void {
        if (configuration.mode === undefined) {
            configuration.mode = 'production'
        }
        this.commerceConfiguration = configuration
    }

    private requireCommerceCredentials(): void {
        const { client_key, secret_key } = this.commerceConfiguration
        if (!client_key || !secret_key) {
            throw {
                error_code: -101,
                message: 'Commerce API에는 client_key/secret_key를 함께 입력해주세요.'
            }
        }
    }

    setApiVersion(version: string) {
        this.apiVersion = version
    }

    setToken(token: string): void {
        this.$token = token
    }

    getToken(): string | undefined {
        return this.$token
    }

    setRole(role: string): void {
        this.$role = role
    }

    getRole(): string {
        return this.$role
    }

    /**
     * Authorization 헤더
     * Commerce API는 항상 client_key/secret_key Basic Auth 를 사용한다.
     */
    authorizationHeader(): string {
        return this.getBasicAuthHeader()
    }

    /**
     * client_key/secret_key Basic Auth 헤더
     * 계산 결과를 $token 에 저장하지 않는다 — 저장하면 다음 요청부터 Basic 값이
     * Bearer 토큰으로 오인되어 인증이 깨진다.
     */
    private getBasicAuthHeader(): string {
        this.requireCommerceCredentials()
        const { client_key, secret_key } = this.commerceConfiguration
        const credentials = `${client_key}:${secret_key}`
        const encoded = Buffer.from(credentials).toString('base64')
        return `Basic ${encoded}`
    }

    entrypoints(url: string): string {
        const mode = this.commerceConfiguration.mode || 'production'
        return [this.API_ENTRYPOINTS[mode], url].join('/')
    }

    async get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<BootpayCommerceResponse<T>> {
        try {
            this.requireCommerceCredentials()
            const response = await this.$http.get(this.entrypoints(url), config)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * JSON 이 아닌 본문을 파싱하지 않고 그대로 받는다.
     * ⚠️ 일반 get 은 axios 가 JSON 으로 파싱하려 하므로, CSV 를 돌려주는 endpoint
     *    (알림톡 템플릿 내보내기 format=csv)에서는 본문이 깨지거나 Content-Type 이 유실된다.
     *    성공 시 { body: '<원문 문자열>', content_type: '...' } 를 돌려준다.
     */
    async getRaw(url: string, config?: AxiosRequestConfig): Promise<BootpayCommerceRawResponse> {
        try {
            this.requireCommerceCredentials()
            const response = await this.$http.get(this.entrypoints(url), {
                ...config,
                responseType: 'text',
                transformResponse: [(data: any) => data],
                __bootpayRaw: true
            } as AxiosRequestConfig)
            return Promise.resolve(response as unknown as BootpayCommerceRawResponse)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async post<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<BootpayCommerceResponse<T>> {
        try {
            this.requireCommerceCredentials()
            const response = await this.$http.post(this.entrypoints(url), data, config)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * multipart/form-data 전송 (파일 업로드용)
     * ⚠️ Content-Type 은 form-data 가 생성한 값(boundary 포함)을 그대로 사용한다.
     *    직접 지정하거나 인터셉터가 덮어쓰면 boundary 가 사라져 본문이 깨진다.
     * 기존 post 는 JSON 고정이라 손대지 않고 별도 메서드로 둔다.
     */
    async postMultipart<T = any>(
        url: string,
        form: FormData,
        config?: AxiosRequestConfig
    ): Promise<BootpayCommerceResponse<T>> {
        try {
            this.requireCommerceCredentials()
            const response = await this.$http.post(this.entrypoints(url), form, {
                ...config,
                headers: {
                    ...config?.headers,
                    ...form.getHeaders()
                }
            })
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async postWithBasicAuth<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<BootpayCommerceResponse<T>> {
        try {
            this.requireCommerceCredentials()
            const authConfig: AxiosRequestConfig = {
                ...config,
                headers: {
                    ...config?.headers,
                    Authorization: this.getBasicAuthHeader()
                }
            }
            const response = await this.$http.post(this.entrypoints(url), data, authConfig)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async put<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<BootpayCommerceResponse<T>> {
        try {
            this.requireCommerceCredentials()
            const response = await this.$http.put(this.entrypoints(url), data, config)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<BootpayCommerceResponse<T>> {
        try {
            this.requireCommerceCredentials()
            const response = await this.$http.delete(this.entrypoints(url), config)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}
