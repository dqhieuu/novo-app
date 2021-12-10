import axios from 'axios';

export default async function uploadImages(
  type,
  data,
  callback
) {
  const server = 'http://192.168.1.29:7001';
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
