import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/loginUser';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await loginUser(email, password);
      navigate('/'); // ✅ redirect to homepage after login
    } catch (err: any) {
      console.error('Login failed:', err.message);
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Shippitin</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
          onClick={handleLogin}
        >
          Login
        </button>

        {error && <p className="mt-4 text-red-600 text-center">Firebase: Error ({error})</p>}
      </div>
    </div>
  );
};

export default LoginPage;