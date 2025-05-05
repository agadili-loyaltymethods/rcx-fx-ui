// import { useCallback } from 'react';
// import axiosInstance from '../http';

// export const usePrograms = () => {
//   const getEnums = useCallback(async (params: any) => {
//     const query = params?.query && JSON.parse(params.query);
//     if (query) {
//       query.status = 'Active';
//       params.query = JSON.stringify(query);
//     }
//     const response = await axiosInstance.get('enums', { params });
//     return response.data;
//   }, []);

//   const getProgramDetails = useCallback(async () => {
//     const response = await axiosInstance.get('programs');
//     return response.data;
//   }, []);

//   return {
//     getEnums,
//     getProgramDetails,
//   };
// };