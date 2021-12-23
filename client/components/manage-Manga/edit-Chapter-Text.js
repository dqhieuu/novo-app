import React, { useState } from 'react';

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import { fetchAuth } from '../../utilities/fetchAuth';
import WEB_CONSTANTS from '../../utilities/constants';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
// import Editor from 'rich-markdown-editor';
// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Finish!

export default function EditChapterText({ chapter, id }) {
  const [text, setText] = useState(
    chapter?.textContent ?? ''
  );
  const [chapterInfo, setChapterInfo] = useState({
    chapterName: chapter.name,
    chapterNumber: chapter.chapterNumber,
  });
  const server = WEB_CONSTANTS.SERVER;
  const router = useRouter();

  function handleEditorChange({ html, text }, e) {
    setText(text);
  }
  function submitEdited() {
    fetchAuth({
      url: `${server}/auth/chapter/hypertext/${id}`,
      method: 'PATCH',
      data: {
        name: chapterInfo.chapterName,
        chapterNumber: parseInt(chapterInfo.chapterNumber),
        textContent: text,
      },
    }).then((res) => {
      toast.success('Sửa thành công', {
        position: 'bottom-left',
        autoClose: 3000,
      });
      router.replace(`/chapter/${id}`);
    });
  }

  return (
    <div className="p-3" data-aos="flip-left">
      <div className="mb-3 mt-3">
        <label htmlFor="chapterName" className="form-label">
          Nhập tên Chapter:
        </label>
        <input
          type="text"
          className="form-control"
          id="chapterName"
          placeholder="Nhập tên Chap ở đây"
          name="chapterName"
          value={chapterInfo.chapterName}
          onChange={(e) =>
            setChapterInfo({
              ...chapterInfo,
              chapterName: e.target.value,
            })
          }
        />
      </div>
      <div className="mb-3 mt-3">
        <label htmlFor="chapterName" className="form-label">
          Nhập STT Chap:
        </label>
        <input
          type="number"
          className="form-control"
          id="chapterNumber"
          placeholder="Nhập tên Chap ở đây"
          name="chapterNumber"
          value={chapterInfo.chapterNumber}
          onChange={(e) =>
            setChapterInfo({
              ...chapterInfo,
              chapterNumber: e.target.value,
            })
          }
        />
      </div>
      <div className="mb-3 mt-3">
        <label className="form-label">
          02. Chỉnh sửa nội dung:
        </label>
        <MdEditor
          value={text}
          style={{ height: '500px' }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleEditorChange}
        />
        {/* <Editor defaultValue="Hello world!" /> */}
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-dark"
            onClick={() => submitEdited()}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
