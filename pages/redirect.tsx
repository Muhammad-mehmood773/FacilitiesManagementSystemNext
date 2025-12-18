import type { GetServerSideProps } from 'next';
import { decryptLoginId } from '../utils/decrypt';
import { serializeCookie } from '../utils/cookies';

export default function Redirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const encrypted = typeof ctx.query.loginid === 'string' ? ctx.query.loginid : null;

  if (!encrypted) {
    ctx.res.setHeader('Set-Cookie', serializeCookie('loginId', '', { maxAge: 0, path: '/' }));
    return {
      redirect: {
        destination: 'https://hr.astrikdigital.com',
        permanent: false,
      },
    };
  }

  try {
    const decrypted = await decryptLoginId(encrypted);
    const loginId = decrypted?.trim();
    if (!loginId) throw new Error('Empty loginId');

    ctx.res.setHeader('Set-Cookie', serializeCookie('loginId', loginId, { maxAge: 60 * 60 * 24 * 7, path: '/' }));

    return {
      redirect: {
        destination: '/book-slot',
        permanent: false,
      },
    };
  } catch {
    ctx.res.setHeader('Set-Cookie', serializeCookie('loginId', '', { maxAge: 0, path: '/' }));
    return {
      redirect: {
        destination: 'https://hr.astrikdigital.com',
        permanent: false,
      },
    };
  }
};
