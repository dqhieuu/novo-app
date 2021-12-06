import { useState, useContext } from "react";
import Link from "next/link";
import { MangaContext } from "../../Context/MangaContext";
export default function SearchBar() {
  const [searchWord, setSearchWord] = useState("");
  const { listObjects } = useContext(MangaContext);

  const [filterData, setFilterData] = useState([]);

  function deleteDisplay() {
    setSearchWord("");
    setFilterData([]);
  }
  const handleFilter = (event) => {
    const inputSearch = event.target.value;

    const newFilter = listObjects.filter((book) => {
      return book.title.toLowerCase().includes(inputSearch.toLowerCase());
    });
    if (inputSearch === "") {
      setFilterData([]);
    } else setFilterData(newFilter);
    setSearchWord(inputSearch);
  };
  return (
    <form>
      <div className="searchInput d-flex " style={{ position: "relative" }}>
        <input
          type="text"
          className="form-control me-2"
          placeholder="Tìm kiếm tại đây"
          aria-label="Search"
          value={searchWord}
          onChange={handleFilter}
        />
      </div>

      {filterData.length != 0 && (
        <div
          className="dataResult"
          style={{ position: "absolute" }}
          onClick={deleteDisplay}
        >
          {filterData.slice(0, 10).map((manga) => {
            return (
              <Link href={"/mangas/" + manga.id} key={manga.id}>
                <a style={{ textDecoration: "none" }}>
                  <div className="dataItem">
                    <img
                      src={manga.imgSrc}
                      alt=""
                      style={{
                        justifySelf: "flex-start",

                        height: "100%",
                        aspectRatio: "16/9",
                        objectFit: "cover",
                      }}
                    />
                    <div className="dataItem-details" style={{ width: "100%" }}>
                      <p>{manga.title}</p>
                      <p>{"Chap " + manga.chapter}</p>
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      )}
    </form>
  );
}
