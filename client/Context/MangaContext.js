import React, { createContext, useEffect, useState } from "react";

export const MangaContext = createContext();

export default function MangaContextProvider({ children }) {
  const [listObjects, setListObjects] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3300/manga")
      .then((res) => res.json())
      .then((data) => setListObjects(data));
  }, []);
  const MangaContextData = {
    listObjects,
  };
  return (
    <MangaContext.Provider value={MangaContextData}>
      {children}
    </MangaContext.Provider>
  );
}
