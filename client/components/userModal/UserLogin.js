import React, { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import Link from "next/link";
export default function UserLogin() {
  const { isAuthenication, toggleAuth } = useContext(UserContext);
  return (
    <div
      className="offcanvas offcanvas-end"
      id="demo"
      style={{ width: "300px" }}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Chào Hieu!</h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
        ></button>
      </div>
      <div className="offcanvas-body">
        <Link href="/userPage" passHref>
          <a target="_blank">
            <p>Trang cá nhân</p>
          </a>
        </Link>

        <p>Sửa thông tin</p>
        <p>Đổi mật khẩu</p>
        <hr />
        <p>Truyện đã đọc</p>
        <p>Truyện đã thích</p>
        <p>Truyện đã đăng</p>
        <p>Đang theo dõi</p>
        <hr />
        <p>Dark Mode</p>
        <hr />

        <button className="btn btn-dark" onClick={toggleAuth}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
