// src/pages/login.js
import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
  return <LoginForm />;
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
