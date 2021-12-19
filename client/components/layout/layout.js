import Head from 'next/head';
import Link from 'next/link';
import React, { useContext, useEffect } from 'react';
import { MangaContext } from '../../context/manga-Context';
import { UserContext } from '../../context/user-Context';
import SearchBar from '../search-Bar/search-Bar';
import Image from 'next/image';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import WEB_CONSTANTS from '../../utilities/constants';
import styles from './layout.module.css';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  fetchAuth,
  updateToken,
  validToken,
} from '../../utilities/fetchAuth';
import UserLogin from '../user-Login/user-Login';
export default function Layout({ children }) {
  const { genres } = useContext(MangaContext);
  const { update, userInfo } = useContext(UserContext);
  const router = useRouter();
  const server = WEB_CONSTANTS.SERVER;
  console.log(genres);

  useEffect(() => {
    const { provider, code } = router.query;
    const isValidToken = validToken(false);
    if (!isValidToken && provider && code) {
      router.replace('/', undefined, {
        shallow: true,
      });
      switch (provider) {
        case 'google':
          (async () => {
            const { data } = await axios.get(
              `${WEB_CONSTANTS.SERVER}/login?provider=${provider}&code=${code}`
            );
            if (data) {
              updateToken(data);

              update(
                (
                  await fetchAuth({
                    url: `${server}/auth/role`,
                  })
                ).data
              );
            }
          })();
          break;
      }
      // chắc đc rồi
      // có hàm gì bị lỗi kìa
      // còn gì nữa ko nhỉ
      // tạm thời chưa nghĩ ra, để tôi làm đã
      // à để tét cái
    } else if (isValidToken) {
      (async () => {
        update(
          (
            await fetchAuth({
              url: `${server}/auth/role`,
            })
          ).data
        );
      })();
    }
  }, [router.query]);
  return (
    <div>
      <Head>
        <title>MangaReader</title>

        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark sticky-top ">
        <div className="container">
          <Link href="/" passHref>
            <a className="navbar-brand">Logo</a>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Danh sách
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="navbarDropdown"
                >
                  <div className={styles.genreContainer}>
                    <div className="row">
                      {genres &&
                        genres.map((genre) => (
                          <div
                            className={`col-2 col-lg-3 `}
                            key={genre.id}
                          >
                            <Link
                              href={`/genre/${genre.id}`}
                              passHref
                            >
                              <p className={styles.item}>
                                {genre.name}
                              </p>
                            </Link>
                          </div>
                        ))}
                    </div>
                  </div>
                </ul>
              </li>
              <li className="nav-item">
                <Link href="/ranking/rankingManga" passHref>
                  <a className="nav-link">BXH</a>
                </Link>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Donate
                </a>
              </li>
            </ul>
            <Link href="/upload-Manga/upload-Manga">
              {Object.keys(userInfo).length !== 0 ? (
                <button className="nav-item btn btn-light me-2">
                  Upload truyện
                </button>
              ) : (
                ''
              )}
            </Link>

            <SearchBar></SearchBar>
            {userInfo && Object.keys(userInfo).length ? ( //nếu đã đăng nhập thì hiện 1 cái offcanvas
              <div
                className=" ms-2"
                style={{
                  overflow: 'hidden',
                  borderRadius: '50%',
                  background: 'white',
                  width: '50px',
                  height: '50px',
                }}
                data-bs-toggle="offcanvas"
                data-bs-target="#demo"
              >
                <Image
                  src={
                    userInfo.avatar
                      ? `${server}/image/${userInfo.avatar}`
                      : NULL_CONSTANTS.AVATAR
                  }
                  alt=""
                  width="50"
                  height="50"
                  layout="responsive"
                  objectFit="cover"
                />
              </div>
            ) : (
              // còn k thì hiện 1 cái modal có 2 option, signin of singup
              //hiện tại nó đang ở trạng thái đã đăng nhập ấy :
              // object rỗng đúng ko?

              <div
                className=" ms-2"
                style={{
                  overflow: 'hidden',
                  borderRadius: '50%',
                  background: 'white',
                  width: '50px',
                  height: '50px',
                }}
                data-bs-toggle="modal"
                data-bs-target="#signinorsignup"
              >
                <Image
                  src={NULL_CONSTANTS.AVATAR}
                  alt=""
                  width="50"
                  height="50"
                  layout="responsive"
                  objectFit="cover"
                />
              </div>
            )}
          </div>
        </div>
      </nav>
      <div
        className="modal fade"
        id="signinorsignup"
        aria-labelledby="signinorsignup"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title"
                id="exampleModalLabel"
              >
                Bạn cần đăng nhập hoặc đăng ký
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-around">
                <button
                  className="btn btn-dark"
                  onClick={() =>
                    router.replace('/user/userLogin')
                  }
                  data-bs-dismiss="modal"
                >
                  Đăng nhập
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    router.replace('/user/userSignup')
                  }
                  data-bs-dismiss="modal"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserLogin></UserLogin>
      <div>{children}</div>
    </div>
  );
}
