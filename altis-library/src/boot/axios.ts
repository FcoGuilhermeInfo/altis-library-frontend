import { defineBoot } from '#q-app'
import axios from 'axios'

const baseURL: string = import.meta.env.VITE_API_URL || ''

  console.log('baseURL2', import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL
})

export default defineBoot(() => {
})

export { api }
