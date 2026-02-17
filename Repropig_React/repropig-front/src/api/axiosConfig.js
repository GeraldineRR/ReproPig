import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL //Importar variable con la url del servidor backend del archivo .env

const apiAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default apiAxios