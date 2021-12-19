import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

export const MangaContext = createContext();
export default function MangaContextProvider({ children }) {
  const server = ' https://api.novoapp.tech';
  const [latestManga, setLatest] = useState([]);
  const [randomBooks, setRandomBooks] = useState([]);
  const [mostViewedAll, setMostViewedAll] = useState([]);
  const [mostViewedMonth, setMostViewedMonth] = useState(
    []
  );
  const [latestComment, setLatestComment] = useState([]);

  const [mostViewedYear, setMostViewedYear] = useState([]);
  const [mostViewedWeek, setMostViewedWeek] = useState([]);
  const [genres, setGenre] = useState([]);

  useEffect(() => {
    fetch(`${server}/book/latest?limit=16`)
      .then((res) => res.json())
      .then((data) => {
        setLatest(data.books);
      });
    fetch(`${server}/book/random`)
      .then((res) => res.json())
      .then((data) => setRandomBooks(data.books));
    fetch(`${server}/book/top/all?limit=50`)
      .then((res) => res.json())
      .then((data) => setMostViewedAll(data.books));
    fetch(`${server}/book/top/year?limit=50`)
      .then((res) => res.json())
      .then((data) => setMostViewedYear(data.books));

    fetch(`${server}/book/top/month?limit=50`)
      .then((res) => res.json())
      .then((data) => setMostViewedMonth(data.books));
    fetch(`${server}/book/top/week?limit=50`)
      .then((res) => res.json())
      .then((data) => setMostViewedWeek(data.books));
    fetch(`${server}/comment/latest`)
      .then((res) => res.json())
      .then((data) => setGenre(data));
    fetch(`${server}/genre/all`)
      .then((res) => res.json())
      .then((data) => setGenre(data));
  }, []);

  const MangaContextData = {
    server,
    latestManga,
    randomBooks,
    mostViewedAll,
    mostViewedMonth,
    mostViewedYear,
    mostViewedWeek,
    genres,
    latestComment,
  };
  return (
    <MangaContext.Provider value={MangaContextData}>
      {children}
    </MangaContext.Provider>
  );
}
