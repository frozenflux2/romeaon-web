import axios, { AxiosRequestHeaders, AxiosResponse, Method } from 'axios'
import { BACKEND_URL } from '@/constants'

const baseURL = `${BACKEND_URL}/api/v1`

interface RequestParams {
    url: string
    data?: any
    headers?: AxiosRequestHeaders
}
const request =
    (method: Method) =>
    async <T>({ url, data, headers }: RequestParams): Promise<T> => {
        const result: AxiosResponse<T> = await axios({
            url: baseURL + url,
            method,
            data,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        })
        return result.data
    }
export const getRequest = request('get')
export const postRequest = request('post')
export const putRequest = request('put')
export const deleteRequest = request('delete')

const maxRetryCount = 3
const maxDelaySec = 4

export async function fetchWithRetries(
    url: RequestInfo,
    options: RequestInit,
    retries = 1
) {
    try {
        return await fetch(url, options)
    } catch (err) {
        if (retries <= maxRetryCount) {
            const delay =
                Math.min(
                    Math.pow(2, retries) / 4 + Math.random(),
                    maxDelaySec
                ) * 1000

            await new Promise((resolve) => setTimeout(resolve, delay))

            console.log(
                `Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`
            )
            return await fetchWithRetries(url, options, retries + 1)
        } else {
            throw new Error(`Max retries exceeded. error: ${err}`)
        }
    }
}
