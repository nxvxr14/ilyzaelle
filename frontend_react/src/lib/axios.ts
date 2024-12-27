import axios from "axios";

// con esto creamos una url base para hacer las peticiones y no deber cambiar el host en cada parte codigo
const api = axios.create({
baseURL: import.meta.env.VITE_API_URL
})

export default api