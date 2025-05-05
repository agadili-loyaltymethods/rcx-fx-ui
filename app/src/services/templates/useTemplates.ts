// import { useCallback } from 'react';
// import axiosInstance from '../http';

// export const useTemplates = () => {
//   const getTemplates = useCallback(async (params: any) => {
//     const response = await axiosInstance.get('integrationtemplates', { params });
//     return response.data;
//   }, []);

//   const deleteTemplates = useCallback(async (params: any) => {
//     const response = await axiosInstance.delete(`integrationtemplates/${params._id}`);
//     return response.data;
//   }, []);

//   const postIntegrationTemplate = useCallback(async (params: any, isEdit: boolean, appendQuery?: boolean) => {
//     let url = 'integrationtemplates';
//     const query = JSON.stringify({ validation: true });

//     if (isEdit) {
//       url = `${url}/${params._id}`;
//       if (appendQuery) {
//         url = `${url}?query=${query}`;
//       }
//       const response = await axiosInstance.patch(url, params);
//       return response.data;
//     }

//     if (appendQuery) {
//       url = `${url}?query=${query}`;
//     }
//     const response = await axiosInstance.post(url, params);
//     return response.data;
//   }, []);

//   const validateFile = useCallback(async (formData: FormData) => {
//     const response = await axiosInstance.post('templates/validate', formData);
//     return response.data;
//   }, []);

//   const importTemplates = useCallback(async (formData: FormData) => {
//     const response = await axiosInstance.post('templates/import', formData);
//     return response.data;
//   }, []);

//   const importStatus = useCallback(async () => {
//     const response = await axiosInstance.get('templates/importstatus');
//     return response.data;
//   }, []);

//   return {
//     getTemplates,
//     deleteTemplates,
//     postIntegrationTemplate,
//     validateFile,
//     importTemplates,
//     importStatus,
//   };
// };