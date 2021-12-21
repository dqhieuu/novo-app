export const addToFavorite = (
  bookGroupId,
  chapter = null,
  manga
) => {
  const newObject = {
    name: manga.name,
    id: bookGroupId,
    latestChapter: chapter && chapter.chapterNumber,
    image: manga.primaryCoverArt,
    chapterId: chapter && chapter.id,
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
  let data = JSON.parse(localStorage.getItem('data'));
  data.forEach((item, index) => {
    if (id === item.id) {
      data.splice(index, 1);
    }
  });
  localStorage.setItem('data', JSON.stringify(data));
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
