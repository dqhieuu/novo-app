import React, { useState } from 'react'; // import react, react-markdown-editor-lite, and a markdown parser you like

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Finish!

export default function ChapterNovel({ chapter }) {
  function handleEditorChange({ html, text }, e) {
    // setText(e.target.value);
    console.log('handleEditorChange', html, text);
  }
  const [text, setText] = useState(chapter.textContent);

  return (
    <div>
      <MdEditor
        // value={text}
        style={{ height: '500px' }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-dark">Update</button>
      </div>
    </div>
  );
}
