import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../context/manga-Context';
import { UserContext } from '../../context/user-Context';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import DisplayImg from '../../components/display-Img/display-Img';
import WEB_CONSTANTS from '../../utilities/constants';
import ReactPaginate from 'react-paginate';
import Image from 'next/image';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import {
  FaBookReader,
  FaEdit,
  FaNewspaper,
  FaReadme,
  FaRegEdit,
  FaWindowClose,
} from 'react-icons/fa';
import {
  fetchAuth,
  refreshToken,
} from '../../utilities/fetchAuth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import RelativeTimestamp from '../../utilities/to-Relative-Time-stamp';
import { BiLike } from 'react-icons/bi';
import uploadImages from '../../utilities/upload-Images';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/user/${id}`);
  const data = await response.json();

  return {
    props: {
      user: data,
      id,
    },
  };
}

export default function User({ user, id }) {
  const { server } = useContext(MangaContext);
  const { userInfo } = useContext(UserContext);
  const [userAvatar, setUserAvatar] = useState({});

  const [pageNumber, setPageNumber] = useState(0);
  const bookPerPage = 4;
  const pageVisited = pageNumber * bookPerPage;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [formData, setFormData] = useState({
    username: user.name,
    email: '', //ê làm sao để set default email đc nhỉ, nó là object promise nên nếu tôi set lúc đầu thì k dc
    // email lấy từ đâu đấy?
    description: user.description,
    avatar: user.avatar,
  });

  useEffect(() => {
    setFormData((lastState) => ({
      ...lastState,
      email: userInfo.email,
    }));
  }, [userInfo]);
  const router = useRouter();
  const submit = () => {
    fetchAuth({
      url: `${server}/auth/change-user-info`,
      method: `PATCH`,
      data: {
        username: formData.username || null,
        email: formData.email,
        description: formData.description,
        avatar: userAvatar.id,
      },
    })
      .then((res) => {
        toast.success('Sửa thông tin thành công', {
          position: 'bottom-left',
          autoClose: 2000,
        });
        router.replace(`/user/${id}`);
      })
      .catch((err) => {
        toast.error(
          'Sửa thông tin thất bại. Vui lòng thử lại!',
          {
            position: 'bottom-left',
            autoClose: 2000,
          }
        );
      });
  };
  const handlePreviewAvatar = (e) => {
    const file = e.target.files[0];
    const fileURL = URL.createObjectURL(file);
    const preview = {
      status: 'uploading',
      fileURL,
      id: 0,
    };
    setUserAvatar(preview);
    uploadImages('user-avatar', file, (res) => {
      if (res) {
        preview.id = res.id;
        preview.status = 'finished';
      } else {
        preview.status = 'failed';
      }
      setUserAvatar(preview);
    });
  };

  const displayData = user.bookPosted ? (
    user.bookPosted
      .slice(pageVisited, pageVisited + bookPerPage)
      .map((listObject) => (
        <div
          className="row mb-3 p-1"
          style={{
            background: '#ecf0f1',
            borderRadius: '0.75rem',
          }}
          key={listObject.id}
        >
          <div className="col-lg-3 col-md-2 col-3">
            <Link href={`/manga/${listObject.id}`} passHref>
              <div
                style={{
                  width: '80%',
                  aspectRatio: '3/4',
                  overflow: 'hidden',
                  borderRadius: '0.75rem',
                  position: 'relative',
                }}
              >
                <Image
                  src={
                    listObject.image
                      ? `${server}/image/${listObject.image}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                  width={140}
                  height={190}
                  objectFit="cover"
                  layout="responsive"
                  alt="Book Cover"
                ></Image>
              </div>
            </Link>
          </div>
          <div className="col-lg-6 col-md-5 col-6">
            <Link href={`/manga/${listObject.id}`} passHref>
              <h5 style={{ color: '#1abc9c' }}>
                {listObject.title}
              </h5>
            </Link>
            <div className="row">
              <div className="col-6">
                <p>
                  <FaNewspaper></FaNewspaper>
                  {' Chap mới nhất: ' +
                    listObject.latestChapter}
                </p>
                <p>
                  <FaBookReader></FaBookReader>
                  {' Lượt đọc: ' + listObject.views}
                </p>
              </div>
              <div className="col-6">
                <p>
                  <BiLike></BiLike>
                  {' Lượt thích: ' + listObject.likes}
                </p>
                <p>
                  <FaReadme></FaReadme>
                  {' Update: '}
                  <RelativeTimestamp>
                    {listObject.lastUpdated}
                  </RelativeTimestamp>
                </p>
              </div>
            </div>
          </div>
          {userInfo.id == id && (
            <div className="col-lg-3 col-md-3 col-3">
              <Link href={`/manage-Manga/${listObject.id}`}>
                <button className="btn ">
                  <FaEdit></FaEdit>
                </button>
              </Link>

              <button className="btn ">
                <FaWindowClose></FaWindowClose>
              </button>
            </div>
          )}
        </div>
      ))
  ) : (
    <div>Chưa đăng truyện nào</div>
  );
  const pageCount = Math.ceil(
    user.booksPosted &&
      user.booksPosted.length / bookPerPage
  );
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };
  return (
    <div>
      <div
        className="author-gradient container-fluid"
        data-aos="fade-in"
      ></div>
      <div className="container ">
        <div className="row">
          <div className="col-lg-2 col-12 image-container mt-3">
            <div
              style={{
                border: '2px solid white',
                width: '200px',
                aspectRatio: '3/4',
                borderRadius: '0.75rem',
                position: 'relative',

                overflow: 'hidden',
              }}
            >
              <Image
                data-aos="fade-down"
                src={
                  user.avatar
                    ? `${server}/image/${user.avatar}`
                    : NULL_CONSTANTS.AVATAR
                }
                layout="fill"
                objectFit="cover"
                alt=""
              ></Image>
            </div>
          </div>
          <div className="col-lg-8 col-12 ps-5 pt-2">
            <div className="d-flex justify-content-start">
              <h3>{user.name}</h3>
              {userInfo.id == id && (
                <button
                  className="btn btn-light mb-3 ms-3"
                  data-bs-toggle="modal"
                  data-bs-target="#editInfo"
                >
                  <FaRegEdit />
                </button>
              )}
            </div>

            <ul
              className="nav nav-tabs nav-justified"
              id="myTab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="personalInfo-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#personalInfo"
                  type="button"
                  role="tab"
                  aria-controls="personalInfo"
                  aria-selected="true"
                >
                  THÔNG TIN
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="upload-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#upload"
                  type="button"
                  role="tab"
                  aria-controls="upload"
                  aria-selected="false"
                >
                  UPLOAD
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="favorite-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#favorite"
                  type="button"
                  role="tab"
                  aria-controls="favorite"
                  aria-selected="false"
                >
                  DANH SÁCH YÊU THÍCH
                </button>
              </li>
            </ul>
            <div className="tab-content  ">
              <div
                className="tab-pane active"
                id="personalInfo"
                role="tabpanel"
                aria-labelledby="personalInfo-tab"
              >
                <p>
                  {user.description
                    ? user.description
                    : 'Chưa có mô tả'}
                </p>

                <h5>Role</h5>
                <p>{user.role}</p>
              </div>
              <div
                className="tab-pane "
                id="upload"
                role="tabpanel"
                aria-labelledby="upload-tab"
              >
                <div className="mt-3">{displayData}</div>
                <div className="mt-3 d-flex justify-content-center">
                  {user.booksPosted && (
                    <ReactPaginate
                      breakLabel="..."
                      previousLabel="Trước"
                      nextLabel="Sau"
                      pageCount={pageCount}
                      onPageChange={changePage}
                      pageClassName="page-item"
                      pageLinkClassName="page-link"
                      previousClassName="page-item"
                      previousLinkClassName="page-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-link"
                      breakClassName="page-item"
                      breakLinkClassName="page-link"
                      containerClassName="pagination"
                      activeClassName="active"
                      renderOnZeroPageCount={null}
                    ></ReactPaginate>
                  )}
                </div>
              </div>
              <div
                className="tab-pane "
                id="favorite"
                role="tabpanel"
                aria-labelledby="favorite-tab"
              >
                Hi
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="editInfo"
        aria-labelledby="editInfo"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title"
                id="exampleModalLabel"
              >
                Chỉnh sửa thông tin
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(submit)}>
                <div className="mb-3 mt-3">
                  <label className="form-label">
                    Email:
                  </label>
                  <input
                    disabled
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter email"
                    name="email"
                    value={formData.email}
                    {...register('email', {
                      pattern:
                        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    })}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Username:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="pwd"
                    placeholder="Enter name"
                    name="pswd"
                    value={formData.username}
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
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Mô tả:
                  </label>
                  <textarea
                    className="form-control"
                    name="description"
                    id="description"
                    rows="3"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Avatar:
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handlePreviewAvatar}
                  />
                  <div className="mt-3 d-flex justify-content-center">
                    <div
                      style={{
                        width: '200px',
                        aspectRatio: '3/4',
                        position: 'relative',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={
                          userAvatar.fileURL
                            ? userAvatar.fileURL
                            : `${server}/image/${user.avatar}`
                        }
                        alt="author Avatar"
                        objectFit="cover"
                        layout="fill"
                      ></Image>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark"
                  data-bs-dismiss="modal"
                >
                  Submit
                </button>
              </form>
              {Object.keys(errors).length !== 0 && (
                <ul
                  className="error mt-3"
                  style={{
                    color: 'red',
                  }}
                >
                  {errors.email?.type === 'pattern' && (
                    <li>Email không hợp lệ</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
