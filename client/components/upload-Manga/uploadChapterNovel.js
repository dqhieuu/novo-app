import React, { useState } from 'react';

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import { fetchAuth } from '../../utilities/fetchAuth';
import WEB_CONSTANTS from '../../utilities/constants';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
// import Editor from 'rich-markdown-editor';
// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Finish!
export default function UploadChapterNovel({ data }) {
  const server = WEB_CONSTANTS.SERVER;
  const router = useRouter();
  function handleEditorChange({ html, text }, e) {
    setText(text);
  }
  const [text, setText] = useState('');
  const submitNovel = () => {
    fetchAuth({
      url: `${server}/auth/chapter/hypertext`,
      method: 'POST',
      data: {
        name: data.chapterName,
        bookGroupId: parseInt(data.bookGroupId),
        chapterNumber: parseInt(data.chapterNumber),

        textContent: text,
      },
    }).then((res) => {
      toast.success('Upload thành công', {
        position: 'bottom-left',
        autoClose: 3000,
      });
      router.push(`/chapter/${res.data.id}`);
    });
  };
  return (
    <div className="mb-3 mt-3">
      <label className="form-label">03. Nội dung:</label>
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
          onClick={() => submitNovel()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
