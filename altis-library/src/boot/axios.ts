import { defineBoot } from '#q-app'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.local.VITE_API_BASE_URL,
})

export default defineBoot(() => {
})

export { api }
