import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Constants } from '@/config/Constants'

class HttpClient {
  private instance: AxiosInstance

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL: baseURL,
      withCredentials: true,
    })
  }

  request<T>(config: AxiosRequestConfig) {
    return this.instance.request<T>(config)
  }
}

export const httpClient = new HttpClient(Constants.baseUrl)
