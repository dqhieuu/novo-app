import { useContext, useState } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../context/manga-Context';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import DisplayImg from '../../components/display-Img/display-Img';
import WEB_CONSTANTS from '../../utilities/constants';
import ReactPaginate from 'react-paginate';
import Image from 'next/image';
import ScrollButton from '../../utilities/scrollButton';
import { FaEdit } from 'react-icons/fa';
import uploadImages from '../../utilities/upload-Images';
import { fetchAuth } from '../../utilities/fetchAuth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/author/${id}`);
  const data = await response.json();

  return {
    props: {
      author: data,
      authorId: id,
    },
  };
}

export default function Author({ author, authorId }) {
  const [authorDetail, setAuthorDetail] = useState({
    name: author.name,
    alias: author.alias,
    description: author.description,
  });
  const { server } = useContext(MangaContext);
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(0);
  const bookPerPage = 6;
  const pageVisited = pageNumber * bookPerPage;
  const displayDatas =
    author.books &&
    author.books.length > 0 &&
    author.books
      .slice(pageVisited, pageVisited + bookPerPage)
      .map((book) => (
        <Link
          href={`/manga/${book.id}`}
          passHref
          key={book.id}
        >
          <div
            className="col-lg-2 col-12"
            data-aos="fade-up"
          >
            <DisplayImg
              srcImg={
                book.image
                  ? `${server}/image/${book.image}`
                  : '/public/images/null-Book.png'
              }
              text={'Chap ' + book.latestChapter}
              title={book.title}
              bgColor="green"
            ></DisplayImg>
          </div>
        </Link>
      ));
  const pageCount = Math.ceil(
    author.books.length / bookPerPage
  );
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };
  const [authorAvatar, setAuthorAvatar] = useState({});

  const submit = (e) => {
    e.preventDefault();
    fetchAuth({
      url: `${server}/auth/author/${authorId}`,
      method: `PATCH`,
      data: {
        name: authorDetail.name || null,
        alias: authorDetail.alias,
        description: authorDetail.description,
        avatar: authorAvatar.id,
      },
    })
      .then((res) => {
        toast.success('Sửa thông tin thành công', {
          position: 'bottom-left',
          autoClose: 2000,
        });
        router.replace(`/author/${authorId}`);
      })
      .catch((err) => {
        toast.error(
          'Sửa thông tin thất bại. Vui lòng thử lại!',
          {
            position: 'bottom-left',
            autoClose: 2000,
          }
        );
      });
  };
  const deleteAuthor = (e) => {
    e.preventDefault();
    fetchAuth({
      url: `${server}/auth/author/${authorId}`,
      method: 'DELETE',
    }).then(() => {
      toast.success('Xoá thành công', {
        position: 'bottom-left',
        autoClose: 2000,
      });
      router.replace('/');
    });
  };
  const handlePreviewAvatar = (e) => {
    const file = e.target.files[0];
    const fileURL = URL.createObjectURL(file);
    const preview = {
      status: 'uploading',
      fileURL,
      id: 0,
    };
    setAuthorAvatar(preview);
    uploadImages('author-avatar', file, (res) => {
      if (res) {
        preview.id = res.id;
        preview.status = 'finished';
      } else {
        preview.status = 'failed';
      }
      setAuthorAvatar(preview);
    });
  };

  return (
    <div>
      <div
        className="author-gradient container-fluid"
        data-aos="fade-in"
      ></div>
      <div className="mt-3 container">
        <div className="row">
          <div className="col-lg-2 col-12 pe-2 ">
            <div
              className="author-img"
              style={{
                overflow: 'hidden',
                borderRadius: '50%',
                width: '180px',
                aspectRatio: '1/1',
                border: '5px solid #95a5a6',
              }}
            >
              <Image
                width={50}
                height={50}
                layout="responsive"
                src={
                  author.avatar
                    ? `${server}/image/${author.avatar}`
                    : NULL_CONSTANTS.AVATAR
                }
                alt="Avatar"
              />
            </div>
          </div>
          <div className="col-lg-9 col-12">
            <div className="d-flex">
              <h3>{author.name}</h3>
              <button
                className="btn btn-light ms-2"
                data-bs-toggle="modal"
                data-bs-target="#editAuthorInfo"
              >
                <FaEdit></FaEdit>
              </button>
            </div>
            <br />
            <h5>Mô tả</h5>
            <p style={{ wordBreak: 'break-all' }}>
              {author.description.length > 0
                ? author.description
                : 'Chưa có mô tả'}
            </p>
            <h5>Sáng tác</h5>
            <div className="row">{displayDatas}</div>
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

      <ScrollButton></ScrollButton>
      <div
        className="modal fade"
        id="editAuthorInfo"
        aria-labelledby="editAuthorInfo"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title"
                id="exampleModalLabel"
              >
                Chỉnh sửa tác giả
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3 mt-3">
                  <label className="form-label">
                    Tên tác giả:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="authorName"
                    placeholder="Nhập tên tác giả"
                    name="authorName"
                    value={authorDetail.name}
                    onChange={(e) =>
                      setAuthorDetail({
                        ...authorDetail,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Tên thay thế
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="alias"
                    placeholder="Nhập tên thay thế, ngăn cách nhau bởi dấu ;"
                    name="alias"
                    value={authorDetail.alias}
                    onChange={(e) =>
                      setAuthorDetail({
                        ...authorDetail,
                        alias: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Mô tả:
                  </label>
                  <textarea
                    className="form-control"
                    name="description"
                    id="description"
                    rows="3"
                    value={authorDetail.description}
                    onChange={(e) =>
                      setAuthorDetail({
                        ...authorDetail,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Avatar:
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handlePreviewAvatar}
                  />
                  <div className="mt-3 d-flex justify-content-center">
                    <div
                      style={{
                        width: '200px',
                        aspectRatio: '3/4',
                        position: 'relative',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={
                          authorAvatar.fileURL
                            ? authorAvatar.fileURL
                            : author.avatar
                            ? `${server}/image/${author.avatar}`
                            : NULL_CONSTANTS.AVATAR
                        }
                        alt="author Avatar"
                        objectFit="cover"
                        layout="fill"
                      ></Image>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <button
                    type="submit"
                    className="btn btn-dark"
                    data-bs-dismiss="modal"
                    onClick={(e) => submit(e)}
                  >
                    Submit
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                    onClick={(e) => deleteAuthor(e)}
                  >
                    Xoá tác giả
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
