import { useContext, useState } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../context/manga-Context';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import DisplayImg from '../../components/display-Img/display-Img';
import WEB_CONSTANTS from '../../utilities/constants';
import ReactPaginate from 'react-paginate';
import ScrollButton from '../../utilities/scrollButton';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
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

export default function GenreManga({ manga, id }) {
  const { server } = useContext(MangaContext);
  const [pageNumber, setPageNumber] = useState(0);
  const bookPerPage = 12;
  const pageVisited = pageNumber * bookPerPage;
  const displayDatas = manga
    .slice(pageVisited, pageVisited + bookPerPage)
    .map((listObject, index) => (
      <Link
        href={`/manga/${listObject.id}`}
        passHref
        key={index}
      >
        <div
          className="col-6 col-lg-3 col-md-4 col-xl-2 mb-3"
          data-aos="fade-up"
        >
          <DisplayImg
            bgColor="green"
            srcImg={
              listObject.image
                ? `${server}/image/${listObject.image}`
                : (NULL_CONSTANTS.BOOK_GROUP_IMAGE = '')
            }
            text={listObject.views + ' lượt đọc'}
            title={listObject.title}
            height="282px"
          ></DisplayImg>
        </div>
      </Link>
    ));
  const pageCount = Math.ceil(manga.length / bookPerPage);
  const changePage = ({ selected }) => {
    setPageNumber(selected);
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
      <ScrollButton></ScrollButton>
    </div>
  );
}
