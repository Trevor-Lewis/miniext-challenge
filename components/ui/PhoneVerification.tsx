/* eslint-disable @next/next/no-img-element */
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
import { showToast } from '@/components/redux/toast/toastSlice';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';
import Logout from './Logout';
import { useAuth } from '../useAuth';
import { LoadingStateTypes } from '../redux/types';
import {
    sendVerificationCode,
    useSendVerificationCodeLoading,
    useVerifyPhoneNumberLoading,
    verifyPhoneNumber,
} from '../redux/auth/verifyPhoneNumber';
import { loginWithPhoneNumber } from '../redux/auth/loginWithPhoneNumber';
import OneTimePassword from './OneTimePassword';

interface PhoneVerificationProps {
    signUpType?: string;
    setSignUpType?: Dispatch<SetStateAction<'email' | 'phone'>>;
    authType?: 'login' | 'signup';
}

const PhoneVerification = ({ authType, signUpType }: PhoneVerificationProps) => {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('+10000000000');
    const [phoneNumberValid, setPhoneNumberValid] = useState(false);
    const [OTPCode, setOTPCode] = useState('');
    const [show, setShow] = useState(false);

    const sendVerificationLoading = useSendVerificationCodeLoading();
    const verifyPhoneNumberLoading = useVerifyPhoneNumberLoading();

    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>();
    const [submitButtonText, setSubmitButtonText] = useState('Send OTP');
    const router = useRouter();

    const handleSignUpWithPhone = async () => {
        if (recaptcha == null) return;

        // Sign Up user with phone number
        dispatch(
            loginWithPhoneNumber({
                phoneNumber,
                recaptcha: recaptcha,
                callback: (result) => {
                    if (result.type === 'error') {
                        setRecaptchaResolved(false);
                        return;
                    }
                    if (result.type === 'success') {
                        if (signUpType === 'phone') {
                            setConfirmationResult(result.confirmationResult);
                        }
                        setVerificationId(result.confirmationResult.verificationId);
                        if (!signUpType || signUpType === 'email') {
                            setShow(true);
                        }
                    }
                },
            })
        );
    };

    // Sending OTP and storing id to verify it later
    const handleSendVerification = async () => {
        if (auth.type !== LoadingStateTypes.LOADED) return;

        dispatch(
            sendVerificationCode({
                phoneNumber,
                auth,
                recaptcha,
                recaptchaResolved,
                callback: (result) => {
                    if (result.type === 'error') {
                        setRecaptchaResolved(false);
                        return;
                    }
                    setConfirmationResult(result.confirmationResult);
                    if (!signUpType || signUpType === 'email') {
                        setShow(true);
                    }
                },
            })
        );
    };

    // Validating the filled OTP by user
    const ValidateOtp = async () => {
        // If the user is signing up with phone number, they will not be logged in yet.
        if (signUpType !== 'phone') {
            if (auth.type !== LoadingStateTypes.LOADED) return;
        }

        dispatch(
            verifyPhoneNumber({
                signUpType,
                auth,
                OTPCode,
                confirmationResult,
                callback: (result) => {
                    if (result.type === 'error') {
                        return;
                    }
                    if (result.type === 'success') {
                        // needed to reload auth user
                        router.refresh();
                    }
                },
            })
        );
    };

    // generating the recaptcha on page render
    useEffect(() => {
        const captcha = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {
                setRecaptchaResolved(true);
            },

            'expired-callback': () => {
                setRecaptchaResolved(false);
                dispatch(
                    showToast({
                        message: 'Recaptcha Expired, please verify it again',
                        type: 'info',
                    })
                );
            },
        });

        captcha.render();

        setRecaptcha(captcha);
    }, []);

    useEffect(() => {
        // Fake verification of phone number format
        if (recaptchaResolved) {
            setPhoneNumberValid(true);
        } else {
            setPhoneNumberValid(false);
        }
    }, [phoneNumber, recaptchaResolved]);

    useEffect(() => {
        if (authType === 'signup') {
            setSubmitButtonText('Sign Up');
        }
        if (authType === 'login' || (!authType && !signUpType)) {
            setSubmitButtonText('Login');
        }
    }, [authType]);

    const signUpStylingContainer = signUpType === 'phone' ? '' : 'shadow-lg py-2 px-4';
    const signUpStylingSpacing =
        signUpType === 'phone' ? '' : 'min-h-full px-4 py-12 sm:px-6 lg:px-8';
    const signUpStylingPadding = signUpType === 'phone' ? '' : 'pb-10 px-4 p-4';

    return (
        <div className={`flex items-center justify-center ${signUpStylingSpacing}`}>
            <div className="w-full max-w-md space-y-8">
                {!signUpType && (
                    <div>
                        <img
                            className="w-auto h-12 mx-auto"
                            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                            alt="Workflow"
                        />
                        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                            Sign in to your account
                        </h2>
                    </div>
                )}
                {verificationId === '' && (
                    <div
                        className={`max-w-xl w-full rounded overflow-hidden ${signUpStylingContainer}`}
                    >
                        <div className={`flex gap-4 flex-col ${signUpStylingPadding}`}>
                            <Input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="phone number"
                                type="text"
                            />
                            <div id="recaptcha-container" />
                            <LoadingButton
                                onClick={
                                    signUpType === 'phone'
                                        ? handleSignUpWithPhone
                                        : handleSendVerification
                                }
                                loading={sendVerificationLoading}
                                disabled={!phoneNumberValid}
                                loadingText="Sending OTP"
                            >
                                {/* {authType === 'signup' && signUpType === 'phone' && 'Sign Up'}
                                {authType === 'login' && signUpType === 'phone' && 'Login'}
                                {authType === 'signup' && !signUpType && 'Send OTP'} */}
                                {submitButtonText}
                            </LoadingButton>
                        </div>
                    </div>
                )}
                <Modal show={show} setShow={setShow}>
                    <OneTimePassword
                        verifyPhoneNumberLoading={verifyPhoneNumberLoading}
                        setOTPCode={setOTPCode}
                        OTPCode={OTPCode}
                        ValidateOtp={ValidateOtp}
                    />
                </Modal>
                {signUpType === 'phone' && verificationId !== '' && (
                    <OneTimePassword
                        verifyPhoneNumberLoading={verifyPhoneNumberLoading}
                        setOTPCode={setOTPCode}
                        OTPCode={OTPCode}
                        ValidateOtp={ValidateOtp}
                    />
                )}

                {!signUpType && (
                    <div className="flex w-full flex-col">
                        <Logout />
                    </div>
                )}
            </div>
            <ToastBox />
        </div>
    );
};

export default PhoneVerification;
