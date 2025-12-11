import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { decryptLoginId } from '../utils/decrypt';
import { useAuth } from '../context/useAuth';

export default function Redirect() {
  const { setLoginId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encrypted = params.get('loginid');

    if (!encrypted) {
      localStorage.clear();
      window.location.href = 'https://hr.astrikdigital.com';
      return;
    }

    decryptLoginId(encrypted)
      .then((decrypted: string) => {
        setLoginId(decrypted);
        router.push('/book-slot');
      })
      .catch(() => {
        localStorage.clear();
        window.location.href = 'https://hr.astrikdigital.com';
      });
  }, [router, setLoginId]);

  return <div />;
}
