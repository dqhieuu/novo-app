import React, { useState } from 'react';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';
const SortableListItem = SortableElement(
  ({ image, stt }) => {
    return (
      <div className="m-3 border rounded">
        <img
          src={image}
          style={{
            objectFit: 'cover',
            aspectRatio: '3/4',
            width: '150px',
          }}
        />
        <div className="d-flex justify-content-center mt-1">
          {stt}
        </div>
      </div>
    );
  }
);

const SortableList = SortableContainer(({ images }) => {
  return (
    <div className="d-flex flex-wrap border mt-3">
      {images.length > 0 &&
        images.map((image, index) => {
          return (
            <SortableListItem
              axis="xy"
              key={index}
              index={index}
              image={image}
              stt={index}
            />
          );
        })}
    </div>
  );
});
export default function ChapterManga() {
  const [images, setImages] = useState([]);
  return <div></div>;
}
