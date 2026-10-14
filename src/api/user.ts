import { get, post } from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  name: string
  role: string
}

export const userApi = {
  login: (data: LoginParams) => post<{ token: string }>('/user/login', data),
  getUserInfo: () => get<UserInfo>('/user/info')
}
