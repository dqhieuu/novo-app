import { useState } from 'react';
import { useContext } from 'react';
import { MangaContext } from '../../context/manga-Context';
import DisplayImg from '../display-Img/display-Img';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import Link from 'next/link';
import ReactPaginate from 'react-paginate';

function ByMonth() {
  const { mostViewedMonth, server } =
    useContext(MangaContext);
  const [pageNumber, setPageNumber] = useState(0);
  const bookPerPage = 12;
  const pageVisited = pageNumber * bookPerPage;
  const displayDatas = mostViewedMonth
    .slice(pageVisited, pageVisited + bookPerPage)
    .map((listObject, index) => (
      <Link
        href={`/manga/${listObject.id}`}
        key={index}
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
          ></DisplayImg>
        </div>
      </Link>
    ));
  const pageCount = Math.ceil(
    mostViewedMonth.length / bookPerPage
  );
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <div>
      <div className="row">{displayDatas}</div>
      <div className="mt-3 d-flex justify-content-center">
        {' '}
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
  );
}

export default ByMonth;
