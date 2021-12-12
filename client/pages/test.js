import React from 'react';
import { useState, useContext } from 'react';
import Link from 'next/link';
import { MangaContext } from '../Context/MangaContext';
import NULL_CONSTANTS from '../utilities/nullConstants';
import { FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/router';
export default function SearchBar() {
  const [searchWord, setSearchWord] = useState('');
  const { server } = useContext(MangaContext);
  const [listAuthors, setListAuthors] = useState([]);
  const [listMangas, setListMangas] = useState([]);
  const router = useRouter();
  async function handleFilter(event) {
    let inputSearch = event.target.value;
    if (inputSearch) {
      await fetch(`${server}/search-author/${inputSearch}`)
        .then((res) => res.json())
        .then((data) => setListAuthors(data));
      await fetch(`${server}/search-suggest/${inputSearch}`)
        .then((res) => res.json())
        .then((data) => setListMangas(data.books));
    } else {
      setListAuthors([]);
      setListMangas([]);
    }
    setSearchWord(inputSearch);
  }

  return (
    <div>
      <form>
        <div
          className="search-Input"
          style={{ position: 'relative' }}
        >
          <input
            type="text"
            className="form-control me-2"
            placeholder="Tìm kiếm"
            aria-label="Search"
            data-bs-toggle="modal"
            data-bs-target="#myModal"
            value={''}
          />
        </div>
      </form>

      <div className="modal fade" id="myModal">
        <div className="modal-dialog  modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">
                Kết quả tìm kiếm
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Tìm kiếm"
                aria-label="Search"
                value={searchWord}
                onChange={handleFilter}
              />
              <div className="mt-3">
                <div className="d-flex justify-content-between">
                  <h5>Tác giả</h5>
                  <button className="btn" type="button">
                    <FaArrowRight></FaArrowRight>
                  </button>
                </div>
                <div className="p-2">
                  {listAuthors.length > 0 ? (
                    listAuthors
                      .slice(0, 5)
                      .map((author) => (
                        <div
                          className="row mb-3"
                          style={{
                            background: '#7f8c8d',
                            borderRadius: '5px',
                          }}
                        >
                          <div className="col-2">
                            <img
                              src={
                                author.image
                                  ? `${server}/image/${author.image}`
                                  : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                              }
                              width={'50%'}
                              alt="Author Image"
                              style={{
                                borderRadius: '5px',
                              }}
                            />
                          </div>
                          <div
                            className="col-4"
                            style={{ color: '#ecf0f1' }}
                          >
                            <h5>{author.name}</h5>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div>Không có kết quả</div>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between">
                  <h5>Truyện</h5>
                  <button
                    className="btn"
                    type="button"
                    data-bs-dismiss="modal"
                    onClick={() =>
                      router.replace(
                        `/searchMangaResults/${searchWord}`
                      )
                    }
                  >
                    <FaArrowRight></FaArrowRight>
                  </button>
                </div>

                <div className="p-2">
                  {listMangas.length != 0 &&
                    listMangas.slice(0, 5).map((manga) => (
                      <div
                        className="row mb-3"
                        style={{
                          background: '#34495e',
                          borderRadius: '5px',
                          height: '100px',
                        }}
                      >
                        <div className="col-2 m-2">
                          <img
                            src={
                              manga.image
                                ? `${server}/image/${manga.image}`
                                : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                            }
                            width={'50%'}
                            alt="Author Image"
                            style={{
                              borderRadius: '5px',
                              objectFit: 'cover',
                              border: '1px solid lightgrey',
                            }}
                          />
                        </div>
                        <div
                          className="col-4 mt-3"
                          style={{ color: '#ecf0f1' }}
                        >
                          <h5>{manga.title}</h5>
                          <p>
                            Chapter
                            {' ' + manga.latestChapter}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
