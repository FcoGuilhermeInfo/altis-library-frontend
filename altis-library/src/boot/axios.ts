import { defineBoot } from '#q-app'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL
})

export default defineBoot(( { store, router}) => {
  const authStore = useAuthStore(store)

  // REQUEST
  api.interceptors.request.use((config) => {
    if (authStore.token) {
      config.headers.set(
        'Authorization',
        `Bearer ${authStore.token}`,
      )
    }
    
    return config
  })

// RESPONSE
api.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      throw error instanceof Error
      ? error
      : new Error(String(error))
    }

    const status = error.response?.status
    const requestPath = error.config?.url?.split('?')[0] || ''

    if (requestPath === '/auth//login') {
      return Promise.reject(error)
    }

    if (status === 401) {
      authStore.logout()

      if (router.currentRoute.value.path !== '/login') {
        await router.replace('/acess-denied ')
      }
    }

    if (status === 403) {
      if (router.currentRoute.value.path !== '/acess-denied') {
        await router.replace('/acess-denied')
      }
    }
     
    return Promise.reject(error)
  },
)
})
export { api }
