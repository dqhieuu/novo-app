import { useState } from 'react';
import { useContext } from 'react';
import { MangaContext } from '../../Context/MangaContext';
import DisplayImg from '../displayImg';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import Link from 'next/link';
function ByAll() {
  const { mostViewedAll, server } =
    useContext(MangaContext);
  const [number, setNumber] = useState(12);
  const sliceArrYear = mostViewedAll.slice(0, number);

  const loadMore = () => {
    setNumber(number + number);
  };
  return (
    <div className="row">
      {sliceArrYear.map((listObject) => (
        <Link href={`/mangas/${listObject.id}`}>
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
          disabled={number >= mostViewedAll.length}
        >
          Load More
        </button>
      </div>
    </div>
  );
}

export default ByAll;
