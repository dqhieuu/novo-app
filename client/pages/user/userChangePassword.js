import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { FaArrowLeft, FaGooglePlusG } from 'react-icons/fa';
import {
  fetchAuth,
  updateToken,
  validToken,
} from '../../utilities/fetchAuth';
import { UserContext } from '../../context/user-Context';
import { useForm } from 'react-hook-form';
import WEB_CONSTANTS from '../../utilities/constants';
import { toast } from 'react-toastify';
import axios from 'axios';
export default function ChangePassWord() {
  const router = useRouter();
  const { update } = useContext(UserContext);
  const server = WEB_CONSTANTS.SERVER;
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const submit = () => {
    fetchAuth({
      url: `${server}/auth/change-password`,
      method: `PATCH`,
      data: {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      },
    })
      .then((res) => {
        toast.success('Đổi mật khẩu thành công!', {
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: 3000,
        });
        router.push('/');
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          'Đổi mật khẩu thất bại! Mật khẩU hiện tại không khớp',
          {
            position: toast.POSITION.BOTTOM_LEFT,
            autoClose: 3000,
          }
        );
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
        {' Đổi mật khẩu'}
      </h3>
      <form onSubmit={handleSubmit(submit)}>
        <div className="mb-3 mt-3">
          <label
            htmlFor="oldPassWord"
            className="form-label"
          >
            Nhập mật khẩu cũ :
          </label>
          <input
            type="password"
            className="form-control"
            id="oldPassWord"
            placeholder="Nhập mật khẩu cũ"
            name="oldPassWord"
            {...register('oldPassword', {
              required: true,
              minLength: 8,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                oldPassword: e.target.value,
              })
            }
          ></input>
        </div>
        <div className="mb-3">
          <label htmlFor="pwd" className="form-label">
            Mật khẩu mới:
          </label>
          <input
            type="password"
            name="pswd"
            id="pwd"
            placeholder="Nhập mật khẩu mới"
            className="form-control"
            {...register('newPassword', {
              required: true,

              minLength: 8,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                newPassword: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label htmlFor="pwd" className="form-label">
            Nhập lại mật khẩu mới:
          </label>
          <input
            type="password"
            name="repassword"
            id="repassword"
            placeholder="Nhập mật khẩu mới"
            className="form-control"
            {...register('repassword', {
              required: true,

              minLength: 8,
            })}
            onChange={(e) =>
              setFormData({
                ...formData,
                newPassword: e.target.value,
              })
            }
          />
        </div>

        <div className="d-grid">
          <button
            type="submit"
            className="btn btn-secondary"
          >
            Submit
          </button>
          <hr />
        </div>
      </form>

      {Object.keys(errors).length !== 0 && (
        <ul
          className="error mt-3"
          style={{
            color: 'red',
          }}
        >
          {errors.oldPassword?.type === 'required' && (
            <li>Bạn cần nhập mật khẩu hiện tại</li>
          )}

          {errors.oldPassword?.type === 'minLength' && (
            <li>Mật khẩu có ít nhât 8 ký tự</li>
          )}
          {errors.newPassword?.type === 'required' && (
            <li>Bạn cần nhập mật khẩu mới</li>
          )}
          {errors.newPassword?.type === 'maxLength' && (
            <li>Mật khẩu có ít nhât 8 ký tự</li>
          )}
          {errors.repassword?.type === 'required' && (
            <li>Mật khẩu chưa khớp</li>
          )}
        </ul>
      )}
    </div>
  );
}
