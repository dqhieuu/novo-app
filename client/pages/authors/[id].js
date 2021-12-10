import { useContext, useState } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import DisplayImg from '../../components/displayImg';

export async function getServerSideProps(context) {
  const server = 'http://113.22.75.159:7001';
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/author/${id}`);
  const data = await response.json();

  return {
    props: {
      author: data,
    },
  };
}

export default function Author({ author }) {
  const { server } = useContext(MangaContext);
  const [number, setNumber] = useState(4);
  const sliceArrBook = author.books.slice(0, number);

  const loadMore = () => {
    setNumber(number + number);
  };
  return (
    <div>
      <div
        className="author-gradient container-fluid"
        data-aos="fade-in"
      >
        <img
          className="rounded-circle"
          data-aos="fade-down"
          src={
            author.avatar
              ? `${server}/image/${author.avatar}`
              : NULL_CONSTANTS.BOOK_GROUP_IMAGE
          }
        ></img>
      </div>
      <div className="mt-3 container">
        <div className="row">
          <div className="col-lg-2 col-12 author-detail"></div>
          <div className="col-lg-9 col-12">
            <h3>{author.name}</h3>
            <br />
            <h5>Mô tả</h5>
            <p style={{ wordBreak: 'break-all' }}>
              {author.description}
            </p>
            <h5>Sáng tác</h5>
            <div className="row">
              {author.books.length > 0 &&
                sliceArrBook.map((book) => (
                  <Link href={`/mangas/${book.id}`}>
                    <div
                      className="col-lg-3 col-12"
                      data-aos="fade-up"
                    >
                      <DisplayImg
                        srcImg={
                          book.image
                            ? `${server}/image/${book.image}`
                            : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                        }
                        text={'Chap ' + book.latestChapter}
                        title={book.title}
                        height="205px"
                        bgColor="green"
                      ></DisplayImg>
                    </div>
                  </Link>
                ))}
            </div>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-dark"
                onClick={() => loadMore()}
                disabled={number >= author.books.length}
              >
                Load More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
