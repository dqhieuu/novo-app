import React, {
  useState,
  useMemo,
  useCallback,
} from 'react';
import WEB_CONSTANTS from '../../utilities/constants';
import { useRouter } from 'next/router';

import Image from 'next/image';
import UploadChapterImg from '../../components/upload-Manga/uploadChapterImg';
import UploadChapterNovel from '../../components/upload-Manga/uploadChapterNovel';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/book/${id}`);
  const data = await response.json();

  return {
    props: {
      manga: data,
      mangaId: id,
    },
  };
} // tooi lay bookgroup tu cho nay
// upload book group o dau
// đang bị 2 lỗi đúng ko

export default function UploadNewChapter({
  manga,
  mangaId,
}) {
  const [type, setType] = useState('Truyện Tranh');
  const [data, setData] = useState({
    chapterName: '',
    chapterNumber: 0,
    bookGroupId: mangaId,
  });

  const router = useRouter();

  return (
    <div
      className="offset-md-2 col-lg-8 col-12 mt-5 p-3"
      style={{
        background: '#f3f3f3',
        borderRadius: '0.75rem',
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
      }}
    >
      <div className="row">
        <div className="mb-3 mt-3 col-6">
          <label
            htmlFor="chapterName"
            className="form-label"
          >
            01. Số Chap:
          </label>
          <input
            type="text"
            className="form-control"
            id="chapterNumber"
            placeholder="Nhập STT"
            name="chapterNumber"
            value={data.chapterNumber}
            onChange={(e) =>
              setData({
                ...data,
                chapterNumber: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3 mt-3 col-6">
          <label
            htmlFor="chapterName"
            className="form-label"
          >
            02. Tên Chap:
          </label>
          <input
            type="text"
            className="form-control"
            id="chapterName"
            placeholder="Không bắt buộc"
            name="chapterName"
            value={data.chapterName}
            onChange={(e) =>
              setData({
                ...data,
                chapterName: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="mb-3 mt-3">
        <label className="form-label">Thể loại</label>
        <select
          className="form-select"
          onChange={(e) => {
            setType(e.target.value);
          }}
        >
          <option>Truyện Tranh</option>
          <option>Truyện Chữ</option>
        </select>
      </div>
      <div className="mb-3 mt-3">
        {type === 'Truyện Tranh' ? (
          <UploadChapterImg data={data}></UploadChapterImg>
        ) : (
          <UploadChapterNovel
            data={data}
          ></UploadChapterNovel>
        )}
      </div>
    </div>
  );
}
