import DisplayImg from '../../components/display-Img/display-Img';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { MangaContext } from '../../context/manga-Context';
import ReactPaginate from 'react-paginate';
import { UserContext } from '../../context/user-Context';
import styles from './[id].module.css';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import WEB_CONSTANTS from '../../utilities/constants';
import {
  FaEdit,
  FaEye,
  FaHeart,
  FaNewspaper,
  FaTags,
  FaUser,
  FaWifi,
} from 'react-icons/fa';
import { BiDislike, BiLike } from 'react-icons/bi';
import ByWeek from '../../components/ranking-In-Manga-Page/by-Week';
import ByMonth from '../../components/ranking-In-Manga-Page/by-Month';
import ByYear from '../../components/ranking-In-Manga-Page/by-Year';
import Image from 'next/image';
import RelativeTimestamp from '../../utilities/to-Relative-Time-stamp';
import {
  fetchAuth,
  refreshToken,
} from '../../utilities/fetchAuth';
import Router, { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { addToHistory } from '../../utilities/localStorageFunction';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/book/${id}`);
  const data = await response.json();
  const responseComment = await fetch(
    `${server}/comment/?bookGroupId=${id}`
  );
  const dataComment = await responseComment.json();

  return {
    props: {
      manga: data,
      comments: dataComment.comments,
      bookGroupId: id,
    },
  };
}

export default function Details({
  manga,
  comments,
  bookGroupId,
}) {
  const { userInfo } = useContext(UserContext);
  const [pageNumber, setPageNumber] = useState(0);
  const cmtPerPage = 5;
  const pageVisited = pageNumber * cmtPerPage;

  const [comment, setComment] = useState('');
  const router = useRouter();
  const { server, randomBooks } = useContext(MangaContext);
  const pageCount = comments
    ? Math.ceil(comments.length / cmtPerPage)
    : 0;
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const [currentEditedComment, setCurrentEditedComment] =
    useState(-1);
  const [
    currentEditedCommentContent,
    setCurrentEditedCommentContent,
  ] = useState('');
  const addToFavourite = (bookGroupId) => {
    const newObject = {
      name: manga.name,
      id: bookGroupId,
      image: manga.primaryCoverArt,
    };
    if (localStorage.getItem('favourite') == null) {
      localStorage.setItem('favourite', '[]');
    }
    let checkExisted = false;
    const oldData = JSON.parse(
      localStorage.getItem('favourite')
    );

    oldData.forEach((ele) => {
      if (ele.id === bookGroupId) {
        checkExisted = true;
      }
    });
    if (checkExisted === false) oldData.push(newObject);
    localStorage.setItem(
      'favourite',
      JSON.stringify(oldData)
    );
  };

  const submit = (text) => {
    fetchAuth({
      // dùng sẽ như này
      // hàm này nó inject header sẵn cho ông r, và nó tự refresh token luôn
      url: `${server}/auth/comment?bookGroupId=${bookGroupId}`,
      method: `POST`,
      data: {
        comment: text,
      },
    })
      .then((res) => {
        alert('Comment thành công');
        setComment('');

        router.replace(
          `/manga/${bookGroupId}#comment-section`
        );
      })
      .catch((err) => {
        alert(err);
      });
  };

  const displayDatas = comments ? (
    comments
      .slice(pageVisited, pageVisited + cmtPerPage)
      .map((comment, index) => (
        <div className="row mb-3" key={index}>
          <div
            className="col-lg-2 col-2 py-2"
            style={{
              overflow: 'hidden',
              borderRadius: '0.75rem',
              width: '80px',
            }}
          >
            <Image
              src={
                comment.userAvatar
                  ? `${server}/image/${comment.userAvatar}`
                  : NULL_CONSTANTS.AVATAR
              }
              width="50"
              height="50"
              alt=""
              layout="responsive"
            />
          </div>
          <div
            className="col-8"
            style={{
              border: '1px solid #bdc3c7',
              borderRadius: '10px',
              background: '#ecf0f1',
              display: 'flex',
            }}
          >
            <div>
              <p
                className={
                  'display-6 text-primary ' + styles.object
                }
                style={{ fontSize: '20px' }}
              >
                {comment.userName}
                <span
                  style={{
                    fontSize: '12px',
                    color: 'black',
                  }}
                >
                  {' '}
                  <RelativeTimestamp>
                    {comment.timePosted}
                  </RelativeTimestamp>
                </span>
              </p>
              {currentEditedComment !== index ? (
                <p className="m-3">{comment.comment}</p>
              ) : (
                <div className="d-flex">
                  <input
                    className="form-control m-3"
                    value={currentEditedCommentContent}
                    type="text"
                    onChange={(e) =>
                      setCurrentEditedCommentContent(
                        e.target.value
                      )
                    }
                  />
                  <button
                    className="btn btn-link"
                    onClick={() =>
                      fetchAuth({
                        url: `${server}/auth/comment/${comment.id}`,
                        method: 'PATCH',
                        data: {
                          comment:
                            currentEditedCommentContent,
                        },
                      }).then(() => {
                        toast.success(
                          'Sửa comment thành công',
                          {
                            position: 'bottom-left',
                            autoClose: 2000,
                          }
                        );
                        router.replace(
                          `/manga/${bookGroupId}#comment-section`
                        );
                      })
                    }
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div>
              {userInfo.id === comment.userId &&
                currentEditedComment !== index && (
                  <button
                    className="btn"
                    onClick={() => {
                      setCurrentEditedComment(index);
                      setCurrentEditedCommentContent(
                        comment.comment
                      );
                    }}
                  >
                    <FaEdit></FaEdit>
                  </button>
                )}
            </div>
          </div>
        </div>
      ))
  ) : (
    <div>Không có comment nào</div>
  );

  return (
    <div style={{ background: '#EBEBEB' }}>
      <div
        className="container"
        style={{ background: '#f9f9f9' }}
      >
        <div className="row">
          <div className="col-lg-8 col-12 mt-3">
            <h3
              className="d-flex justify-content-center"
              style={{ color: '#27ae60' }}
            >
              {manga.name}
            </h3>
            <div className="row mt-3">
              <div
                className="col-lg-3 col-12"
                data-aos="fade-right"
              >
                <DisplayImg
                  srcImg={
                    manga.primaryCoverArt
                      ? `${server}/image/${manga.primaryCoverArt}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                ></DisplayImg>
              </div>
              <div
                className="col-lg-6 col-12"
                data-aos="fade-left"
              >
                <div className="d-flex justify-content-between ">
                  <div>
                    <p>
                      <FaUser></FaUser> {' ' + 'Tác giả'}
                    </p>
                    <p>
                      <FaWifi></FaWifi>
                      {' Tình trạng'}
                    </p>
                    <p>
                      <FaNewspaper></FaNewspaper>
                      {' Mới nhất'}
                    </p>
                    <p>
                      <FaEye></FaEye>
                      {' Lượt đọc'}
                    </p>
                    <p>
                      <FaTags></FaTags>
                      {' Thể loại'}
                    </p>
                  </div>
                  <div>
                    <p>
                      {manga.authors.length > 0
                        ? manga.authors.map(
                            (author, index) => (
                              <Link
                                href={`/author/${author.id}`}
                                passHref
                                key={index}
                              >
                                <span
                                  className={styles.object}
                                  style={{
                                    background: '#bdc3c7',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    marginRight: '0.5rem',
                                  }}
                                >
                                  {author.name}
                                </span>
                              </Link>
                            )
                          )
                        : 'Đang cập nhật'}
                    </p>
                    <p>Đang cập nhật</p>
                    <p style={{ color: '#27ae60' }}>
                      {manga.chapters.length > 0
                        ? 'Chap ' +
                          manga.chapters[0].chapterNumber
                        : 'Chưa có chap mới'}
                    </p>
                    <p>{manga.views}</p>
                    <p>
                      {manga.genres &&
                        manga.genres.map((genre) => (
                          <Link
                            key={genre.id}
                            href={`/genre/${genre.id}`}
                            passHref
                          >
                            <span
                              className={styles.object}
                              style={{
                                background: '#bdc3c7',
                                borderRadius: '0.5rem',
                                padding: '0.5rem',
                                marginRight: '0.5rem',
                              }}
                            >
                              {genre.name}
                            </span>
                          </Link>
                        ))}
                    </p>
                  </div>
                </div>
                <div className="button-utilities col-12">
                  <button
                    type="button"
                    className="btn btn-outline-dark  me-2"
                  >
                    <BiLike></BiLike>
                    <span className="badge bg-danger">
                      {' ' + manga.likeCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn  btn-outline-dark me-2"
                  >
                    <BiDislike></BiDislike>
                    <span className="badge bg-primary">
                      {manga.likeCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-success  "
                    onClick={() => {
                      addToFavourite(bookGroupId);
                    }}
                  >
                    <FaHeart></FaHeart>
                    {' Yêu Thích'}
                  </button>
                  {manga.chapters.length != 0 && (
                    <Link
                      passHref
                      href={`/chapter/${
                        manga.chapters[
                          manga.chapters.length - 1
                        ].id
                      }`}
                    >
                      <button
                        type="button"
                        className={`btn btn-dark ms-2 ${styles.readButton}`}
                      >
                        Đọc từ đầu
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div
              className="mt-3"
              style={{ borderRadius: '10px' }}
            >
              <h5
                style={{
                  borderLeft: '5px solid #2980b9',
                  color: '#2980b9',
                }}
                className="ps-2"
              >
                GALLERIES
              </h5>
              {manga.coverArts.length > 0 && (
                <div
                  id="carouselExampleCaptions"
                  className="carousel slide carousel-dark"
                  data-bs-ride="carousel"
                  data-aos="fade-up"
                >
                  <div className="carousel-indicators">
                    <button
                      type="button"
                      data-bs-target="#carouselExampleDark"
                      data-bs-slide-to="0"
                      className="active"
                    ></button>
                    {Array.from(
                      Array(
                        manga.coverArts.length - 1
                      ).keys()
                    ).map((value, index) => (
                      <button
                        type="button"
                        data-bs-target="#carouselExampleDark"
                        data-bs-slide-to={value + 1}
                        key={index}
                      ></button>
                    ))}
                  </div>
                  <div
                    className="carousel-inner"
                    style={{ borderRadius: '5px' }}
                  >
                    <div
                      className="carousel-item active"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <Image
                        src={`${server}/image/${manga.coverArts[0]}`}
                        objectFit="cover"
                        alt=""
                        layout="fill"
                      />
                    </div>
                    {manga.coverArts.length > 0 &&
                      manga.coverArts
                        .slice(1, manga.coverArts.length)
                        .map((coverArt, index) => (
                          <div
                            className="carousel-item"
                            key={index}
                            style={{ aspectRatio: '16/9' }}
                          >
                            <Image
                              src={`${server}/image/${coverArt}`}
                              alt="Describe"
                              objectFit="cover"
                              layout="fill"
                            />
                          </div>
                        ))}
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">
                      Previous
                    </span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">
                      Next
                    </span>
                  </button>
                </div>
              )}
            </div>
            <div className="manga-description mt-3">
              <h5
                style={{
                  borderLeft: '5px solid red',
                  color: 'red',
                }}
                className="ps-2"
              >
                NỘI DUNG
              </h5>
              <p>{manga.description}</p>
            </div>
            <div className="mt-1">
              <h5
                style={{
                  borderLeft: '5px solid #8e44ad',
                  color: ' #8e44ad',
                }}
                className="ps-2"
              >
                DANH SÁCH CHAP
              </h5>

              <div
                className="row"
                style={{ borderBottom: '1px solid grey' }}
              >
                <div className="col-3">
                  <p>Tên chap</p>
                </div>
                <div className="col-3">
                  <p>Cập nhật</p>
                </div>
                <div className="col-3">
                  <p>Người đăng</p>
                </div>
                <div className="col-3">
                  <p>Lượt xem</p>
                </div>
              </div>

              <div className="list-chapter">
                {manga.chapters.map((chapter, index) => (
                  <div
                    className="row"
                    key={chapter.id}
                    style={{
                      borderBottom: '1px solid lightgrey',
                    }}
                  >
                    <Link
                      href={`/chapter/${chapter.id}`}
                      passHref
                    >
                      <div className="col-3">
                        <p
                          className={styles.object}
                          onClick={() => {
                            addToHistory(
                              bookGroupId,
                              chapter,
                              manga
                            );
                          }}
                        >
                          Chapter
                          {' ' + chapter.chapterNumber}
                        </p>
                      </div>
                    </Link>
                    <div className="col-3">
                      <p>
                        <RelativeTimestamp>
                          {chapter.timePosted}
                        </RelativeTimestamp>
                      </p>
                    </div>
                    <Link
                      href={`/user/${chapter.userPosted.id}`}
                      passHref
                    >
                      <div className="col-3">
                        <p className={styles.object}>
                          {chapter.userPosted.name}
                        </p>
                      </div>
                    </Link>
                    <div className="col-3">
                      <p>
                        {chapter.views
                          ? chapter.views
                          : 'Chưa có lượt xem'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className="col-lg-4  col-12 mt-3"
            data-aos="fade-left"
          >
            <h5
              style={{
                borderLeft: '5px solid green',
                color: 'green',
              }}
              className="ps-2"
            >
              BẢNG XẾP HẠNG
            </h5>
            <ul
              className="nav nav-tabs nav-justified"
              id="myTab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="week-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#week"
                  type="button"
                  role="tab"
                  aria-controls="week"
                  aria-selected="true"
                >
                  Tuần
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="month-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#month"
                  type="button"
                  role="tab"
                  aria-controls="month"
                  aria-selected="false"
                >
                  Tháng
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="year-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#year"
                  type="button"
                  role="tab"
                  aria-controls="year"
                  aria-selected="true"
                >
                  Năm
                </button>
              </li>
            </ul>
            <div className="tab-content ">
              <div
                className="tab-pane active"
                id="week"
                role="tabpanel"
                aria-labelledby="week-tab"
              >
                <ByWeek></ByWeek>
              </div>
              <div
                className="tab-pane "
                id="month"
                role="tabpanel"
                aria-labelledby="month-tab"
              >
                <ByMonth></ByMonth>
              </div>
              <div
                className="tab-pane "
                id="year"
                role="tabpanel"
                aria-labelledby="year-tab"
              >
                <ByYear></ByYear>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 col-lg-8">
          <h5
            style={{
              borderLeft: '5px solid #f1c40f',
              color: '#f1c40f',
            }}
            className="ps-2"
          >
            BÌNH LUẬN
          </h5>

          <div className="comment-section mt-3">
            {Object.keys(userInfo).length !== 0 ? (
              <div
                className="row p-3 m-2"
                style={{
                  background: 'lightgrey',
                  borderRadius: '0.75rem',
                }}
              >
                <div
                  className="col-lg-2 col-6"
                  style={{
                    width: '80px',
                    aspectRatio: '1/1',
                    overflow: 'hidden',
                    borderRadius: '50%',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={
                      userInfo.avatar
                        ? `${server}/image/${userInfo.avatar}`
                        : NULL_CONSTANTS.AVATAR
                    }
                    width={50}
                    height={50}
                    objectFit="cover"
                    alt="Avatar"
                    layout="fill"
                  ></Image>
                </div>
                <div className="col-lg-10 col-6">
                  <textarea
                    name="comments"
                    id=""
                    rows="3"
                    className="form-control"
                    placeholder="Nhập bình luận..."
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                  ></textarea>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn btn-dark me-5"
                    onClick={() => submit(comment)}
                  >
                    Bình luận
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="row p-3 m-2"
                style={{
                  background: 'lightgrey',
                  borderRadius: '0.75rem',
                }}
              >
                <div
                  className="col-lg-2 col-6"
                  style={{
                    width: '80px',
                    aspectRatio: '1/1',
                    overflow: 'hidden',
                    borderRadius: '50%',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={
                      userInfo.avatar
                        ? `${server}/image/${userInfo.avatar}`
                        : NULL_CONSTANTS.AVATAR
                    }
                    width={50}
                    height={50}
                    objectFit="cover"
                    alt="Avatar"
                    layout="fill"
                  ></Image>
                </div>
                <div className="col-lg-10 col-6">
                  <textarea
                    name="comments"
                    id=""
                    rows="3"
                    className="form-control"
                    placeholder="Để bình luận hãy đăng nhập"
                    disabled
                  ></textarea>
                </div>
              </div>
            )}
            <div id="comment-section"></div>
            {displayDatas}
            <div className="d-flex justify-content-center">
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
            </div>
          </div>
        </div>

        <div className=" mt-3">
          <h5
            style={{
              borderLeft: '5px solid #1abc9c',
              color: '#1abc9c',
            }}
            className="ps-2"
          >
            ĐỪNG BỎ LỠ
          </h5>
        </div>
        <div className="row">
          {randomBooks.slice(0, 6).map((manga, index) => (
            <Link
              href={`/manga/${manga.id}`}
              passHref
              key={index}
            >
              <div
                className="col-6 col-lg-2"
                data-aos="fade-up"
              >
                <DisplayImg
                  srcImg={
                    manga.image
                      ? `${server}/image/${manga.image}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                  text={
                    manga.latestChapter == null
                      ? NULL_CONSTANTS.CHAPTER_NUMBER_NULL
                      : 'Chap ' + manga.latestChapter
                  }
                  title={manga.title}
                  bgColor="#1abc9c"
                ></DisplayImg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}