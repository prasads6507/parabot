// Use relative URLs in production (Vercel), localhost in dev
const API_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

export default API_URL;
