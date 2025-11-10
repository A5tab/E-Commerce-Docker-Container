import axios from 'axios';
const BASE_URL = 'http://13.202.92.158:4000/api/v1';  // for deployment on jenkins
// const BASE_URL = 'https://mernecommercebackend-production.up.railway.app/api/v1'; // for production


export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
});
