import DisplayImg from "../../components/displayImg";
import Link from "next/link";
import { useContext } from "react";
import { MangaContext } from "../../Context/MangaContext";
export const getStaticPaths = async () => {
  const res = await fetch("http://localhost:3300/manga");
  const data = await res.json();
  const paths = data.map((manga) => {
    return {
      params: { id: manga.id.toString() },
    };
  });
  return {
    paths,
    fallback: false,
  };
};
export const getStaticProps = async (context) => {
  const id = context.params.id;
  const res = await fetch("http://localhost:3300/manga/" + id);
  const data = await res.json();
  return {
    props: { manga: data },
  };
};

export default function Details({ manga }) {
  const { listObjects } = useContext(MangaContext);

  function sortObjectByKey(key) {
    let arrSorted = [];
    if (key == listObjects.lastUpdate) {
      arrSorted = Object.entries(listObjects).sort(
        (a, b) =>
          (new Date(a[1].lastUpdate) > new Date(b[1].lastUpdate) && -1) || 1
      );
    } else
      arrSorted = Object.entries(listObjects).sort(
        (a, b) => (a[1].key > b[1].key && -1) || 1
      );
    return arrSorted;
  }
  return (
    <div className="container">
      <div className="row mt-3">
        <div className="col-lg-8 col-12">
          <div className="row">
            <div className="col-lg-3 col-12">
              <DisplayImg
                srcImg={manga.imgSrc}
                size={2}
                height="282px"
              ></DisplayImg>
            </div>
            <div className="col-lg-9 col-12">
              <h3>{manga.title}</h3>
              <div className="d-flex justify-content-between col-lg-5 col-8">
                <div>
                  <p>Tác giả</p>
                  <p>Tình trạng</p>
                  <p>Mới nhất</p>
                  <p>Lượt đọc</p>
                </div>
                <div>
                  <p>{manga.author}</p>
                  <p>Đang cập nhật</p>
                  <p style={{ color: "red" }}>{"Chap " + manga.chapter}</p>
                  <p>{manga.views}</p>
                </div>
              </div>
              <div className="button-utilities col-12">
                <button type="button" class="btn btn-primary me-2">
                  Theo dõi
                </button>
                <button type="button" class="btn btn-success me-2">
                  Thích
                </button>
                <button type="button" class="btn btn-primary me-2">
                  Đọc từ đầu
                </button>
              </div>
            </div>
          </div>
          <div className="manga-description mt-3">
            <h5
              style={{ borderLeft: "5px solid red", color: "red" }}
              className="ps-2"
            >
              NỘI DUNG
            </h5>
            <p>{manga.description}</p>
          </div>
          <div className="mt-1">
            <h5
              style={{ borderLeft: "5px solid red", color: "red" }}
              className="ps-2"
            >
              DANH SÁCH CHAP
            </h5>
            <div
              className="d-flex justify-content-between"
              style={{ borderBottom: "1px solid grey" }}
            >
              <p>Tên Chap</p>
              <p>Cập nhật</p>
              <p>Lượt đọc</p>
            </div>
            <div className="list-chapter">
              {Array.from(Array(manga.chapter).keys()).map((index) => (
                <div
                  className="d-flex justify-content-between"
                  key={index}
                  style={{ borderBottom: "1px solid lightgrey" }}
                >
                  <Link href="#">
                    <p>Chapter {manga.chapter - index}</p>
                  </Link>

                  <p>{manga.lastUpdate}</p>
                  <p>{manga.views}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <p>Từ khóa:</p>
          </div>
        </div>
        <div className="col-lg-4  col-12">
          <h5
            style={{ borderLeft: "5px solid green", color: "green" }}
            className="ps-2"
          >
            TOP TRONG TUẦN
          </h5>
          {sortObjectByKey(listObjects.views)
            .slice(0, 3)
            .map((listObject) => (
              <div className="col-12">
                {" "}
                <DisplayImg
                  srcImg={listObject[1].imgSrc}
                  text={listObject[1].views + " lượt đọc"}
                  title={listObject[1].title}
                  height="205px"
                  bgColor="green"
                ></DisplayImg>
              </div>
            ))}
        </div>
      </div>
      <div className="row mt-3">
        <h5
          style={{ borderLeft: "5px solid RED", color: "RED" }}
          className="ps-2 mt-5"
        >
          TRUYỆN MỚI NHẤT
        </h5>
        <div className="row">
          {listObjects.slice(0, 6).map((listObject) => (
            <div className="col-6 col-lg-2">
              {" "}
              <DisplayImg
                bgColor="RED"
                srcImg={listObject.imgSrc}
                text={"Chap " + listObject.chapter}
                title={listObject.title}
                height="282px"
              ></DisplayImg>
            </div>
          ))}
        </div>
        <h5
          style={{ borderLeft: "5px solid purple", color: "purple" }}
          className="ps-2 mt-5"
        >
          ĐỪNG BỎ LỠ
        </h5>
        <div className="row">
          {listObjects.slice(0, 6).map((listObject) => (
            <div className="col-6 col-lg-2">
              {" "}
              <DisplayImg
                bgColor="purple"
                srcImg={listObject.imgSrc}
                text={"Chap " + listObject.chapter}
                title={listObject.title}
                height="282px"
              ></DisplayImg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
