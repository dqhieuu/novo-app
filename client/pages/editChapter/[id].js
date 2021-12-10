import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';
import EditChapterImage from '../../components/manageManga/editChapterImage';
import EditChapterText from '../../components/manageManga/editChapterText';
export async function getServerSideProps(context) {
  const server = 'http://113.22.75.159:7001';
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/chapter/${id}`);
  const data = await response.json();

  return {
    props: {
      chapter: data,
    },
  };
}

export default function EditChapterDetails({ chapter }) {
  return (
    <div
      className="container mt-5"
      style={{ background: '#ecf0f1', borderRadius: '5px' }}
    >
      {chapter.type === 'images' ? (
        <EditChapterImage
          chapter={chapter}
        ></EditChapterImage>
      ) : (
        <EditChapterText
          chapter={chapter}
        ></EditChapterText>
      )}
    </div>
  );
}
