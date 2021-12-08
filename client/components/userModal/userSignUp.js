import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserContext } from '../../Context/UserContext';
export default function UserSignUp() {
  const initialValues = {
    username: '',
    email: '',
    password: '',
  };
  const [formData, setData] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({
    username: 'Bạn cần nhập tên hiển thị',
    email: 'Bạn cần nhập email',
    password: 'Bạn cần nhập mật khẩu',
  });
  const [isSubmit, setIsSubmit] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...formData, [name]: value });
    console.log(formData);
    setFormErrors(validate(formData));
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmit(true);
  };
  useEffect(() => {
    console.log(formErrors);
    console.log(formData);
  }, [formErrors]);
  const validate = (values) => {
    const errors = {};
    const regex =
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (
      values.username[0] === ' ' ||
      values.username.length < 6
    ) {
      errors.username =
        'Tên hiển thị không hợp lệ. Tên hiển thị phải có ít nhất 6 ký tự và không được bắt đầu bằng dấu cách';
    } else {
      errors.username = '';
    }
    if (!values.email) {
      errors.email = 'Bạn cần nhập email';
    } else if (!regex.test(values.email)) {
      errors.email = 'Email không hợp lệ!';
    } else {
      errors.email = '';
    }
    if (!values.password) {
      errors.password = 'Bạn cần nhập mật khẩu';
    } else if (values.password.length < 7) {
      errors.password =
        'Mật khẩu phải có tối thiểu 8 ký tự';
    } else {
      errors.password = '';
    }

    return errors;
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
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ background: '#3b5998' }}
                  >
                    Đăng nhập bằng Facebook
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary mt-3"
                  style={{ background: '#c23321' }}
                >
                  Đăng nhập bằng Gmail
                </button>
              </div>
            </form>
          </div>
          <div
            className="tab-pane fade"
            id="nav-signup"
            role="tabpanel"
            aria-labelledby="nav-signup-tab"
          >
            <form onSubmit={handleSubmit}>
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
                  value={formData.username}
                  onChange={handleChange}
                ></input>
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
                  value={formData.password}
                  onChange={handleChange}
                ></input>
                {formErrors.password.length === 0 ? (
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
                    ❌ {formErrors.password}
                  </p>
                )}
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
                  value={formData.email}
                  onChange={handleChange}
                ></input>
                {formErrors.email.length === 0 ? (
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
                    ❌ {formErrors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
