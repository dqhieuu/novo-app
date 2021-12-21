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

  const submit = (text) => {
    fetchAuth({
      url: `${server}/auth/comment?bookChapterId=${id}`,
      method: `POST`,
      data: {
        comment: text,
      },
    })
      .then((res) => {
        toast.success('Comment thành công', {
          position: 'bottom-left',
          autoClose: 3000,
        });
        setComment('');

        router.replace(`/manga/${id}#comment-section`);
      })
      .catch((err) => {
        toast.error('Comment thất bại', {
          position: 'bottom-left',
          autoClose: 3000,
        });
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
                width: '80%',
                borderRadius: '50%',
                aspectRatio: '1/1',
                overflow: 'hidden',
                position: 'relative',
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
                objectFit="cover"
              />
            </div>
          </div>
          <div
            className="col-lg-10 col-9"
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
                        router.replace(
                          `/chapter/${id}#comment-section`
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

  return (
    <div style={{ background: '#2c3e50' }}>
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
                <p
                  style={{ color: '#27ae60' }}
                  className={styles.object}
                >
                  {book.authors.length > 0
                    ? book.authors.map((author) => (
                        <Link
                          href={`/author/${author.id}`}
                          key={author.id}
                          passHref
                        >
                          <span>{author.name + ', '}</span>
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
          <button
            type="button"
            className="btn btn-outline-success me-2 mt-3"
          >
            {'Thích '}
            <span className="badge bg-danger">
              {+book.likeCount}
            </span>
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
                  style={{}}
                >
                  <Image
                    src={
                      image
                        ? `${server}/image/${image.path}`
                        : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                    }
                    alt=""
                    width={'700'}
                    layout="responsive"
                    height={'1000'}
                    objectFit="cover"
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
            <button
              type="button"
              className="btn btn-outline-success ms-2"
            >
              {'Thích '}
              <span className="badge bg-danger">
                {book.likeCount}
              </span>
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
      </div>
    </div>
  );
}
