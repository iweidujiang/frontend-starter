import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<{ name: string } | null>(null)

  async function login(username: string, password: string) {
    const res = await userApi.login({ username, password })
    token.value = res.token
    localStorage.setItem('token', res.token)
  }

  async function fetchUserInfo() {
    userInfo.value = await userApi.getUserInfo()
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return { token, userInfo, login, fetchUserInfo, logout }
})
