import { useState } from "react";
import { useContext } from "react";
import { MangaContext } from "../Context/MangaContext";
import DisplayImg from "../components/displayImg";

export default function HotManga() {
  const { listObjects } = useContext(MangaContext);
  const [number, setNumber] = useState(12);
  const sliceArr = sortObjectByKey().slice(0, number);
  const loadMore = () => {
    setNumber(number + number);
  };
  function sortObjectByKey() {
    let arrSorted = [];

    arrSorted = Object.entries(listObjects).sort(
      (a, b) => (new Date(a[1].views) > new Date(b[1].views) && -1) || 1
    );

    return arrSorted;
  }

  return (
    <div>
      <div className="container">
        <h5
          className="mt-3 ps-3"
          style={{ color: "green", borderLeft: "5px solid green" }}
        >
          ĐỌC NHIỀU NHẤT
        </h5>
        <div className="row">
          {sliceArr.map((listObject) => (
            <div className="col-6 col-lg-3 col-md-4 col-xl-2">
              {" "}
              <DisplayImg
                bgColor="green"
                srcImg={listObject[1].imgSrc}
                text={listObject[1].views + " lượt đọc"}
                title={listObject[1].title}
                height="282px"
              ></DisplayImg>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-center">
          {" "}
          <button className="btn btn-dark" onClick={() => loadMore()}>
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}
