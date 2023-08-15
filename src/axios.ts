import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/',
});

export default axiosClient;
