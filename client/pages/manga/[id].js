import DisplayImg from '../../components/display-Img/display-Img';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
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
  FaQuoteLeft,
  FaQuoteRight,
  FaRegStar,
  FaTags,
  FaUser,
  FaWifi,
  FaWindowClose,
} from 'react-icons/fa';
import { BiDislike, BiLike, BiTime } from 'react-icons/bi';
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
import {
  addToHistory,
  addToFavorite,
  removeElementFavorite,
} from '../../utilities/localStorageFunction';
import ScrollButton from '../../utilities/scrollButton';

export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(
    `${server}/book/${id}`
  ).catch((err) => {
    toast.error('Có lỗi xảy ra! Vui lòng thử lại sau', {
      position: 'bottom-left',
      autoClose: 3000,
    });
    Router.replace('/');
    removeElementFavorite(id);
  });
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
  const [arr, setArr] = useState([]);
  const { userInfo } = useContext(UserContext);
  const [pageNumber, setPageNumber] = useState(0);
  const cmtPerPage = 5;
  const pageVisited = pageNumber * cmtPerPage;
  useEffect(() => {
    let arr = JSON.parse(localStorage.getItem('favorite'));

    setArr(arr.filter((book) => book.id == bookGroupId));
  }, []);
  const [comment, setComment] = useState('');
  const router = useRouter();
  const { server, randomBooks } = useContext(MangaContext);
  const pageCount = comments
    ? Math.ceil(comments.length / cmtPerPage)
    : 0;
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const [likeState, setLikeState] = useState('unlike');
  function likeOperation(likeState) {
    fetchAuth({
      url: `${server}/auth/like/${bookGroupId}/${likeState}`,
      method: 'POST',
      data: {
        bookGroupId: bookGroupId,
        operation: likeState,
      },
    });
  }
  const handleInputChange = (text) => {
    setComment(text);
  };

  const actualLikeCount =
    manga.likeCount + (likeState === 'like' ? 1 : 0);

  const actualDislikeCount =
    manga.dislikeCount + (likeState === 'dislike' ? 1 : 0);

  function likeStateButton() {
    const nextLikeState =
      likeState === 'like' ? 'unlike' : 'like';
    setLikeState(nextLikeState);
    likeOperation(nextLikeState);
  }
  function dislikeStateButton() {
    const nextLikeState =
      likeState === 'dislike' ? 'unlike' : 'dislike';
    setLikeState(nextLikeState);
    likeOperation(nextLikeState);
  }
  const [currentEditedComment, setCurrentEditedComment] =
    useState(-1);
  const [
    currentEditedCommentContent,
    setCurrentEditedCommentContent,
  ] = useState('');

  const submit = () => {
    fetchAuth({
      url: `${server}/auth/comment?bookGroupId=${bookGroupId}`,
      method: `POST`,
      data: {
        comment: comment,
      },
    })
      .then((res) => {
        toast.success('Comment thành công!', {
          position: 'bottom-left',
          autoClose: 3000,
        });

        router.replace(router.asPath);
      })
      .catch((err) => {
        toast.error(
          'Comment thất bại! Comment phải có ít nhất 10 ký tự và không nhiều hơn 500 ký tự',
          {
            position: 'bottom-left',
            autoClose: 3000,
          }
        );
      });
  };
  const deleteBookGroup = () => {
    fetchAuth({
      url: `${server}/auth/book/${bookGroupId}`,
      method: 'DELETE',
    }).then(() => {
      toast.success('Xoá thành công', {
        position: 'bottom-left',
        autoClose: 2000,
      });
      router.replace('/');
    });
  };
  const deleteComment = (id) => {
    fetchAuth({
      url: `${server}/auth/comment/${id}`,
      method: 'DELETE',
    }).then(() => {
      toast.success('Xoá thành công!', {
        position: 'bottom-left',
        autoClose: 3000,
      });
      router.push('/manga/' + bookGroupId);
    });
  };

  const displayDatas = comments ? (
    comments
      .slice(pageVisited, pageVisited + cmtPerPage)
      .map((comment, index) => (
        <div className="row mb-3" key={index}>
          <div className="col-lg-2 col-3 ">
            <div
              style={{
                borderRadius: '50%',
                width: '80%',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '1/1',
              }}
            >
              <Link
                href={'/user/' + comment.userId}
                passHref
              >
                <Image
                  src={
                    comment.userAvatar
                      ? `${server}/image/${comment.userAvatar}`
                      : NULL_CONSTANTS.AVATAR
                  }
                  alt=""
                  layout="fill"
                />
              </Link>
            </div>
          </div>
          <div
            className="col-lg-10 col-9"
            style={{
              border: '1px solid #bdc3c7',
              borderRadius: '10px',
              background: '#ecf0f1',
            }}
          >
            <div>
              <div className="d-flex">
                <div>
                  <Link
                    href={'/user/' + comment.userId}
                    passHref
                  >
                    <p
                      className={
                        'display-6 text-primary  ' +
                        styles.object
                      }
                      style={{ fontSize: '20px' }}
                    >
                      {comment.userName}
                    </p>
                  </Link>
                </div>
                <div>
                  <span
                    className="ms-3"
                    style={{
                      fontSize: '12px',
                      color: 'black',
                    }}
                  >
                    <BiTime></BiTime>
                    <RelativeTimestamp>
                      {comment.timePosted}
                    </RelativeTimestamp>
                  </span>
                </div>
                <div className={styles.object}>
                  <Link
                    href={'/chapter/' + comment.chapterId}
                    passHref
                  >
                    <p className="ms-2">
                      {comment.chapterNumber
                        ? 'Chap ' + comment.chapterNumber
                        : ''}
                    </p>
                  </Link>
                </div>
                {userInfo.id === comment.userId &&
                currentEditedComment !== index &&
                userInfo.permission &&
                userInfo.permission.includes(
                  'comment.modifySelf'
                ) ? (
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
                ) : (
                  userInfo.permission &&
                  userInfo.permission.includes(
                    'comment.modify'
                  ) && (
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
                  )
                )}
                {userInfo.id === comment.userId &&
                userInfo.permission &&
                userInfo.permission.includes(
                  'comment.deleteSelf'
                ) ? (
                  <button
                    className="btn"
                    onClick={() => {
                      deleteComment(comment.commentId);
                    }}
                  >
                    <FaWindowClose></FaWindowClose>
                  </button>
                ) : (
                  userInfo.permission &&
                  userInfo.permission.includes(
                    'comment.delete'
                  ) && (
                    <button
                      className="btn"
                      onClick={() => {
                        deleteComment(comment.commentId);
                      }}
                    >
                      <FaWindowClose></FaWindowClose>
                    </button>
                  )
                )}
              </div>

              {currentEditedComment !== index ? (
                <p className="m-3 text-break">
                  {comment.comment}
                </p>
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
                    className="btn btn-light"
                    onClick={() =>
                      fetchAuth({
                        url: `${server}/auth/comment/${comment.commentId}`,
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
                        router.replace(router.asPath);
                      })
                    }
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))
  ) : (
    <div>Không có comment nào</div>
  );
  const sortByChapterNumber = () => {
    let arr = manga.chapters && manga.chapters.slice(0);
    arr &&
      arr.sort(function (a, b) {
        return b.chapterNumber - a.chapterNumber;
      });
    manga.chapters = arr;
  };
  const triggerFavorite = () => {
    if (arr.length > 0) {
      setArr([]);
      removeElementFavorite(bookGroupId);
    } else {
      addToFavorite(bookGroupId, manga);

      setArr(JSON.parse(localStorage.getItem('favorite')));
    }
  };
  return (
    <div style={{ background: '#EBEBEB' }}>
      <div
        className="container"
        style={{ background: '#f9f9f9' }}
      >
        {sortByChapterNumber()}

        <div className="row">
          <div className="col-lg-8 col-12 mt-3">
            <div>
              <h3
                className="d-flex justify-content-center"
                style={{ color: '#27ae60' }}
              >
                {manga.name}
              </h3>
              {manga.alias && (
                <p
                  className="d-flex justify-content-center display-6"
                  style={{
                    fontStyle: 'italic',
                    fontSize: '1rem',
                  }}
                >
                  {manga.alias}
                </p>
              )}
            </div>

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
                <div className="d-flex justify-content-around ">
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
                      <FaRegStar></FaRegStar>
                      {' Rating:'}
                    </p>
                    <p>
                      <FaTags></FaTags>
                      {' Thể loại:'}
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
                                    background: '#dfe6e9',
                                    borderRadius: '0.5rem',
                                    padding: '0.25rem',
                                    fontWeight: '600',
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
                      {actualDislikeCount +
                        actualLikeCount >
                      3
                        ? (actualLikeCount /
                            (actualLikeCount +
                              actualDislikeCount)) *
                            100 +
                          '%'
                        : 'Đang cập nhật'}
                    </p>
                    <p>
                      {manga.genres.length > 0
                        ? manga.genres.map((genre) => (
                            <Link
                              key={genre.id}
                              href={`/genre/${genre.id}`}
                              passHref
                            >
                              <span
                                className={styles.object}
                                style={{
                                  background: '#dfe6e9',
                                  borderRadius: '0.5rem',
                                  padding: '0.25rem',
                                  fontWeight: '500',
                                  marginRight: '0.75rem',
                                }}
                              >
                                {genre.name}
                              </span>
                            </Link>
                          ))
                        : 'Đang cập nhật'}
                    </p>
                  </div>
                </div>
                <div className="button-utilities d-flex justify-content-between">
                  <div className=" d-flex">
                    <button
                      disabled={
                        Object.keys(userInfo).length === 0
                      }
                      type="button"
                      onClick={() => {
                        likeStateButton();
                      }}
                      className="btn btn-outline-dark me-2 "
                    >
                      <BiLike></BiLike>
                      <span className="badge bg-danger ">
                        {' ' + actualLikeCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={
                        Object.keys(userInfo).length === 0
                      }
                      className="btn  btn-outline-dark"
                      onClick={() => {
                        dislikeStateButton();
                      }}
                    >
                      <BiDislike></BiDislike>
                      <span className="badge bg-primary">
                        {actualDislikeCount}
                      </span>
                    </button>
                  </div>
                  <div className=" d-flex">
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
                          className="btn btn-dark"
                        >
                          Đọc từ đầu
                        </button>
                      </Link>
                    )}

                    <button
                      type="button"
                      className="btn btn-success ms-2 "
                      onClick={() => triggerFavorite()}
                      disabled={
                        Object.keys(userInfo).length === 0
                      }
                    >
                      <FaHeart></FaHeart>
                      {arr.length > 0
                        ? ' Bỏ Yêu Thích'
                        : 'Yêu Thích'}
                    </button>
                  </div>
                </div>

                <div className="d-flex mt-3">
                  {userInfo.permission &&
                  userInfo.permission.includes(
                    'book.modifySelf'
                  ) &&
                  userInfo.id == manga.ownerId ? (
                    <Link
                      href={'/manage-Manga/' + bookGroupId}
                      passHref
                    >
                      <button className="btn btn-dark me-2">
                        <FaEdit></FaEdit>
                      </button>
                    </Link>
                  ) : (
                    userInfo.permission &&
                    userInfo.permission.includes(
                      'book.modify'
                    ) && (
                      <Link
                        href={
                          '/manage-Manga/' + bookGroupId
                        }
                        passHref
                      >
                        <button className="btn btn-dark me-2">
                          <FaEdit></FaEdit>
                        </button>
                      </Link>
                    )
                  )}
                  {userInfo.permission &&
                    userInfo.permission.includes(
                      'book.delete'
                    ) && (
                      <button
                        className="btn btn-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteModal"
                      >
                        <FaWindowClose></FaWindowClose>
                      </button>
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
                        src={`${server}/image/${manga.coverArts[0].path}`}
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
                              src={`${server}/image/${coverArt.path}`}
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
                <div className="col-4">
                  <p>Chapter</p>
                </div>

                <div className="col-2">
                  <p>Cập nhật</p>
                </div>
                <div className="col-3">
                  <p>Người đăng</p>
                </div>
                <div className="col-1">
                  <p>Views:</p>
                </div>
                <div className="col-2"></div>
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
                      <div className="col-4">
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
                          {' ' +
                            chapter.chapterNumber +
                            ': ' +
                            (chapter.name
                              ? chapter.name
                              : '')}
                        </p>
                      </div>
                    </Link>

                    <div className="col-2">
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
                    <div className="col-1">
                      <p>
                        {chapter.views
                          ? chapter.views
                          : '0'}
                      </p>
                    </div>
                    <div className="col-2">
                      <div className="d-flex">
                        {userInfo.permission &&
                        userInfo.permission.includes(
                          'chapter.modifySelf'
                        ) &&
                        userInfo.id == manga.ownerId ? (
                          <button className="btn btn-dark me-2">
                            <FaEdit></FaEdit>
                          </button>
                        ) : (
                          userInfo.permission &&
                          userInfo.permission.includes(
                            'chapter.modify'
                          ) && (
                            <button className="btn btn-dark me-2">
                              <FaEdit></FaEdit>
                            </button>
                          )
                        )}
                        {userInfo.permission &&
                        userInfo.permission.includes(
                          'chapter.deleteSelf'
                        ) &&
                        userInfo.id == manga.ownerId ? (
                          <button className="btn btn-danger ">
                            <FaWindowClose></FaWindowClose>
                          </button>
                        ) : (
                          userInfo.permission &&
                          userInfo.permission.includes(
                            'chapter.delete'
                          ) && (
                            <button className="btn btn-danger ">
                              <FaWindowClose></FaWindowClose>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {userInfo.permission &&
                  userInfo.permission.includes(
                    'chapter.post'
                  ) && (
                    <Link
                      href={
                        '/upload-Chapter/' + bookGroupId
                      }
                      passHref
                    >
                      <div className="d-flex justify-content-end  mt-3">
                        <button className="btn btn-dark ">
                          Upload chapter mới
                        </button>
                      </div>
                    </Link>
                  )}
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
                className="row p-3 mb-2 ms-1"
                style={{
                  background: '#b2bec3',
                  borderRadius: '0.75rem',
                }}
              >
                <div className="col-lg-2 col-3">
                  <div
                    style={{
                      width: '80%',
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
                      objectFit="cover"
                      alt="Avatar"
                      layout="fill"
                    ></Image>
                  </div>
                </div>
                <div className="col-lg-10 col-9">
                  <textarea
                    type="text"
                    rows={3}
                    className="form-control"
                    name="comment"
                    placeholder="Bình luận phải có độ dài từ 10 tới 500 ký tự"
                    onChange={(e) =>
                      handleInputChange(e.target.value)
                    }
                    value={comment}
                  ></textarea>

                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="submit"
                      disabled={
                        comment.length < 10 ||
                        comment.length > 500
                      }
                      className="btn btn-dark "
                      onClick={() => submit(comment)}
                    >
                      Submit
                    </button>
                  </div>
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
                <div className="col-lg-2 col-3">
                  <div
                    style={{
                      width: '80%',
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
                      objectFit="cover"
                      alt="Avatar"
                      layout="fill"
                    ></Image>
                  </div>
                </div>
                <div className="col-lg-10 col-9">
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
      <div className="modal fade" id="deleteModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">
                Bạn có muốn xoá không?
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body d-flex justify-content-around">
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => deleteBookGroup()}
                data-bs-dismiss="modal"
              >
                Có
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      </div>
      <ScrollButton></ScrollButton>
    </div>
  );
}
