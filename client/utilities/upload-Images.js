import WEB_CONSTANTS from './constants';
import { fetchAuth } from './fetchAuth';

export default async function uploadImages(
  type,
  data,
  callback
) {
  const server = WEB_CONSTANTS.SERVER;
  let formData = new FormData();
  formData.append('file', data);

  let res;
  try {
    res = await fetchAuth({
      url: `${server}/auth/upload/${type}`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    res = null;
  }

  if (typeof callback === 'function') {
    callback(res?.data);
  }
  return res;
}
