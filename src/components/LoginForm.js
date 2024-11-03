'use client'
import { useState } from 'react';

const API_URL = 'https://7al3ohcnml.execute-api.us-east-1.amazonaws.com';

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        localStorage.setItem('auth_credentials', JSON.stringify({ username, password }));
        onLoginSuccess();
        setError('');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-3 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-background"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-background"
      />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        Login
      </button>
    </form>
  );
} 