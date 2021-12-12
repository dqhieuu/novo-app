import { useContext, useState } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import DisplayImg from '../../components/displayImg';
import WEB_CONSTANTS from '../../utilities/constants';

export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/search/${id}`);
  const data = await response.json();

  return {
    props: {
      manga: data.books,
      textSearch: id,
    },
  };
}

export default function SearchResult({
  manga,
  textSearch,
}) {
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
        Kết quả tìm kiếm của {textSearch}
      </h3>
      {manga.length != 0 ? (
        <div className="row">
          {sliceArrManga.map((listObject) => (
            <Link
              href={`/mangas/${listObject.id}`}
              key={listObject.id}
              passHref
            >
              <div
                className="col-6 col-lg-3 col-md-4 col-xl-2"
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
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <h1>Oops...</h1>
          <h2>
            Giữa biển người tấp nập, có lẽ chúng mình chẳng
            hề có duyên với nhau😢
          </h2>
          <p>
            Thôi thì mình cùng trở về
            <span>
              {' '}
              <Link href="/">trang chủ</Link>
            </span>{' '}
            bạn nhé
          </p>
        </div>
      )}
    </div>
  );
}
