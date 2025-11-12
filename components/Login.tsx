import React from 'react';
import AnimatedLogo from './AnimatedLogo';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-end p-6 text-center">
            <div className="flex-grow flex flex-col items-center justify-center">
                <AnimatedLogo />
                <h1 className="text-8xl sm:text-9xl md:text-[10rem] font-display tracking-tight mb-2 leading-none">JUNKFU.</h1>
                <p className="text-white/80 text-lg">Lazy calorie tracker</p>
            </div>
            <div className="w-full max-w-sm pb-4 bg-pleasant-green-700/50 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <div className="space-y-3">
                    <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition duration-300 shadow-lg flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,34.466,44,29.625,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                        Continue with Google
                    </button>
                    <button className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition duration-300 shadow-lg flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M17.25,12.39a4.89,4.89,0,0,0-2.32-4.13,4.88,4.88,0,0,0-5.8,2.05,4.76,4.76,0,0,0,1.2,6.58,5,5,0,0,0,6.6-1.28A4.83,4.83,0,0,0,17.25,12.39ZM13.4,6.4A5.36,5.36,0,0,1,16.63,8,4.75,4.75,0,0,1,16.25,11a5.61,5.61,0,0,1-3.23,4.36A5.35,5.35,0,0,1,7.2,12.2a5.4,5.4,0,0,1,3-5.26A5.07,5.07,0,0,1,13.4,6.4Z"></path><path fill="currentColor" d="M15,2.13a4.86,4.86,0,0,0-2.83.9,2.69,2.69,0,0,1,1.15,2.24,2.54,2.54,0,0,1-.83,1.91,3.43,3.43,0,0,0,2.39-.71,5,5,0,0,0,.12-6.54Z"></path></svg>
                        Continue with Apple
                    </button>
                </div>
                 <div className="flex items-center my-4">
                    <hr className="flex-grow border-t border-white/20"/>
                    <span className="px-4 text-sm text-white/60">OR</span>
                    <hr className="flex-grow border-t border-white/20"/>
                </div>
                <button 
                    onClick={onLogin} 
                    className="w-full bg-pleasant-green-500 text-white font-bold py-3 rounded-xl hover:bg-pleasant-green-400 transition duration-300"
                >
                    Continue without Account
                </button>
                <p className="text-xs text-white/50 mt-2">Data stored locally on your device</p>
            </div>
        </div>
    );
}

export default Login;