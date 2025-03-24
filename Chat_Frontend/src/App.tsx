import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UserList from './pages/UserList';
import Chat from './pages/Chat';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Search from './pages/Search';
import ProtectedRoute from './components/ProtectedRoute';
import OtpVerification from './pages/OptVerify';
import { useAuth } from './hooks/useAuth';
import NotFoundPage from './pages/NotFoundPage';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AuthenticateOtpSession } from './app/slices/AuthSlice';
import SocketProvider from './components/SocketProvider';
import { useSocket } from './hooks/customHook';

function App() {

  const reduxDispatch = useDispatch();
  const { authLoading } = useAuth();
  const socket= useSocket();

  useEffect(() => {

    socket.on('startOtpSession', () => {
      console.log('starting otp session');
      reduxDispatch(AuthenticateOtpSession());
    });

    socket.on('OtpSessionError', (data) => {
      console.log('Server Error: ',data.error);
      alert('Server Error');
    });

    return () => {
      socket.off('startOtpSession')
    };

  }, [socket])

  if (authLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center animate-pulse">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 mx-auto mt-2"></div>
          <div className="h-10 bg-gray-300 rounded w-full mt-4"></div>
          <div className="h-10 bg-gray-300 rounded w-full mt-3"></div>
          <div className="flex gap-4 mt-4">
            <div className="h-10 bg-gray-300 rounded w-1/2"></div>
            <div className="h-10 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/users"
          element={<ProtectedRoute><UserList /></ProtectedRoute>}
        />
        <Route
          path="/chat/:userId"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
        <Route
          path="/search"
          element={<ProtectedRoute><Search /></ProtectedRoute>}
        />
        <Route
          path="/verify"
          element={<OtpVerification />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Router>
    </SocketProvider>
  );
}

export default App;