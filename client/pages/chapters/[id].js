import DisplayImg from '../../components/displayImg';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { MangaContext } from '../../Context/MangaContext';
import { FaHome, FaBackward, Fa } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import NULL_CONSTANTS from '../../utilities/nullConstants';

export async function getServerSideProps(context) {
  const server = 'http://113.22.75.159:7001';
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
    },
  };
}

export default function chapterContent({ chapter, book }) {
  const { server } = useContext(MangaContext);
  return (
    <div className="container mt-5">
      <ul className="breadcrumb">
        <Link href="/">
          <li className="breadcrumb-item">
            <FaHome></FaHome>
          </li>
        </Link>
        <li className="breadcrumb-item">
          <Link href={`/mangas/${chapter.bookGroupId}`}>
            <li className="breadcrumb-item">{book.name}</li>
          </Link>
        </li>

        <li className="breadcrumb-item active">
          <li className="breadcrumb-item">
            {'Chap ' + chapter.chapterNumber}
          </li>
        </li>
      </ul>
      <div className="row mt-2">
        <div className="col-12 col-lg-2">
          <DisplayImg
            srcImg={
              book.primaryCoverArt
                ? `${server}/image/${book.primaryCoverArt}`
                : NULL_CONSTANTS.BOOK_GROUP_IMAGE
            }
            height="282px"
          ></DisplayImg>
        </div>
        <div className="col-12 col-lg-6">
          <h3>
            {book.name + ' chap ' + chapter.chapterNumber}
          </h3>
          <div className="d-flex justify-content-between col-lg-4 col-12 ">
            <div>
              <p>Tác giả</p>
              <p>Tình trạng</p>
              <p>Mới nhất</p>
              <p>Lượt đọc</p>
            </div>
            <div>
              <p>
                {book.authors.length > 0
                  ? book.authors.map((author) => (
                      <Link href={`/authors/${author.id}`}>
                        <span>{author.name + ', '}</span>
                      </Link>
                    ))
                  : 'Đang cập nhật'}
              </p>
              <p>Đang cập nhật</p>
              <p style={{ color: 'red' }}>
                {book.chapters.length > 0
                  ? 'Chap ' + book.chapters[0].chapterNumber
                  : 'Chưa có chap mới'}
              </p>
              <p>{book.views}</p>
            </div>
          </div>
          <div className="button-utilities">
            <button
              type="button"
              class="btn btn-success me-2"
            >
              Thích
              <span className="badge bg-danger">
                {book.likeCount}
              </span>
            </button>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <p>{book.description}</p>
        </div>
      </div>
      <hr />
      <div className="d-flex justify-content-center">
        <button className="btn btn-success me-2">←</button>
        <div className="dropdown me-2">
          <button
            type="button"
            class="btn btn-outline-secondary dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            {'Chap ' + chapter.chapterNumber}
          </button>
          <ul className="dropdown-menu">
            {book.chapters.map((chapter) => (
              <Link href={`/chapters/${chapter.id}`}>
                <li className="dropdown-item">
                  {'Chapter ' + chapter.chapterNumber}
                </li>
              </Link>
            ))}
          </ul>
        </div>
        <button className="btn btn-success">→</button>
      </div>
      <div className="offset-md-2 col-lg-8 col-12 mt-5">
        {chapter.type === 'images' ? (
          chapter.images.map((image) => (
            <div className="mb-3" data-aos="fade-up">
              <img
                src={`${server}/image/${image}`}
                alt=""
                width="100%"
              />
            </div>
          ))
        ) : (
          <ReactMarkdown
            children={chapter.textContent}
          ></ReactMarkdown>
        )}
      </div>
      <div className="d-flex justify-content-center">
        <button className="btn btn-success me-2">←</button>
        <div className="dropdown me-2">
          <button
            type="button"
            class="btn btn-outline-secondary dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            {'Chap ' + chapter.chapterNumber}
          </button>
          <ul className="dropdown-menu">
            {book.chapters.map((chapter) => (
              <Link href={`/chapters/${chapter.id}`}>
                <li className="dropdown-item">
                  {'Chapter ' + chapter.chapterNumber}
                </li>
              </Link>
            ))}
          </ul>
          <button className="btn btn-success ms-2">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
