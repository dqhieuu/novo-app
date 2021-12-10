import React, { useState } from 'react';
import UploadPartTwo from './uploadMangaPart2';
import UploadPartOne from './uploadMangaPart1';
export default function uploadManga() {
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
          Thông tin truyện
        </h3>
      </div>
      <div>
        <UploadPartOne></UploadPartOne>
      </div>
    </div>
  );
}
