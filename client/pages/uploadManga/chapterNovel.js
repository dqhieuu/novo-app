import React, { useState } from 'react'; // import react, react-markdown-editor-lite, and a markdown parser you like

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
// import Editor from 'rich-markdown-editor';
// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Finish!

export default function ChapterNovel({ chapter }) {
  function handleEditorChange({ html, text }, e) {
    setText(text);
  }
  const [text, setText] = useState(
    chapter?.textContent ?? ''
  );

  return (
    <div>
      <MdEditor
        value={text}
        style={{ height: '500px' }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
      {/* <Editor defaultValue="Hello world!" /> */}
      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-dark">Update</button>
      </div>
    </div>
  );
}
