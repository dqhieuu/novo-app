import Image from 'next/image';
import React, {
  useState,
  useContext,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '../../context/user-Context';
import {
  deleteToken,
  fetchAuth,
  refreshToken,
} from '../../utilities/fetchAuth';
import { useForm } from 'react-hook-form';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import styles from './oauthComplete.module.css';
import axios from 'axios';
import WEB_CONSTANTS from '../../utilities/constants';
import uploadImages from '../../utilities/upload-Images';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollButton from '../../utilities/scrollButton';
export default function OauthComplete() {
  const { update, userInfo } = useContext(UserContext);
  const router = useRouter();
  const server = WEB_CONSTANTS.SERVER;
  const [formData, setFormData] = useState({
    username: '',
  });
  const [userAvatar, setUserAvatar] = useState({});
  useEffect(() => {
    if (userInfo && userInfo.role !== 'oauth_incomplete') {
      router.replace('/');
    }
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const submit = () => {
    fetchAuth({
      url: `${server}/auth/complete-oauth-register`,
      method: `POST`,
      data: {
        username: formData.username,
        avatar: userAvatar.id,
      },
    })
      .then((res) => {
        toast.success('Đăng ký thành công', {
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: 3000,
        });
        // console.log(res);
        router.replace('/');
      })
      .catch((err) => {
        refreshToken(true);
        router.replace('/');
      });
  };
  const handlePreviewAvatar = (e) => {
    const file = e.target.files[0];
    const fileURL = URL.createObjectURL(file);
    const preview = {
      status: 'uploading',
      fileURL,
      id: 0,
    };
    setUserAvatar(preview);
    uploadImages('user-avatar', file, (res) => {
      if (res) {
        preview.id = res.id;
        preview.status = 'finished';
      } else {
        preview.status = 'failed';
      }
      setUserAvatar(preview);
    });
  };
  return (
    <div
      className={
        'offset-md-3 col-lg-6 col-12 mt-5' +
        styles.container
      }
      style={{
        background: '#f3f3f3',
        borderRadius: '5px',
      }}
    >
      <form
        className="p-3"
        onSubmit={() => {
          handleSubmit(submit());
        }}
      >
        <div className="mb-3 mt-3">
          <label htmlFor="username" className="form-label">
            *Tên người dùng
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Nhập tên người dùng"
            name="username"
            {...register('username', {
              required: true,
              minLength: 6,
              maxLength: 20,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                username: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3 mt-3">
          <label
            htmlFor="avatarCover"
            className="form-label"
          >
            Chọn ảnh đại diện:
          </label>
          <input
            type="file"
            className="form-control"
            id="avatarCover"
            onChange={handlePreviewAvatar}
            accept="image/*"
          />
          <div className="d-flex justify-content-center">
            <div className={styles.avatarContainer}>
              <Image
                src={
                  userAvatar.fileURL
                    ? userAvatar.fileURL
                    : NULL_CONSTANTS.AVATAR
                }
                alt=""
                layout="responsive"
                width={150}
                height={200}
                objectFit="cover"
              />
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <button className="btn btn-dark">
            Hoàn thành
          </button>

          <button
            className="btn btn-danger ms-2"
            onClick={() => {
              deleteToken();
              update({});
              router.replace('/');
            }}
          >
            Đăng xuất
          </button>
        </div>
      </form>
      {Object.keys(errors).length !== 0 && (
        <ul
          className="error mt-3"
          style={{
            color: 'red',
          }}
        >
          {errors.username?.type === 'required' && (
            <li>Bạn cần nhập tên người dùng</li>
          )}
          {errors.username?.type === 'minLength' && (
            <li>
              Tên người dùng phải có ít nhất 6 ký tự và tối
              đa 20 ký tự!
            </li>
          )}
          {errors.username?.type === 'maxLength' && (
            <li>
              Tên người dùng phải có ít nhất 6 ký tự và tối
              đa 20 ký tự!
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
1;
