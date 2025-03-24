import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useAppSelector, useSocket } from "../hooks/customHook";
import { Navigate, useSearchParams } from "react-router-dom";
import API from "../service/apiService";
import { useDispatch } from "react-redux";
import { UnauthenticateOtpSession } from "../app/slices/AuthSlice";
import { AxiosError } from "axios";

const OtpVerification: React.FC = () => {
    const socket= useSocket();
    const otpSession = useAppSelector((state) => state.auth.otpSession);
    const reduxDispatch = useDispatch();
    const  [ searchParams ]= useSearchParams();


    const queryParams = {
        name: searchParams.get('name'),
        email: searchParams.get('email')
    }

    
    const OTP_LENGTH = 4;
    const OTP_RESEND_TIME = 15;

    const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
    const [naviagetValue, setNavigateVlaue] = useState<string>('/');
    const [time, setTime] = useState<number>(OTP_RESEND_TIME);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpLoading, setOtpLoading] = useState<boolean>(false);
    const [otpResending, setOtpResending]= useState<boolean>(false);
    const [timerOpacity, setTimerOpacity]= useState<boolean>(false)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const otpLoadingRef = useRef<boolean>(false);
    const timeoutRef= useRef<number | undefined>(undefined);
    const timerRef= useRef<number | undefined>(undefined);
    

    useEffect(() => {
        socket.on('otpSessionEnded', (data) => {
            console.log('From server: ',data);
            alert(data.message)
            localStorage.removeItem('sessionId')
            reduxDispatch(UnauthenticateOtpSession())
        })

        return () => {
            socket.off('otpSessionEnded')
        }
    }, [])

    useEffect(() => {
        otpLoadingRef.current = otpLoading
    }, [otpLoading])

    const startTimer = () => {

        if(timeoutRef.current) clearTimeout(timeoutRef.current);
        if(timerRef.current) clearInterval(timerRef.current);

         timerRef.current = setInterval(() => {
            setTime((prev) => {
                if (otpLoadingRef.current) {
                    clearInterval( timerRef.current );
                    console.log('timeref cleared in loading')
                    timerRef.current=undefined
                    return OTP_RESEND_TIME
                }else if (prev === 0) {
                    clearInterval(timerRef.current);
                    timerRef.current=undefined
                    console.log('timeref cleared when resend activation')
                    timeoutRef.current= setTimeout(() => {
                        startTimer();
                        setTime(OTP_RESEND_TIME);
                    }, 5000);

                    return 0;
                } else 
                return prev - 1;
            });
        }, 1000);
    }

    useEffect(() => {
        startTimer();

        return () => {
            clearInterval(timerRef.current);
            timerRef.current= undefined;
            clearTimeout(timeoutRef.current);
            timeoutRef.current= undefined;
        } 
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; //!/^\d*$/ regex for all the character other than number

        const otpArray = [...otp]
        otpArray[index] = value
        setOtp(otpArray);

        if (value && index !== OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {

        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const handleSubmit = async () => {
        setNavigateVlaue('/login');
        const enteredOtp = otp.join("");
        setOtpLoading(true)
        try {
            if (enteredOtp === '') throw new Error('Otp is required')
            await API.post('/api/auth/verifyOtp', { clientOtp: enteredOtp });
            setOtpError(null);
        } catch (error) {
            if (error instanceof AxiosError) {
                setOtpError('Invalid OTP! Please try again.')
            } else {
                setOtpError('OTP is Required.')
            }
            console.log(error);
        } finally {
            setOtpLoading(false);
            startTimer()
        }
    };

    const handleReSend = async () => {
        setOtpResending(true);
        setTimerOpacity(true);
        
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current);
            timeoutRef.current=undefined;
        }

        try{
            const result= await API.get(`/api/auth/resendOtp?fullName=${queryParams.name}&email=${queryParams.email}`)
            console.log(result.data);
            alert('otp sent');
        }catch(error){
            console.log(error);
        }finally{
            setOtpResending(false);
            setTime(30);
            timeoutRef.current= setTimeout(() => {
                startTimer();
                setTimerOpacity(false);
            }, 3000)
        }
    }

    if (!otpSession) {
        return <Navigate to={naviagetValue} />
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">OTP Verification</h2>
                <p className="mb-6 text-center text-gray-600">Enter the 4-digit OTP sent to your email</p>

                <div className="flex justify-center gap-2 mb-1">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength={1}
                            value={digit}
                            required
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="h-12 w-12 rounded border text-center text-xl outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
                        />
                    ))}
                </div>

                {otpError && <p className="text-red-500 text-center text-xs">{otpError}</p>}



                <button
                    onClick={handleSubmit}
                    disabled={otpLoading}
                    className="mt-6 w-full rounded bg-purple-600 py-2 text-white transition hover:bg-purple-700"
                >
                    {
                        otpLoading ? 'Verifing...' : 'Verify OTP'
                    }
                </button>

                {
                    !otpLoading && (
                        <div>
                            {
                                (time === 0)
                                    ?
                                    <div className="text-xs font-medium flex justify-center items-center p-2">
                                        <button
                                            disabled= {otpResending}
                                            className={`relative overflow-hidden text-indigo-400 underline ${otpResending && 'animate-pulse'} `}
                                            onClick={handleReSend}
                                        >
                                            Resend OTP
                                            <span className="absolute inset-0 active:animate-ripple bg-indigo-400/20"></span>
                                        </button>
                                    </div>
                                    :
                                    <p className={`text-xs font-medium text-center p-2 ${timerOpacity ? 'opacity-45': 'opacity-100'}`}>Resend OTP in {time}s</p>
                            }

                        </div>
                    )
                }

            </div>
        </div>
    );
};

export default OtpVerification;