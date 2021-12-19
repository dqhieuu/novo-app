import React from 'react';
import { useState, useContext } from 'react';
import { MangaContext } from '../../Context/MangaContext';
export default function AuthorBar() {
  const [searchWord, setSearchWord] = useState('');
  const { server } = useContext(MangaContext);
  const [listObjects, setListObjects] = useState([]);

  async function handleFilter(event) {
    let inputSearch = event.target.value;
    if (inputSearch) {
      await fetch(`${server}/search-author/${inputSearch}`)
        .then((res) => res.json())
        .then((data) => setListObjects(data));

      console.log(listObjects, inputSearch);
    } else {
      setListObjects([]);
    }

    setSearchWord(inputSearch);
  }

  return (
    <form>
      <div
        className="search-Input"
        style={{ position: 'relative' }}
      >
        <input
          type="text"
          className="form-control me-2"
          placeholder="Nhập tên tác giả"
          aria-label="Search"
          value={searchWord}
          onChange={handleFilter}
        />
        {listObjects.length != 0 && (
          <div
            className="dataResult"
            style={{ position: 'absolute' }}
          >
            {listObjects.slice(0, 10).map((author) => {
              return (
                <div
                  key={author.id}
                  className="dataItem "
                  onClick={() => setSearchWord(author.name)}
                >
                  {author.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </form>
  );
}
