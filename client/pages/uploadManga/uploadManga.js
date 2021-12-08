import React, { useState } from 'react';
import UploadPartTwo from './uploadMangaPart2';
import UploadPartOne from './uploadMangaPart1';
export default function uploadManga() {
  const [page, setPage] = useState(0);
  const [manga, setManga] = useState({
    mangaInfo: {
      mangaName: '',
      mangaLanguage: '',
      mangaAuthor: '',

      mangaTypes: [],
      mangaDescription: '',
      mangaCover: [],
      mangaBackground: '',
    },
    mangaChapter: {
      chapterName: '',
      mangaImages: [],
    },
  });
  function updateManga(type, newData) {
    setManga((manga) => {
      return { ...manga, [type]: newData };
    });
  }
  console.log(page);
  const FormTitles = ['Thông tin Truyện', 'Upload Chapter'];
  return (
    <div
      className="offset-md-2 col-lg-8 col-12 mt-5"
      style={{
        background: '#f3f3f3',
        borderRadius: '5px',
      }}
    >
      <div className="mt-5">
        <h3 className="d-flex justify-content-center mt-5">
          {FormTitles[page]}
        </h3>

        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: page === 0 ? '50%' : '100%',
            }}
          ></div>
        </div>
      </div>
      <div>
        {page === 0 ? (
          <UploadPartOne
            data={manga.mangaInfo}
            update={updateManga}
          ></UploadPartOne>
        ) : (
          <UploadPartTwo
            data={manga.mangaChapter}
            update={updateManga}
          ></UploadPartTwo>
        )}
      </div>
      <div className="form-footer d-flex justify-content-center">
        <button
          className="btn btn-outline-primary me-5"
          disabled={page === 0}
          onClick={() => setPage((curPage) => curPage - 1)}
        >
          Trước
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            if (page === FormTitles.length - 1) {
              alert('Success!');
              console.log(manga);
            } else setPage((curPage) => curPage + 1);
          }}
        >
          {page === FormTitles.length - 1
            ? 'Submit'
            : 'Sau'}
        </button>
      </div>
    </div>
  );
}
