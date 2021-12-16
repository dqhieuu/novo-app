import { useState, useContext } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import { useRouter } from 'next/router';

export default function SearchBar() {
  const [searchWord, setSearchWord] = useState('');
  const { server } = useContext(MangaContext);
  const [listObjects, setListObjects] = useState([]);
  const router = useRouter();

  function deleteDisplay() {
    setSearchWord('');
    setListObjects([]);
  }
  async function handleFilter(event) {
    let inputSearch = event.target.value;
    if (inputSearch) {
      await fetch(`${server}/search-suggest/${inputSearch}`)
        .then((res) => res.json())
        .then((data) => setListObjects(data.books));
    } else {
      setListObjects([]);
    }

    setSearchWord(inputSearch);
  }
  function handleSubmit(e) {
    e.preventDefault();
    deleteDisplay();
    router.replace(`/searchMangaResults/${searchWord}`);
  }
  return (
    <form onSubmit={handleSubmit}>
      <div
        className="search-Input"
        style={{ position: 'relative' }}
      >
        <input
          type="text"
          className="form-control me-2"
          placeholder="Nhập tên tác giả, tên truyện"
          aria-label="Search"
          value={searchWord}
          onChange={handleFilter}
        />
        {listObjects.length != 0 && (
          <div
            className="dataResult"
            style={{ position: 'absolute' }}
            onClick={deleteDisplay}
          >
            {listObjects.slice(0, 10).map((manga) => {
              return (
                <Link
                  href={'/mangas/' + manga.id}
                  key={manga.id}
                >
                  <a style={{ textDecoration: 'none' }}>
                    <div className="dataItem ">
                      <img
                        src={
                          manga.image
                            ? `${server}/image/${manga.image}`
                            : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                        }
                        alt=""
                        style={{
                          justifySelf: 'flex-start',

                          height: '100%',
                          aspectRatio: '16/9',
                          objectFit: 'cover',
                        }}
                      />
                      <div
                        className="dataItem-details"
                        style={{ width: '100%' }}
                      >
                        <p>{manga.title}</p>
                        <p>
                          {'Chap ' + manga.latestChapter}
                        </p>
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </form>
  );
}
