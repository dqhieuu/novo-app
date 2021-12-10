import Link from 'next/link';
import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.replace('/');
    }, 5000);
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h1>Oops...</h1>
      <h2>
        {' '}
        Giữa biển người tấp nập, có lẽ chúng mình chẳng hề
        có duyên với nhau😢
      </h2>
      <p>
        Đá đít các bạn về <Link href="/">trang chủ</Link>{' '}
        sau 5 giây nhé!
      </p>
    </div>
  );
}
