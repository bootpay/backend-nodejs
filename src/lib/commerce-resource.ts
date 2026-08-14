import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

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
                config.headers.set('Content-Type', 'application/json')
                config.headers.set('Accept', 'application/json')
                config.headers.set('Accept-Charset', 'utf-8')
                config.headers.set('BOOTPAY-SDK-VERSION', this.sdkVersion)
                config.headers.set('BOOTPAY-API-VERSION', this.apiVersion)
                config.headers.set('BOOTPAY-SDK-TYPE', '301')
                config.headers.set('BOOTPAY-ROLE', this.$role || 'user')

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
     * 토큰이 발급되어 있으면 Bearer, 없으면 client_key/secret_key Basic Auth 를 사용한다.
     */
    authorizationHeader(): string {
        const token = this.$token
        if (token !== undefined && token !== '') {
            return `Bearer ${token}`
        }
        return this.getBasicAuthHeader()
    }

    /**
     * client_key/secret_key Basic Auth 헤더
     * 계산 결과를 $token 에 저장하지 않는다 — 저장하면 다음 요청부터 Basic 값이
     * Bearer 토큰으로 오인되어 인증이 깨진다.
     */
    private getBasicAuthHeader(): string {
        const { client_key, secret_key } = this.commerceConfiguration
        if (client_key && secret_key) {
            const credentials = `${client_key}:${secret_key}`
            const encoded = Buffer.from(credentials).toString('base64')
            return `Basic ${encoded}`
        }
        return ''
    }

    entrypoints(url: string): string {
        const mode = this.commerceConfiguration.mode || 'production'
        return [this.API_ENTRYPOINTS[mode], url].join('/')
    }

    async get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<BootpayCommerceResponse<T>> {
        try {
            const response = await this.$http.get(this.entrypoints(url), config)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
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
            const response = await this.$http.post(this.entrypoints(url), data, config)
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
            const response = await this.$http.put(this.entrypoints(url), data, config)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<BootpayCommerceResponse<T>> {
        try {
            const response = await this.$http.delete(this.entrypoints(url), config)
            return Promise.resolve(response as unknown as BootpayCommerceResponse<T>)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}
