import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Lock, User } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';
import API from '../service/apiService';
import { useAppSelector, useSocket } from '../hooks/customHook';

function SignUp() {

  const socket= useSocket();
  const userSession = useAppSelector(state => state.auth.userSession)
  const navigate = useNavigate(); 
  const signUptimeoutRef= useRef<number | null>(null);

  interface StateType {
    fullName: string,
    email: string,
    password: string,
    confirmPassword?: string
  }

  enum ActionTypeEnum {
    UPDATE = "UPDATE",
    RESET = "RESET",
  }

  interface ActionType {
    type: ActionTypeEnum,
    name?: string,
    value?: string
  }

  const initialState = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  const reducer = (state: StateType, action: ActionType) => {
    switch (action.type) {
      case ActionTypeEnum.UPDATE:
        if (!action.name) return state;
        return { ...state, [action.name]: action.value };

      case ActionTypeEnum.RESET:
        return { fullName: '', email: '', password: '', confirmPassword: '' }

      default:
        return state;
    }
  }

  useEffect(() => {
     return () => {
      clearTimeout(signUptimeoutRef.current as (number | undefined))
      signUptimeoutRef.current=null;
     }
  }, [])

  const [signupLoading, setSignupLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [formData, dispatch] = useReducer(reducer, initialState);

  const apiRequestForAuth = async (data: StateType) => {
    try {
      const result = await API.post('/api/auth/signup', data)
      console.log(result.data.otpSessionId);
      localStorage.setItem('sessionId', result.data.otpSessionId);
    } catch (error) {
      throw error;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    try {
      if (formData.password === formData.confirmPassword) {
        await apiRequestForAuth({ fullName: formData.fullName, email: formData.email, password: formData.password });
        socket.emit('registerOtpSession', localStorage.getItem('sessionId'));
        console.log('after emitting message from the client to server');
        setTimeout(() => {
          navigate(`/verify?name=${formData.fullName}&email=${formData.email}`);
        }, 2000);
      } else {
        setPasswordError(true);
        
        if(signUptimeoutRef.current) clearTimeout(signUptimeoutRef.current);
        
        signUptimeoutRef.current = setTimeout(() => {
          setPasswordError(false);
        }, 2000);
      }

    } catch (error) {
      console.log(error);
      alert('something went wrong please try again!');
    } finally {
      dispatch({ type: ActionTypeEnum.RESET });
      setSignupLoading(false);
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

        <h1 className={`text-3xl font-bold text-center text-gray-800 ${passwordError ? 'mb-4' : 'mb-8'}`}>Create an account</h1>

        {
          passwordError && (
            <div className='flex justify-center items-start text-xs text-red-500 font-medium mb-2'>
              <span>Confirm password and password doesn't match! Please try again</span>
            </div>
          )
        }

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <input
                required
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => dispatch({ type: ActionTypeEnum.UPDATE, name: e.target.name, value: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Enter your full name"
              />
              <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => dispatch({ type: ActionTypeEnum.UPDATE, name: e.target.name, value: e.target.value })}
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
                value={formData.password}
                onChange={(e) => dispatch({ type: ActionTypeEnum.UPDATE, name: e.target.name, value: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Create a password"
              />
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                required
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => dispatch({ type: ActionTypeEnum.UPDATE, name: e.target.name, value: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Confirm your password"
              />
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <button
            type="submit"
            disabled={signupLoading || userSession}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 
              ${signupLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-indigo-700"} ${userSession && 'opacity-60'}`}
          >
            {signupLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0h-2a6 6 0 00-12 0H4z"></path>
                </svg>
                <span className="animate-pulse">Creating...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>

        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-500 font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;