import axios, { AxiosRequestHeaders, AxiosResponse, Method } from 'axios'
import { BackendUrl } from '@/constants'

const baseURL = `${BackendUrl}/api/v1`

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
