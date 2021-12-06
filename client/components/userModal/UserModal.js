import React, { useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import UserLogin from './UserLogin';
import UserSignUp from './userSignUp';
export default function UserModal() {
  const { isAuthenication } = useContext(UserContext);
  return (
    <div>
      {isAuthenication ? (
        <UserLogin></UserLogin>
      ) : (
        <UserSignUp></UserSignUp>
      )}
    </div>
  );
}
