import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate= useNavigate();
    return (
      <div className="flex items-center justify-center h-screen bg-indigo-500 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-xl mt-2">Oops! Page not found.</p>
          <button 
           onClick={() => navigate('/')}
            className="mt-4 inline-block px-6 py-2 text-lg font-medium bg-white text-indigo-500 rounded-lg shadow-md hover:bg-gray-200 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  