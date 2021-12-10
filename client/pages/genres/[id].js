import { useContext, useState } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import DisplayImg from '../../components/displayImg';

export async function getServerSideProps(context) {
  const server = 'http://113.22.75.159:7001';
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/genre/${id}`);
  const data = await response.json();

  return {
    props: {
      manga: data.books,
      id,
    },
  };
}

export default function genreManga({ manga, id }) {
  const { server } = useContext(MangaContext);
  const [number, setNumber] = useState(12);
  const sliceArrManga = manga.slice(0, number);

  const loadMore = () => {
    setNumber(number + number);
  };
  return (
    <div className="container">
      <h3
        style={{ textAlign: 'center', color: 'green' }}
        className="mb-5 pt-5"
      >
        Các truyện cùng thể loại
      </h3>
      <div className="row">
        {sliceArrManga.map((listObject) => (
          <Link href={`/mangas/${listObject.id}`}>
            <div
              className="col-6 col-lg-3 col-md-4 col-xl-2 mb-3"
              data-aos="fade-up"
            >
              <DisplayImg
                bgColor="green"
                srcImg={
                  listObject.image
                    ? `${server}/image/${listObject.image}`
                    : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                }
                text={listObject.views + ' lượt đọc'}
                title={listObject.title}
                height="282px"
              ></DisplayImg>
            </div>
          </Link>
        ))}
        <div className="d-flex justify-content-center">
          {' '}
          <button
            className="btn btn-dark"
            onClick={() => loadMore()}
            disabled={number >= manga.length}
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}
