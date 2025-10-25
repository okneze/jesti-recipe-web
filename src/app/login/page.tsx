'use client'

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to return URL or home
        router.push(decodeURIComponent(returnUrl));
        router.refresh();
      } else {
        setError(data.error || 'Login fehlgeschlagen');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Jesti Recipe</h1>
        <h2 className={styles.subtitle}>Login</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Benutzername
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Laden...</div>}>
      <LoginForm />
    </Suspense>
  );
}
