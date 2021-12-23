import axios from 'axios';
import WEB_CONSTANTS from './constants';
export async function refreshToken(forced = false) {
  const expire = localStorage.getItem('tokenExpire');
  const token = localStorage.getItem('token');

  if (expire ^ token) {
    // XOR
    deleteToken();
    return;
  }

  const server = WEB_CONSTANTS.SERVER;

  if (new Date(expire) < Date.now() || forced) {
    try {
      const res = await axios.post(
        `${server}/auth/refresh-token`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res) {
        updateToken(response.data);
      }
    } catch {
      deleteToken();
    }
  }
}

function internalFetchAuth(options = {}, callback = null) {
  const token = localStorage.getItem('token');

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return axios(options).then(callback);
}

export function updateToken(response) {
  const { token, expire } = response;
  if (token && expire) {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpire', expire);
  }
}

export function deleteToken() {
  localStorage.removeItem('tokenExpire');
  localStorage.removeItem('token');
}

export function validToken() {
  const expire = localStorage.getItem('tokenExpire');
  const token = localStorage.getItem('token');
  return expire && token;
}

export async function fetchAuth(
  options = {},
  callback = null
) {
  await refreshToken();
  return internalFetchAuth(options);
}
