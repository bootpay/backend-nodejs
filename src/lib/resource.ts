import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface BootpayRestApiErrorResponse<T = any> {
    error_code?: number
    pg_error_code?: number
    message?: string
}

interface BootpayEntrypoints {
    development: string
    stage: string
    production: string
}

interface BootpayConfiguration {
    application_id: string
    private_key: string
    mode?: 'development' | 'production' | 'stage'
}

export class BootpayBackendNodejsResource {
    $http: AxiosInstance
    $token?: string
    mode: string
    bootpayConfiguration: BootpayConfiguration
    API_ENTRYPOINTS: BootpayEntrypoints
    apiVersion: string = '4.3.3'
    sdkVersion: string = '2.1.10'

    constructor() {
        this.mode = 'production'
        this.$http = axios.create({
            timeout: 60000
        })
        this.$token = undefined
        this.bootpayConfiguration = {
            application_id: '',
            private_key: '',
            mode: 'production'
        }
        this.API_ENTRYPOINTS = {
            development: 'https://dev-api.bootpay.co.kr/v2',
            stage: 'https://stage-api.bootpay.co.kr/v2',
            production: 'https://api.bootpay.co.kr/v2'
        }
        this.$http.interceptors.response.use((response: AxiosResponse): any => {
            if (response.request !== undefined && response.headers !== undefined) {
                return response.data
            } else {
                // 오류를 리턴
                return response.data as BootpayRestApiErrorResponse
            }
        }, (error) => {
            if (error.response !== undefined) {
                return Promise.reject(error.response.data as BootpayRestApiErrorResponse)
            } else {
                return Promise.reject({
                    error_code: -100,
                    message: `Request Rest Api Failed to Bootpay Server, ${ error.message }`
                }) as BootpayRestApiErrorResponse
            }
        })
        this.$http.interceptors.request.use((config: AxiosRequestConfig) => {
            if (config.headers !== undefined) {
                if (this.$token !== undefined) {
                    config.headers.authorization = `Bearer ${ this.$token }`
                }
                config.headers['Content-Type'] = 'application/json'
                config.headers['Accept'] = 'application/json'
                config.headers['BOOTPAY-SDK-VERSION'] = this.sdkVersion
                config.headers['BOOTPAY-API-VERSION'] = this.apiVersion
                config.headers['BOOTPAY-SDK-TYPE'] = 301

            }
            return config
        }, (error) => {
            return Promise.reject(error)
        })
    }

    /**
     * Environments
     * Comment by GOSOMI
     * @date: 2022-04-12
     * @param configuration: BootpayConfiguration
     * @returns void
     */
    setConfiguration(configuration: BootpayConfiguration): void {
        if (configuration.mode === undefined) {
            configuration.mode = 'production'
        }
        this.bootpayConfiguration = configuration
    }

    /**
     * SET API Version
     * Comment by GOSOMI
     * @date: 2022-07-29
     */
    setApiVersion(version: string) {
        this.apiVersion = version
    }

    /**
     * Set Access Token
     * Comment by GOSOMI
     * @date: 2022-04-12
     */
    setToken(token: string): void {
        this.$token = token
    }

    entrypoints(url: string): string {
        return [this.API_ENTRYPOINTS[this.bootpayConfiguration.mode], url].join('/')
    }

    async get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T> {
        try {
            const response: T = await this.$http.get(this.entrypoints(url), config)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        try {
            const response: T = await this.$http.post(this.entrypoints(url), data, config)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        try {
            const response: T = await this.$http.put(this.entrypoints(url), data, config)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T> {
        try {
            const response: T = await this.$http.delete(this.entrypoints(url), config)
            return Promise.resolve(response)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}