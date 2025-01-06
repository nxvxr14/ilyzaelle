import axios from "axios";

// const url_local = "http://192.168.1.12:4040/api"

// con esto creamos una url base para hacer las peticiones y no deber cambiar el host en cada parte codigo
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// const apiLocal= axios.create({
//     baseURL: url_local
//     })

export {
  api,
  // apiLocal
};
