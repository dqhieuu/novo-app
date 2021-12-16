import React from 'react';
import ChapterNovel from '../../pages/uploadManga/chapterNovel';
export default function EditChapterText({ chapter }) {
  return (
    <div className="p-3" data-aos="flip-left">
      <form>
        <div className="mb-3 mt-3">
          <label
            htmlFor="chapterName"
            className="form-label"
          >
            01. Nhập tên Chapter:
          </label>
          <input
            type="text"
            className="form-control"
            id="chapterName"
            placeholder="Nhập tên Chap ở đây"
            name="chapterName"
            value={chapter.name}
          />
        </div>
        <div className="mb-3 mt-3">
          <label className="form-label">
            02. Chỉnh sửa nội dung:
          </label>
          <ChapterNovel chapter={chapter} />
        </div>
      </form>
    </div>
  );
}
