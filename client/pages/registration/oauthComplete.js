import React, { useState } from 'react';

export default function OauthComplete() {
  const initialValues = {
    username: '',
  };
  const [formData, setData] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({
    username: 'Bạn cần nhập tên hiển thị',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...formData, [name]: value });

    setFormErrors(validate(formData));
  };
  const validate = (values) => {
    const errors = {};

    if (
      values.username.length < 6 ||
      values.username.length > 20
    ) {
      errors.username =
        'Tên hiển thị không hợp lệ. Tên hiển thị phải có ít nhất 6 ký tự và tối đa 20 ký tự';
    } else {
      errors.username = '';
    }

    return errors;
  };
  return (
    <div
      className="offset-md-4 col-lg-4 col-12 mt-5"
      style={{
        background: '#f3f3f3',
        borderRadius: '5px',
      }}
    >
      <form className="p-3">
        <div className="mb-3 mt-3">
          <label htmlFor="username" className="form-label">
            Tên người dùng
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Nhập tên người dùng"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {formErrors.username.length === 0 ? (
            <p
              className="form-label mt-3"
              style={{ color: 'green' }}
            >
              ✅Hợp lệ
            </p>
          ) : (
            <p
              className="form-label mt-3"
              style={{ color: 'red' }}
            >
              ❌ {formErrors.username}
            </p>
          )}
        </div>
        <div className="mb-3 mt-3">
          <label
            htmlFor="avatarCover"
            className="form-label"
          >
            *Chọn ảnh đại diện:
          </label>
          <input
            type="file"
            className="form-control"
            id="avatarCover"
          />
          <div className="mt-3">
            <img src="" alt="" />
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <button className="btn btn-dark">
            Hoàn thành
          </button>
        </div>
      </form>
    </div>
  );
}
