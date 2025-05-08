import { useCallback } from 'react';
import axiosInstance from '../http/axiosInstance';

export const usePartners = () => {
  const getPartners = useCallback(async (params: any) => {
    const response = await axiosInstance.get('partners', { params });
    return response.data;
  }, []);

  const updatePartner = useCallback(async (params: any, isEdit: boolean) => {
    let url = 'partners';
    if (isEdit) {
      url = `${url}/${params._id}`;
      const response = await axiosInstance.put(url, params);
      return response.data;
    }
    const response = await axiosInstance.post(url, params);
    return response.data;
  }, []);

  const deletePartner = useCallback(async (params: any) => {
    const response = await axiosInstance.delete(`partners/${params._id}`);
    return response.data;
  }, []);

  const deleteUser = useCallback(async (params: any) => {
    const response = await axiosInstance.delete(`users/${params._id}`);
    return response.data;
  }, []);

  const createUpdateUser = useCallback(async (query: any, isEdit: boolean) => {
    let url = 'users';
    const { body, populateQuery } = query;

    if (isEdit) {
      url = `${url}/${body._id}`;
      const response = await axiosInstance.put(url, body);
      return response.data;
    }

    const response = await axiosInstance.post(url, body, { params: populateQuery });
    return response.data;
  }, []);

  const getUsers = useCallback(async (params: any) => {
    const response = await axiosInstance.get('users', { params });
    return response.data;
  }, []);

  const getRoles = useCallback(async () => {
    const response = await axiosInstance.get('acl/roles');
    return response.data;
  }, []);

  const getPermissions = useCallback(async (params: any) => {
    const response = await axiosInstance.get(`acl/roles/${params.role}`);
    return response.data;
  }, []);

  const addRole = useCallback(async (user: string, body: any) => {
    const response = await axiosInstance.post(`acl/assign/${user}`, body);
    return response.data;
  }, []);

  const getUserRole = useCallback(async (params: any) => {
    const response = await axiosInstance.get(`acl/users/${params.user}/roles`);
    return response.data;
  }, []);

  const revokeRole = useCallback(async (user: string, role: string) => {
    const response = await axiosInstance.delete(`acl/revoke/${user}/${role}`);
    return response.data;
  }, []);

  return {
    getPartners,
    updatePartner,
    deletePartner,
    deleteUser,
    createUpdateUser,
    getUsers,
    getRoles,
    getPermissions,
    addRole,
    getUserRole,
    revokeRole,
  };
};