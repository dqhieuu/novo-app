export const addElement = (object, id) => {
  if (localStorage.getItem('data') == null) {
    localStorage.setItem('data', '[]');
  }
  let checkExisted = false;
  const oldData = JSON.parse(localStorage.getItem('data'));

  oldData.forEach((ele) => {
    if (ele.id === id) {
      checkExisted = true;
    }
  });
  if (checkExisted === false) oldData.push(object);
  localStorage.setItem('data', JSON.stringify(oldData));
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
      oldData.splice(index, 1, newObject);
    }
  });
  if (checkExisted === false) oldData.push(newObject);
  localStorage.setItem('history', JSON.stringify(oldData));
};
