import React, { useContext, useState } from 'react';
import { MangaContext } from '../../context/manga-Context';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
export default function UserSignUp() {
  const { server } = useContext(MangaContext);
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
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
        toast.success('Đăng ký thành công!', {
          position: 'bottom-left',
          autoClose: 3000,
        });
        router.replace('/');
      })
      .catch((err) => {
        toast.error(
          'Đăng ký thất bại! Vui lòng thử lại sau',
          {
            position: 'bottom-left',
            autoClose: 3000,
          }
        );
      });
  };

  return (
    <div
      className="offcanvas offcanvas-end"
      id="demo"
      style={{ width: '300px' }}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Chào khách!</h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
        ></button>
      </div>
      <div className="offcanvas-body">
        <nav>
          <div
            className="nav nav-tabs"
            id="nav-tab"
            role="tablist"
          >
            <button
              className="nav-link active"
              id="nav-home-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-home"
              type="button"
              role="tab"
              aria-controls="nav-home"
              aria-selected="true"
            >
              Đăng nhập
            </button>
            <button
              className="nav-link"
              id="nav-signup-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-signup"
              type="button"
              role="tab"
              aria-controls="nav-signup"
              aria-selected="false"
            >
              Đăng ký
            </button>
          </div>
        </nav>
        <div className="tab-content" id="nav-tabContent">
          <div
            className="tab-pane fade show active"
            id="nav-home"
            role="tabpanel"
            aria-labelledby="nav-home-tab"
          >
            <form>
              <div className="mb-3 mt-3">
                <label
                  htmlFor="email"
                  className="form-label"
                >
                  Email:
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter email"
                  name="email"
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
                <label
                  htmlFor=""
                  className="form-check-label"
                >
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
                Đăng nhập bằng Gmail
              </button>
            </div>
          </div>
          <div
            className="tab-pane fade"
            id="nav-signup"
            role="tabpanel"
            aria-labelledby="nav-signup-tab"
          >
            <form onSubmit={handleSubmit(submit)}>
              <div className="mb-3 mt-3">
                <label
                  htmlFor="uname"
                  className="form-label"
                >
                  Tên người dùng:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="uname"
                  placeholder="Nhập tên đăng nhập"
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
                <label
                  htmlFor="password"
                  className="form-label"
                >
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
                <label
                  htmlFor="email"
                  className="form-label"
                >
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

              <button
                type="submit"
                className="btn btn-dark"
              >
                Đăng ký
              </button>
            </form>
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
                  <li>
                    Tên người dùng phải có ít nhất 6 ký tự
                  </li>
                )}
                {errors.password?.type === 'required' && (
                  <li>Bạn cần nhập mật khẩu</li>
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
        </div>
      </div>
    </div>
  );
}
