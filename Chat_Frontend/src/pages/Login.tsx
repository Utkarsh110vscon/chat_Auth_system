
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Lock } from 'lucide-react';
import { useEffect, useReducer, useState } from 'react';
import API from '../service/apiService';
import { AuthenticateUserSession } from '../app/slices/AuthSlice';
import { useDispatch } from 'react-redux';
import { useAppSelector, useSocket } from '../hooks/customHook';

function Login() {

  const navigate = useNavigate();
  const reduxDispatch = useDispatch();
   const userSession= useAppSelector(state => state.auth.userSession)
   const socket = useSocket();

  enum ActionTypeEnum {
    UPDATE = 'UPDATE',
    RESET = 'RESET'
  }

  interface StateType {
    email: string
    password: string
  }

  interface ActionType {
    type: ActionTypeEnum
    name?: string
    value?: string
  }

  const initialState = {
    email: '',
    password: ''
  }

  const reducers = (state: StateType, action: ActionType) => {
    switch (action.type) {
      case 'UPDATE':
        if (!action.name) return state;
        return { ...state, [action.name]: action.value };

      case 'RESET':
        return { email: '', password: '' };

      default:
        return state;
    }
  }

  useEffect(() => {

    socket.on('valueMessage', (data) => {
      console.log('value message',data);
    })

    return () => {
      socket.off('valueMessage')
    }
  }, [socket])

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginData, dispatch] = useReducer(reducers, initialState)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const result = await API.post('/api/auth/login', loginData);
      localStorage.setItem('accessToken', result.data.accessToken)
      console.log(result)
      reduxDispatch(AuthenticateUserSession())
      navigate('/')
    } catch (error) {
      console.log(error);
      alert('something went wrong!');
    } finally {
      dispatch({ type: ActionTypeEnum.RESET });
      setLoginLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <Link to={'/'}>
          <div className="flex justify-center mb-6 cursor-pointer" >
            <div className="p-3 bg-indigo-100 rounded-full">
              <MessageSquare size={40} className="text-indigo-600" />
            </div>
          </div>
        </Link>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome back!</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                required
                type="email"
                name='email'
                value={loginData.email}
                onChange={(e) => dispatch({ type: ActionTypeEnum.UPDATE, name: e.currentTarget.name, value: e.currentTarget.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Enter your email"
              />
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                required
                type="password"
                name="password"
                value={loginData.password}
                onChange={(e) => dispatch({ type: ActionTypeEnum.UPDATE, name: e.currentTarget.name, value: e.currentTarget.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Enter your password"
              />
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500 font-semibold"
              onClick={async() =>{
                await API.get('/api/auth/needHelp');
                console.log('finshed');
              }}
            >
              Need help?
            </button>

            <div className="flex items-center justify-end text-sm">
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-500 font-semibold"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={userSession || loginLoading}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 
              ${loginLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-indigo-700"} ${userSession && 'opacity-60'}`}
          >
            {
              loginLoading ?
                <>
                  <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0h-2a6 6 0 00-12 0H4z"></path>
                  </svg>
                  <span className="animate-pulse">Signing in...</span>
                </>
                : <span> Sign In </span>
            }
          </button>
        </form>

        <div className='w-full h-10 flex items-center justify-center gap-2'>
          <div className='w-[35%] h-[0.01rem] bg-gray-400'></div>
          <span className='h-full py-1 font-semibold'>or</span>
          <div className='w-[35%] h-[0.01rem] bg-gray-400'></div>
        </div>

        <button
          disabled={userSession || loginLoading}
          onClick={() => {
            window.location.href = 'http://localhost:3000/api/auth/google'
          }}
          className={`w-full bg-[#f2f2f2] py-1.5 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2  ${userSession && 'opacity-60'}`}
        >
          <img src='/images/Google_Icon.webp' className='w-8 h-8 object-cover' />
          <span>Continue with Google</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-indigo-600 hover:text-indigo-500 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;