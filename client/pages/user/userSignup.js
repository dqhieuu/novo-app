import { FaArrowLeft } from 'react-icons/fa';
import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import { MangaContext } from '../../context/manga-Context';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { validToken } from '../../utilities/fetchAuth';
import { toast } from 'react-toastify';
import { FaGooglePlusG } from 'react-icons/fa';
export default function SignUp() {
  const router = useRouter();
  const { server } = useContext(MangaContext);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [repassWord, setRePassword] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const submit = () => {
    axios
      .post(`${server}/register`, {
        username: formData.username,
        password: formData.password,
        email: formData.email,
      })
      .then((res) => {
        toast.success('Đăng ký thành công', {
          position: 'bottom-left',
          autoClose: 3000,
        });
        router.replace('/');
      })
      .catch((error) =>
        toast.error(
          'Đăng ký thất bại! Người dùng đã tồn tại',
          {
            position: 'bottom-left',
            autoClose: 3000,
          }
        )
      );
  };
  useEffect(() => {
    if (validToken()) {
      router.replace('/');
    }
  }, []);

  return (
    <div
      className="offset-md-4 col-lg-4 col-12 mt-5 p-3"
      style={{
        background: '#f3f3f3',
        borderRadius: '0.75rem',
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
      }}
    >
      <h3>
        <FaArrowLeft
          onClick={() => router.replace('/')}
        ></FaArrowLeft>
        {' Đăng ký'}
      </h3>
      <form onSubmit={handleSubmit(submit)}>
        <div className="mb-3 mt-3">
          <label htmlFor="uname" className="form-label">
            Tên người dùng:
          </label>
          <input
            type="text"
            className="form-control"
            id="uname"
            placeholder="Nhập tên đăng ký"
            name="username"
            {...register('username', {
              required: true,
              minLength: 6,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                username: e.target.value,
              })
            }
          ></input>
        </div>
        <div className="mb-3 mt-3">
          <label htmlFor="password" className="form-label">
            Mật khẩu:
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Nhập mật khẩu"
            name="password"
            {...register('password', {
              required: true,
              minLength: 8,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          ></input>
        </div>
        <div className="mb-3 mt-3">
          <label htmlFor="password" className="form-label">
            Nhập lại mật khẩu:
          </label>
          <input
            type="password"
            className="form-control"
            id="repassword"
            placeholder="Nhập mật khẩu"
            name="repassword"
            {...register('repassword', {
              required: true,
              minLength: 8,
              validate: (value) =>
                value === formData.password,
            })}
            onChange={(e) => setRePassword(e.target.value)}
          ></input>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Nhập email"
            name="email"
            {...register('email', {
              required: true,
              pattern:
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          ></input>
        </div>

        <div className="mt-3 d-flex justify-content-center">
          <button type="submit" className="btn btn-dark ">
            Đăng ký
          </button>
        </div>
      </form>
      <div className="d-flex justify-content-center mt-4">
        <h1
          className="blockquote-footer"
          style={{ fontSize: '1.25rem' }}
        >
          Hoặc
        </h1>
        <h1
          className="blockquote-footer ms-2"
          style={{ fontSize: '1.25rem' }}
        ></h1>
      </div>
      <div className="d-grid">
        <button
          className="btn btn-secondary "
          style={{ background: '#c23321' }}
          onClick={() =>
            (window.location.href = `${server}/oauth/google`)
          }
        >
          <FaGooglePlusG></FaGooglePlusG> Đăng ký bằng Gmail
        </button>
      </div>

      {Object.keys(errors).length !== 0 && (
        <ul
          className="error mt-3"
          style={{
            color: 'red',
            border: '1px solid red',
            borderRadius: '5px',
          }}
        >
          {errors.username?.type === 'required' && (
            <li>Bạn cần nhập tên người dùng</li>
          )}
          {errors.username?.type === 'minLength' && (
            <li>Tên người dùng phải có ít nhất 6 ký tự</li>
          )}
          {errors.password?.type === 'required' && (
            <li>Bạn cần nhập mật khẩu</li>
          )}
          {errors.repassword?.type === 'required' && (
            <li>Bạn cần nhập mật khẩu</li>
          )}
          {errors.repassword?.type === 'validate' && (
            <li>Mật khẩu không khớp</li>
          )}
          {errors.password?.type === 'minLength' && (
            <li>Mật khẩu có ít nhất 8 ký tự</li>
          )}
          {errors.email?.type === 'required' && (
            <li>Bạn cần nhập email</li>
          )}
          {errors.email?.type === 'pattern' && (
            <li>Email không hợp lệ</li>
          )}
        </ul>
      )}
    </div>
  );
}
