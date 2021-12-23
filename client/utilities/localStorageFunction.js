export const addToFavorite = (bookGroupId, manga) => {
  const newObject = {
    name: manga.name,
    id: bookGroupId,
    latestChapter: manga.chapters && manga.chapters[0],
    image: manga.primaryCoverArt,
    view: manga.views,
    alias: manga.alias,
    likeCount: manga.likeCount,
    dislikeCount: manga.dislikeCount,
    genres: manga.genres,
    authors: manga.authors,
    listChapters:
      manga.chapters && manga.chapters.slice(0, 3),
  };
  if (localStorage.getItem('favorite') == null) {
    localStorage.setItem('favorite', '[]');
  }
  let checkExisted = false;
  const oldData = JSON.parse(
    localStorage.getItem('favorite')
  );

  oldData.forEach((ele, index) => {
    if (ele.id === bookGroupId) {
      checkExisted = true;
      oldData.splice(index, 1);
      oldData.unshift(newObject);
    }
  });
  if (checkExisted === false) oldData.unshift(newObject);
  localStorage.setItem('favorite', JSON.stringify(oldData));
};

export const removeElement = (id) => {
  let data = JSON.parse(localStorage.getItem('history'));
  data.forEach((item, index) => {
    if (id === item.id) {
      data.splice(index, 1);
    }
  });
  localStorage.setItem('history', JSON.stringify(data));
};
export const removeElementFavorite = (id) => {
  let data = JSON.parse(localStorage.getItem('favorite'));
  data.forEach((item, index) => {
    if (id == item.id) {
      data.splice(index, 1);
    }
  });
  localStorage.setItem('favorite', JSON.stringify(data));
};
export const addToHistory = (
  bookGroupId,
  chapter,
  manga
) => {
  const newObject = {
    name: manga.name,
    id: bookGroupId,
    latestChapter: chapter.chapterNumber,
    image: manga.primaryCoverArt,
    chapterId: chapter.id,
    views: manga.views,
    alias: manga.alias,
    likeCount: manga.likeCount,
  };
  if (localStorage.getItem('history') == null) {
    localStorage.setItem('history', '[]');
  }
  let checkExisted = false;
  const oldData = JSON.parse(
    localStorage.getItem('history')
  );

  oldData.forEach((ele, index) => {
    if (ele.id === bookGroupId) {
      checkExisted = true;
      oldData.splice(index, 1);
      oldData.unshift(newObject);
    }
  });
  if (checkExisted === false) oldData.unshift(newObject);
  localStorage.setItem('history', JSON.stringify(oldData));
};
