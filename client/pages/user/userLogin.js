import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { FaArrowLeft, FaGooglePlusG } from 'react-icons/fa';
import { UserContext } from '../../context/user-Context';
import { useForm } from 'react-hook-form';
import WEB_CONSTANTS from '../../utilities/constants';
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
      <form>
        <div className="mb-3 mt-3">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter email"
            name="email"
            {...register('email', {
              required: true,
              minLength: 6,
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
            placeholder="Enter password"
            className="form-control"
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
    </div>
  );
}
