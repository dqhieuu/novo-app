import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { FaArrowLeft, FaGooglePlusG } from 'react-icons/fa';
import {
  updateToken,
  validToken,
} from '../../utilities/fetchAuth';
import { UserContext } from '../../context/user-Context';
import { useForm } from 'react-hook-form';
import WEB_CONSTANTS from '../../utilities/constants';
import { toast } from 'react-toastify';
import axios from 'axios';
export default function Login() {
  const router = useRouter();
  const { update } = useContext(UserContext);
  const server = WEB_CONSTANTS.SERVER;
  const [formData, setFormData] = useState({
    userNameOrEmail: '',
    password: '',
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const submit = () => {
    axios({
      url: `${server}/login`,
      method: `POST`,
      data: {
        userNameOrEmail: formData.userNameOrEmail,
        password: formData.password,
      },
    })
      .then((res) => {
        updateToken(res.data);
        toast.success('Đăng nhập thành công', {
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: 3000,
        });
        router.push('/');
      })
      .catch((err) => {
        toast.error('Đăng nhập thất bại!', {
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: 3000,
        });
      });
  };

  return (
    <div
      className="offset-md-4 col-lg-4 col-12 mt-5 p-3"
      style={{
        borderRadius: '0.75rem',
        background: '#f3f3f3',
      }}
    >
      <h3>
        <FaArrowLeft
          onClick={() => router.replace('/')}
        ></FaArrowLeft>
        {' Đăng nhập'}
      </h3>
      <form onSubmit={handleSubmit(submit)}>
        <div className="mb-3 mt-3">
          <label htmlFor="email" className="form-label">
            Email :
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Nhập email"
            name="email"
            {...register('username', {
              required: true,
              minLength: 6,
              pattern:
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                userNameOrEmail: e.target.value,
              })
            }
          ></input>
        </div>
        <div className="mb-3">
          <label htmlFor="pwd" className="form-label">
            Mật khẩu:
          </label>
          <input
            type="password"
            name="pswd"
            id="pwd"
            placeholder="Nhập password"
            className="form-control"
            {...register('password', {
              required: true,
              maxLength: 50,
              minLength: 8,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          />
        </div>
        <div className="form-check mb-3">
          <label htmlFor="" className="form-check-label">
            <input
              type="checkbox"
              className="form-check-input"
              name="remember"
            />
            Remember me
          </label>
        </div>
        <i className="bi bi-meta"></i>
        <div className="d-grid">
          <button
            type="submit"
            className="btn btn-secondary"
          >
            Đăng nhập
          </button>
          <hr />
        </div>
      </form>
      <div className="d-grid">
        <button
          className="btn btn-secondary mt-3"
          style={{ background: '#c23321' }}
          onClick={() =>
            (window.location.href = `${server}/oauth/google`)
          }
        >
          <FaGooglePlusG></FaGooglePlusG> Đăng nhập bằng
          Gmail
        </button>
        <button
          className="btn btn-light mt-3"
          onClick={() => router.replace('/user/userSignup')}
        >
          Chưa có tài khoản? Đăng ký ngay!
        </button>
      </div>
      {Object.keys(errors).length !== 0 && (
        <ul
          className="error mt-3"
          style={{
            color: 'red',
          }}
        >
          {errors.username?.type === 'required' && (
            <li>Bạn cần nhập email</li>
          )}
          {errors.username?.type === 'pattern' && (
            <li>Email không hợp lệ</li>
          )}
          {errors.password?.type === 'maxLength' && (
            <li>
              Mật khẩu có ít nhât 8 ký tự và tối đa 50 ký
              tự!
            </li>
          )}
          {errors.password?.type === 'minLength' && (
            <li>
              Mật khẩu có ít nhât 8 ký tự và tối đa 50 ký
              tự!
            </li>
          )}
          {errors.password?.type === 'required' && (
            <li>Bạn cần nhập mật khẩu</li>
          )}
        </ul>
      )}
    </div>
  );
}
