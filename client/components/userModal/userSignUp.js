import React, { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
export default function UserSignUp() {
  const { isAuthenication, toggleAuth } = useContext(UserContext);
  return (
    <div
      className="offcanvas offcanvas-end"
      id="demo"
      style={{ width: "300px" }}
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
          <div className="nav nav-tabs" id="nav-tab" role="tablist">
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
                <label htmlFor="email" className="form-label">
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
                {" "}
                <button
                  type="submit"
                  className="btn btn-secondary"
                  onClick={toggleAuth}
                >
                  Đăng nhập
                </button>
                <hr />
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ background: "#3b5998" }}
                  >
                    Đăng nhập bằng Facebook
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary mt-3"
                  style={{ background: "#c23321" }}
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
            <form action="" className="was-validated">
              <div className="mb-3 mt-3">
                <label htmlFor="uname" className="form-label">
                  Tên người dùng:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="uname"
                  placeholder="Nhập tên đăng nhập"
                  name="uname"
                  required
                ></input>
                <div className="valid-feedback">Hợp lệ</div>
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
                  required
                ></input>
                <div className="valid-feedback">Hợp lệ</div>
              </div>
              <div className="mb-3 mt-3">
                <label htmlFor="repassword" className="form-label">
                  Nhập lại Mật khẩu:
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="repassword"
                  placeholder="Nhập lại mật khẩu"
                  name="repassword"
                  required
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
                  required
                ></input>
                <div className="valid-feedback">Hợp lệ</div>
              </div>

              
              <button type="submit" className="btn btn-primary">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
