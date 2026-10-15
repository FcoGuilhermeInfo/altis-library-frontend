import { defineBoot } from '#q-app'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL
})

export default defineBoot(() => {
})

export { api }
