import React, { useState } from "react";
import UploadPartTwo from "./uploadMangaPart2";
import UploadPartOne from "./uploadMangaPart1";
export default function uploadManga() {
  const [page, setPage] = useState(1);
  const [manga, setManga] = useState({
    mangaInfo: {
      mangaName: "",
      mangaLanguage: "",
      mangaAuthor: "",
      
    
      mangaTypes: [],
      mangaDescription: "",
      mangaCover: "",
      mangaBackground: "",
    },
    mangaChapter: {
      chapterName: "",
      mangaImages: [],
    },
  });
  function goNextPage() {
    if (page > 2) return;
    setPage((page) => page + 1);
  }
  function updateManga(type, newData) {
    setManga((manga) => {
      return { ...manga, [type]: newData };
    });
  }
  return (
    <div>
      <div className="d-flex justify-content-center mt-3">
        <progress max="2" value={page}></progress>
      </div>
      {page === 1 && (
        <UploadPartOne
          data={manga.mangaInfo}
          update={updateManga}
        ></UploadPartOne>
      )}
      {page === 2 && (
        <UploadPartTwo
          data={manga.mangaChapter}
          name={manga.mangaInfo.mangaName}
          update={updateManga}
        ></UploadPartTwo>
      )}
      <div className="d-flex justify-content-center mt-3">
        {page !== 2 && (
          <button className="btn btn-primary" onClick={goNextPage}>
            Tiếp tục
          </button>
        )}
      </div>
    </div>
  );
}
