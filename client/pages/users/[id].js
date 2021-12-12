import { useContext, useState } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import DisplayImg from '../../components/displayImg';
import WEB_CONSTANTS from '../../utilities/constants';
import ReactPaginate from 'react-paginate';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/user/${id}`);
  const data = await response.json();

  return {
    props: {
      user: data,
    },
  };
}

export default function User({ user }) {
  const { server } = useContext(MangaContext);
  const [pageNumber, setPageNumber] = useState(0);
  const bookPerPage = 4;
  const pageVisited = pageNumber * bookPerPage;
  const displayDatas = user.booksPosted ? (
    user.booksPosted
      .slice(pageVisited, pageVisited + bookPerPage)
      .map((listObject) => (
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
      ))
  ) : (
    <div>Chưa đăng truyện nào</div>
  );
  const pageCount = Math.ceil(
    user.booksPosted &&
      user.booksPosted.length / bookPerPage
  );
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };
  return (
    <div>
      <div
        className="author-gradient container-fluid"
        data-aos="fade-in"
      ></div>
      <div className="container ">
        <div className="row">
          <div className="col-lg-2 col-12 image-container">
            <img
              className="rounded-circle"
              data-aos="fade-down"
              src={
                user.avatar
                  ? `${server}/image/${user.avatar}`
                  : NULL_CONSTANTS.AVATAR
              }
              width={'100%'}
              style={{ border: '2px solid white' }}
            ></img>
          </div>
          <div className="col-lg-8 col-12 ps-5 pt-2">
            <h3>{user.name}</h3>

            <ul
              className="nav nav-tabs nav-justified"
              id="myTab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="personalInfo-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#personalInfo"
                  type="button"
                  role="tab"
                  aria-controls="personalInfo"
                  aria-selected="true"
                >
                  THÔNG TIN
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="upload-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#upload"
                  type="button"
                  role="tab"
                  aria-controls="upload"
                  aria-selected="false"
                >
                  UPLOAD
                </button>
              </li>
            </ul>
            <div className="tab-content mt-3 ">
              <div
                className="tab-pane active"
                id="personalInfo"
                role="tabpanel"
                aria-labelledby="personalInfo-tab"
              >
                <p>
                  {user.description
                    ? user.description
                    : 'Chưa có mô tả'}
                </p>
                <h5>Role</h5>
                <p>{user.role}</p>
              </div>
              <div
                className="tab-pane "
                id="upload"
                role="tabpanel"
                aria-labelledby="upload-tab"
              >
                <div className="row"> {displayDatas}</div>
                <div className="mt-3 d-flex justify-content-center">
                  {user.booksPosted && (
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
                      breakLabel="..."
                      breakClassName="page-item"
                      breakLinkClassName="page-link"
                      containerClassName="pagination"
                      activeClassName="active"
                      renderOnZeroPageCount={null}
                    ></ReactPaginate>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
