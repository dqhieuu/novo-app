import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

export const UserContext = createContext();
export default function UserContextProvider({ children }) {
  const [isAuthenication, setAuthentication] =
    useState(false);
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    displayName: '',
    email: '',
    sex: '',
    DOB: '',
  });
  const toggleAuth = () => {
    setAuthentication(!isAuthenication);
  };
  function signUpData(type, newData) {
    setUserData({ ...userData, type: newData });
  }
  const userContextData = {
    isAuthenication,
    toggleAuth,
    signUpData,
    userData,
  };
  return (
    <UserContext.Provider value={userContextData}>
      {children}
    </UserContext.Provider>
  );
}
