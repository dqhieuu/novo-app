import React, { createContext, useState } from 'react';

export const UserContext = createContext();
export default function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState({});
  const [listAuthorsId, setListAuthorsId] = useState([]);
  function update(res) {
    setUserInfo(res);
  }
  // function getListAuthors
  function getAuthorId(res) {
    setListAuthorsId(res);
  }
  const userContextData = {
    userInfo,
    update,
    listAuthorsId,
    getAuthorId,
  }; // pass 2 cái này xuống tất cả các con, đều share chung state
  return (
    <UserContext.Provider value={userContextData}>
      {children}
    </UserContext.Provider>
  );
}
