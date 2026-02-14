import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../features/auth/authSlice';

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(register({ username, password }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-green-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-6 font-arabic">Daftar Akun</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-green-600 rounded hover:bg-green-700 transition duration-200"
          >
            Daftar
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <button onClick={onSwitchToLogin} className="text-green-600 hover:underline font-medium">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
