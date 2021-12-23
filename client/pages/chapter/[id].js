import DisplayImg from '../../components/display-Img/display-Img';
import { fetchAuth } from '../../utilities/fetchAuth';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { MangaContext } from '../../context/manga-Context';
import {
  FaHome,
  FaUser,
  FaAngleDoubleRight,
  FaWifi,
  FaNewspaper,
  FaEye,
  FaAngleRight,
  FaAngleLeft,
  FaQuoteLeft,
  FaQuoteRight,
  FaEdit,
  FaWindowClose,
} from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import styles from './[id].module.css';
import Image from 'next/image';
import WEB_CONSTANTS from '../../utilities/constants';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import RelativeTimestamp from '../../utilities/to-Relative-Time-stamp';
import { UserContext } from '../../context/user-Context';
import { toast } from 'react-toastify';
import ScrollButton from '../../utilities/scrollButton';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/chapter/${id}`);
  const data = await response.json();
  const res = await fetch(
    `${server}/book/${data.bookGroupId}`
  );
  const responseComment = await fetch(
    `${server}/comment/?bookChapterId=${id}`
  );
  const dataComment = await responseComment.json();
  const data1 = await res.json();

  return {
    props: {
      chapter: data,
      comments: dataComment.comments,

      book: data1,
      id,
    },
  };
}

export default function ChapterContent({
  chapter,
  comments,
  book,
  id,
}) {
  const { server } = useContext(MangaContext);
  const { userInfo } = useContext(UserContext);
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(0);
  const cmtPerPage = 5;
  const pageVisited = pageNumber * cmtPerPage;
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

  const submit = () => {
    fetchAuth({
      url: `${server}/auth/comment?bookChapterId=${id}`,
      method: `POST`,
      data: {
        comment: comment,
      },
    })
      .then((res) => {
        toast.success('Comment thành công', {
          position: 'bottom-left',
          autoClose: 3000,
        });
        setComment('');

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
  const handleInputChange = (text) => {
    setComment(text);
  };
  const checkUploader = () => {
    let checked = false;
    let res = book.chapters.filter(
      (chapter) => chapter.id == id
    );
    if (res[0].userPosted.id == userInfo.id) checked = true;
    return checked;
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
      router.replace(router.asPath);
    });
  };

  const displayData = comments ? (
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
              <Image
                src={
                  comment.userAvatar
                    ? `${server}/image/${comment.userAvatar}`
                    : NULL_CONSTANTS.AVATAR
                }
                alt=""
                layout="fill"
              />
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
                    className="btn btn-link"
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
            <div className="d-flex justify-content-end">
              {userInfo.id === comment.userId &&
                currentEditedComment !== index &&
                userInfo.permission &&
                userInfo.permission.includes(
                  'comment.modifySelf'
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
                )}
              {userInfo.id === comment.userId &&
                userInfo.permission &&
                userInfo.permission.includes(
                  'comment.deleteSelf'
                ) && (
                  <button
                    className="btn"
                    onClick={() => {
                      deleteComment(comment.commentId);
                    }}
                  >
                    <FaWindowClose></FaWindowClose>
                  </button>
                )}
            </div>
          </div>
        </div>
      ))
  ) : (
    <div>Không có comment nào</div>
  );
  const [comment, setComment] = useState('');
  function getPreviousChapter(chapterId) {
    let prevId;
    for (let i = 0; i < book.chapters.length - 1; i++) {
      if (book.chapters[i].id == chapterId) {
        prevId = i + 1;
        break;
      }
    }
    if (prevId) return book.chapters[prevId].id;
    else return null;
  }
  const prevPage = getPreviousChapter(parseInt(id));
  function getNextChapter(chapterId) {
    let prevId;
    for (let i = 1; i < book.chapters.length; i++) {
      if (book.chapters[i].id == chapterId) {
        prevId = i - 1;
        break;
      }
    }
    if (prevId != null) return book.chapters[prevId].id;
    else return null;
  }
  const nextPage = getNextChapter(parseInt(id));
  const sortByChapterNumber = () => {
    let arr = book.chapters && book.chapters.slice(0);
    arr.sort(function (a, b) {
      return b.chapterNumber - a.chapterNumber;
    });
    book.chapters = arr;
  };
  const deleteChapter = () => {
    fetchAuth({
      url: `${server}/auth/chapter/${id}`,
      method: 'DELETE',
    }).then(() => {
      toast.success('Xoá thành công', {
        position: 'bottom-left',
        autoClose: 3000,
      });
      router.replace(`/manga/${chapter.bookGroupId}`);
    });
  };
  return (
    <div style={{ background: '#2c3e50' }}>
      {sortByChapterNumber()}
      <div
        className="container"
        style={{ background: '#ecf0f1' }}
      >
        <div
          className=" col-12"
          style={{ color: '#27ae60' }}
        >
          <div className=" d-flex justify-content-start align-content-center">
            <Link href="/" passHref>
              <p className={styles.object}>
                <FaHome></FaHome>
              </p>
            </Link>
            <div className="ms-2">
              <Link
                href={`/manga/${chapter.bookGroupId}`}
                passHref
              >
                <p className={styles.object}>
                  <FaAngleDoubleRight></FaAngleDoubleRight>
                  {' ' + book.name}
                </p>
              </Link>
            </div>
            <p className="ms-2">
              <FaAngleDoubleRight></FaAngleDoubleRight>
              {' Chapter ' + chapter.chapterNumber}
            </p>
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-12 col-lg-2">
            <DisplayImg
              srcImg={
                book.primaryCoverArt
                  ? `${server}/image/${book.primaryCoverArt}`
                  : NULL_CONSTANTS.BOOK_GROUP_IMAGE
              }
            ></DisplayImg>
          </div>
          <div className="col-12 col-lg-6">
            <h3 style={{ color: '#27ae60' }}>
              {book.name}
            </h3>
            <h3 style={{ color: '#27ae60' }}>
              {' Chap ' +
                chapter.chapterNumber +
                ': ' +
                chapter?.name ?? ''}
            </h3>
            <div className="d-flex justify-content-between col-lg-6 col-12 ">
              <div>
                <p>
                  <FaUser></FaUser>
                  {' Tác giả'}
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
              </div>
              <div>
                <p>
                  {book.authors.length > 0
                    ? book.authors.map((author, index) => (
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
                      ))
                    : 'Đang cập nhật'}
                </p>
                <p>Đang cập nhật</p>
                <p style={{ color: '#27ae60' }}>
                  {book.chapters.length > 0
                    ? 'Chap ' +
                      book.chapters[0].chapterNumber
                    : 'Chưa có chap mới'}
                </p>
                <p>{book.views}</p>
              </div>
            </div>
            <div className="button-utilities"></div>
          </div>
          <div className="col-12 col-lg-4">
            {book.description && (
              <p>
                <FaQuoteLeft></FaQuoteLeft>
                {' ' + book.description + ' '}
                <FaQuoteRight></FaQuoteRight>
              </p>
            )}
            <div className="d-flex">
              {checkUploader() === true &&
              userInfo.permission &&
              userInfo.permission.includes(
                'chapter.modifySelf'
              ) ? (
                <Link href={'/edit-Chapter/' + id} passHref>
                  <button className="btn btn-dark">
                    <FaEdit></FaEdit>
                    {' Sửa Chap'}
                  </button>
                </Link>
              ) : (
                userInfo.permission &&
                userInfo.permission.includes(
                  'chapter.modify'
                ) && (
                  <Link
                    href={'/edit-Chapter/' + id}
                    passHref
                  >
                    <button className="btn btn-dark">
                      <FaEdit></FaEdit>
                      {' Sửa Chap'}
                    </button>
                  </Link>
                )
              )}
              {checkUploader() === true &&
              userInfo.permission &&
              userInfo.permission.includes(
                'chapter.deleteSelf'
              ) ? (
                <button
                  className="btn btn-danger ms-2"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteModal"
                >
                  <FaWindowClose></FaWindowClose>
                  {' Xoá Chap'}
                </button>
              ) : (
                userInfo.permission &&
                userInfo.permission.includes(
                  'chapter.delete'
                ) && (
                  <button
                    className="btn btn-danger ms-2"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteModal"
                  >
                    <FaWindowClose></FaWindowClose>
                    {' Xoá Chap'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
        <hr />
      </div>
      <div
        className="container mt-3"
        style={{ background: '#ecf0f1' }}
      >
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-success me-2 mt-3"
            disabled={prevPage == null}
            onClick={() =>
              router.replace(`/chapter/${prevPage}`)
            }
          >
            <FaAngleLeft></FaAngleLeft>
          </button>
          <div className="dropdown me-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              {'Chap ' + chapter.chapterNumber}
            </button>
            <ul className="dropdown-menu">
              {book.chapters.map((chapter, index) => (
                <Link
                  href={`/chapter/${chapter.id}`}
                  passHref
                  key={index}
                >
                  <li className="dropdown-item">
                    {'Chapter ' + chapter.chapterNumber}
                  </li>
                </Link>
              ))}
            </ul>
          </div>
          <button
            className="btn btn-success me-2 mt-3"
            disabled={nextPage == null}
            onClick={() =>
              router.replace(`/chapter/${nextPage}`)
            }
          >
            <FaAngleRight></FaAngleRight>
          </button>
        </div>
        <div>
          {chapter.type === 'images' ? (
            <div
              className="offset-md-2 col-lg-8 col-12 mt-5"
              style={{ textAlign: 'center' }}
            >
              {chapter.images.map((image, index) => (
                <div
                  className="mb-3"
                  key={index}
                  style={{
                    height: '100%',
                    aspectRatio: '3/4',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={
                      image
                        ? `${server}/image/${image.path}`
                        : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                    }
                    alt=""
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="offset-md-2 col-lg-8 col-12 mt-5">
              <ReactMarkdown
                className={styles.markDownContainer}
              >
                {chapter.textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-success me-2"
            disabled={prevPage == null}
            onClick={() =>
              router.replace(`/chapter/${prevPage}`)
            }
          >
            <FaAngleLeft></FaAngleLeft>
          </button>
          <div className="dropdown me-2">
            <button
              type="button"
              className="btn btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              {'Chap ' + chapter.chapterNumber}
            </button>
            <ul className="dropdown-menu">
              {book.chapters.map((chapter, index) => (
                <Link
                  href={`/chapter/${chapter.id}`}
                  passHref
                  key={index}
                >
                  <li className="dropdown-item">
                    {'Chapter ' + chapter.chapterNumber}
                  </li>
                </Link>
              ))}
            </ul>
            <button
              className="btn btn-success ms-2"
              disabled={nextPage == null}
              onClick={() =>
                router.replace(`/chapter/${nextPage}`)
              }
            >
              <FaAngleRight></FaAngleRight>
            </button>
          </div>
        </div>
        <div
          className=" col-12 mt-5"
          style={{ color: '#27ae60' }}
        >
          <div className=" d-flex justify-content-start ">
            <Link href="/" passHref>
              <p className={styles.object}>
                <FaHome></FaHome>
              </p>
            </Link>
            <div className="ms-2">
              <Link
                href={`/manga/${chapter.bookGroupId}`}
                passHref
              >
                <p className={styles.object}>
                  <FaAngleDoubleRight></FaAngleDoubleRight>
                  {' ' + book.name}
                </p>
              </Link>
            </div>
            <div className="ms-2">
              <p className={styles.object}>
                <FaAngleDoubleRight></FaAngleDoubleRight>
                {'  Chap ' + chapter.chapterNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="container mt-3"
        style={{ background: '#ecf0f1' }}
      >
        <div className="pt-2 col-lg-8">
          <h5
            style={{
              borderLeft: '5px solid #f1c40f',
              color: '#f1c40f',
            }}
            className="ps-2 "
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
                      className="btn btn-dark"
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
            <div id="comment-section"> {displayData}</div>

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
                onClick={() => deleteChapter()}
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
