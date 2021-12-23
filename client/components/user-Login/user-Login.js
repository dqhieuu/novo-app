import React, { useContext } from 'react';
import Link from 'next/link';
import { UserContext } from '../../context/user-Context';
import { deleteToken } from '../../utilities/fetchAuth';
import { useRouter } from 'next/router';
import {
  FaFileUpload,
  FaHistory,
  FaRegKissWinkHeart,
  FaUserAlt,
  FaUserCog,
  FaUserEdit,
} from 'react-icons/fa';
export default function UserLogin() {
  const { userInfo, update } = useContext(UserContext);
  const router = useRouter();
  return (
    <div
      className="offcanvas offcanvas-end"
      id="demo"
      style={{ width: '300px' }}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">
          Chào {userInfo.name}!
        </h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
        ></button>
      </div>
      <div className="offcanvas-body">
        <Link href={`/user/${userInfo.id}`} passHref>
          <p
            data-bs-dismiss="offcanvas"
            className="signInComponent"
          >
            <FaUserAlt></FaUserAlt>
            {' Trang cá nhân'}
          </p>
        </Link>
        <Link href={`/user/userChangePassword`} passHref>
          <p
            data-bs-dismiss="offcanvas"
            className="signInComponent"
          >
            <FaUserCog></FaUserCog>Đổi mật khẩu
          </p>
        </Link>
        <hr />

        <Link href={`/user/${userInfo.id}#upload`} passHref>
          <p
            data-bs-dismiss="offcanvas"
            className="signInComponent"
          >
            <FaFileUpload></FaFileUpload>Truyện đã đăng
          </p>
        </Link>

        <button
          className="btn btn-dark"
          data-bs-dismiss="offcanvas"
          onClick={() => {
            deleteToken();
            update({});
            router.replace('/');
          }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
