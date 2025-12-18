import axios from 'axios';

const baseURL = 'https://facilities.astrikdigital.com/api/';

export const createServerApi = (loginId?: string) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(loginId ? { LoginId: loginId } : {}),
    },
  });
};
