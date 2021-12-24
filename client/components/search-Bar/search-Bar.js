import React, { useContext, useState } from 'react';
import { MangaContext } from '../../context/manga-Context';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import { FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function SearchBar() {
  const [searchWord, setSearchWord] = useState('');
  const { server } = useContext(MangaContext);
  const [listAuthors, setListAuthors] = useState([]);
  const [listMangas, setListMangas] = useState([]);
  const [listUsers, setListUsers] = useState([]);
  const router = useRouter();
  function handleFilter(event) {
    let inputSearch = event.target.value;
    if (inputSearch) {
      fetch(`${server}/search-author/${inputSearch}`)
        .then((res) => res.json())
        .then((data) => setListAuthors(data));
      fetch(`${server}/search-suggest/${inputSearch}`)
        .then((res) => res.json())
        .then((data) => setListMangas(data.books));
      fetch(`${server}/search-user/${inputSearch}`)
        .then((res) => res.json())
        .then((data) => setListUsers(data));
    } else {
      setListAuthors([]);
      setListMangas([]);
      setListUsers([]);
    }
    setSearchWord(inputSearch);
  }
  function clearInput() {
    setSearchWord('');
    setListAuthors([]);
    setListMangas([]);
    setListUsers([]);
  }

  return (
    <div>
      <div>
        <input
          type="text"
          className="form-control me-2"
          placeholder="Tìm kiếm"
          aria-label="Search"
          data-bs-toggle="modal"
          data-bs-target="#searchModal"
          value={''}
          disabled
        />
      </div>

      <div
        className="modal "
        id="searchModal"
        aria-labelledby="searchModal"
        aria-hidden="true"
      >
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
                  <h5>Truyện</h5>
                  <button
                    className="btn"
                    type="button"
                    data-bs-dismiss="modal"
                    onClick={() =>
                      router.replace(
                        `/search-Manga-Result/${searchWord}`
                      )
                    }
                  >
                    <FaArrowRight></FaArrowRight>
                  </button>
                </div>

                <div className="p-2">
                  {listMangas?.length
                    ? listMangas
                        .slice(0, 5)
                        .map((manga, index) => (
                          <div
                            className="row mb-3"
                            style={{
                              background: '#34495e',
                              borderRadius: '5px',
                              height: '100px',
                            }}
                            key={index}
                            onClick={() => {
                              clearInput();
                              router.replace(
                                `/manga/${manga.id}`
                              );
                            }}
                            data-bs-dismiss="modal"
                          >
                            <div
                              className="col-2   pt-2"
                              style={{
                                width: '100px',
                                aspectRatio: '1/1',
                                overflow: 'hidden',
                                borderRadius: '0.75rem',
                              }}
                            >
                              <Image
                                src={
                                  manga.image
                                    ? `${server}/image/${manga.image}`
                                    : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                                }
                                alt="manga Image"
                                width={'50'}
                                height={'50'}
                                layout="responsive"
                                objectFit="cover"
                              />
                            </div>
                            <div
                              className="col-4 mt-3"
                              style={{ color: '#ecf0f1' }}
                            >
                              <h5>{manga.title}</h5>
                              <p>
                                {manga.latestChapter
                                  ? 'Chapter ' +
                                    manga.latestChapter
                                  : 'Không có chapter'}
                              </p>
                            </div>
                          </div>
                        ))
                    : 'Không có kết quả'}
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between">
                    <h5>Tác giả</h5>
                  </div>
                  <div className="p-2">
                    {listAuthors?.length ? (
                      listAuthors
                        .slice(0, 5)
                        .map((author, index) => (
                          <div
                            className="row mb-3 mx-2"
                            style={{
                              background: '#7f8c8d',
                              borderRadius: '5px',
                            }}
                            key={index}
                            onClick={() => {
                              clearInput();
                              router.replace(
                                `/author/${author.id}`
                              );
                            }}
                            data-bs-dismiss="modal"
                          >
                            <div
                              className="col-2 pt-2 "
                              style={{
                                width: '80px',
                                aspectRatio: '1/1',
                                overflow: 'hidden',
                                borderRadius: '0.75rem',
                              }}
                            >
                              <Image
                                src={
                                  author.image
                                    ? `${server}/image/${author.image}`
                                    : NULL_CONSTANTS.AVATAR
                                }
                                alt="Author Image"
                                width={'60'}
                                height={'60'}
                                layout="responsive"
                                objectFit="cover"
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
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between">
                  <h5>Người dùng</h5>
                </div>

                <div className="p-2">
                  {listUsers?.length
                    ? listUsers
                        .slice(0, 5)
                        .map((user, index) => (
                          <div
                            className="row mb-3 mx-2"
                            style={{
                              background: '#34495e',
                              borderRadius: '5px',
                              height: '100px',
                            }}
                            key={index}
                            onClick={() => {
                              clearInput();
                              router.replace(
                                `/user/${user.id}`
                              );
                            }}
                            data-bs-dismiss="modal"
                          >
                            <div
                              className="col-2   pt-2"
                              style={{
                                width: '100px',
                                aspectRatio: '1/1',
                                overflow: 'hidden',
                                borderRadius: '0.75rem',
                              }}
                            >
                              <Image
                                src={
                                  user.image
                                    ? `${server}/image/${user.image}`
                                    : NULL_CONSTANTS.AVATAR
                                }
                                alt="manga Image"
                                width={'50'}
                                height={'50'}
                                layout="responsive"
                                objectFit="cover"
                              />
                            </div>
                            <div
                              className="col-4 mt-3"
                              style={{ color: '#ecf0f1' }}
                            >
                              <h5>{user.name}</h5>
                            </div>
                          </div>
                        ))
                    : 'Không có kêt quả'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={clearInput}
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
