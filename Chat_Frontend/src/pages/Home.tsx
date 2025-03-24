import { useNavigate } from 'react-router-dom';
import { MessageSquare, UserPlus, LogOut } from 'lucide-react';
import { useAppSelector } from '../hooks/customHook';
import API from '../service/apiService';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnauthenticateUserSession } from '../app/slices/AuthSlice';

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.auth.userSession);
  const reduxDispatch = useDispatch()

  // const user = {
  //   name: "John Doe",
  // };
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const result = await API.post('/api/auth/logout');
      console.log(result.data);
      localStorage.removeItem("accessToken");
      reduxDispatch(UnauthenticateUserSession());
    } catch (error) {
      console.log(error);
      alert('something went wrong!');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        {/* App Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-100 rounded-full">
            <MessageSquare size={40} className="text-indigo-600" />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to ChatApp</h1>
        <p className="text-gray-600 mb-8">Connect with friends and family through instant messaging.</p>

        {/* Main Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/users")}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start Chatting
          </button>

          <button
            onClick={() => navigate("/search")}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-indigo-200 text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            <UserPlus size={20} />
            <span>Find Friends</span>
          </button>

          {isAuthenticated ? (
            <div className="space-y-4">
              {/* <button
                className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-indigo-200 text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                <User className="w-6 h-6 text-gray-500" />
                <span>{user.name}</span>
              </button> */}

              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className={`w-full bg-red-500 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 
              ${logoutLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-red-700"}`}
              >
                {logoutLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0h-2a6 6 0 00-12 0H4z"></path>
                    </svg>
                    <span className="animate-pulse">Logging Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={20} />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;