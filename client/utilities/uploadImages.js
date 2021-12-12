import axios from 'axios';
import WEB_CONSTANTS from './constants';

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
    res = await axios.post(
      `${server}/auth/upload/${type}`,
      formData,
      {
        header: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error) {
    res = null;
  }

  if (callback) {
    callback(res?.data?.id);
  }
}
