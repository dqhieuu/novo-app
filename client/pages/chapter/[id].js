import DisplayImg from '../../components/display-Img/display-Img';
import Link from 'next/link';
import { useContext } from 'react';
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
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import styles from './[id].module.css';
import Image from 'next/image';
import WEB_CONSTANTS from '../../utilities/constants';
import NULL_CONSTANTS from '../../utilities/null-Constants';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/chapter/${id}`);
  const data = await response.json();
  const res = await fetch(
    `${server}/book/${data.bookGroupId}`
  );
  const data1 = await res.json();

  return {
    props: {
      chapter: data,
      book: data1,
      id,
    },
  };
}

export default function ChapterContent({
  chapter,
  book,
  id,
}) {
  const { server } = useContext(MangaContext);
  const router = useRouter();

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
            <div className="ms-2">
              <p className={styles.object}>
                <FaAngleDoubleRight></FaAngleDoubleRight>
                {'  Chap ' + chapter.chapterNumber}
              </p>
            </div>
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
              {book.name +
                ' chap ' +
                chapter.chapterNumber +
                ' ' +
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
                <div className="mb-3" key={index}>
                  <Image
                    src={
                      image
                        ? `${server}/image/${image.path}`
                        : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                    }
                    alt=""
                    width={'700'}
                    height={'700'}
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
      </div>
    </div>
  );
}
