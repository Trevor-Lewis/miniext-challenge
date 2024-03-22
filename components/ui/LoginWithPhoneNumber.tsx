import Image from 'next/image';
import GoogleGLogo from '@/public/statics/images/google-g-logo.svg';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebaseAuth';

interface LoginWithGoogleButtonProps {
    onClick: () => void;
    handleLoginWithPhoneNumber: () => void;
}

/**
 * Use this component to trigger Google modal and login with Google account
 * @returns
 */
const LoginWithPhoneNumber = (props: LoginWithGoogleButtonProps) => {
    return (
        <button
            onClick={props.onClick}
            className="transition-colors bg-violet-600 text-white font-medium px-4 py-2 rounded-md hover:bg-violet-700 disabled:bg-violet-400"
        >
            <div className="ml-2">Phone Number</div>
        </button>
    );
};

export default LoginWithPhoneNumber;
