import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    ConfirmationResult,
    PhoneAuthProvider,
    RecaptchaVerifier,
    linkWithPhoneNumber,
    updatePhoneNumber,
} from 'firebase/auth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { showToast } from '../toast/toastSlice';
import { LoadingStateTypes } from '../types';
import { AuthContextType } from '@/components/useAuth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const sendVerificationCode = createAsyncThunk(
    'sendVerificationCode',
    async (
        args: {
            phoneNumber: string;
            auth: AuthContextType;
            recaptchaResolved: boolean;
            recaptcha: RecaptchaVerifier | null;
            callback: (
                args:
                    | { type: 'success'; confirmationResult: ConfirmationResult }
                    | {
                          type: 'error';
                          message: string;
                      }
            ) => void;
        },
        { dispatch }
    ) => {
        // If the user is signing up with phone number, they will not be logged in yet.
        if (args.auth.type !== LoadingStateTypes.LOADED) return;
        if (!args.recaptchaResolved || !args.recaptcha) {
            dispatch(showToast({ message: 'First Resolved the Captcha', type: 'info' }));
            return;
        }
        if (args.phoneNumber.slice() === '' || args.phoneNumber.length < 10) {
            dispatch(
                showToast({
                    message: 'Enter the Phone Number and provide the country code',
                    type: 'info',
                })
            );
            return;
        }

        try {
            const confirmationResult = await linkWithPhoneNumber(
                args.auth.user,
                args.phoneNumber,
                args.recaptcha
            );

            dispatch(
                showToast({
                    message: 'Verification Code has been sent to your Phone',
                    type: 'success',
                })
            );

            if (args.callback)
                args.callback({
                    type: 'success',
                    confirmationResult: confirmationResult,
                });
        } catch (error: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                    type: 'error',
                })
            );
            if (args.callback)
                args.callback({
                    type: 'error',
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                });
        }
    }
);

export const useSendVerificationCodeLoading = () => {
    const loading = useSelector((state: RootState) => state.loading.sendVerificationCode);
    return loading;
};

export const verifyPhoneNumber = createAsyncThunk(
    'verifyPhoneNumber',
    async (
        args: {
            signUpType: string | undefined;
            OTPCode: string;
            auth: AuthContextType;
            // Brought in the entire confirmationResult object to be able to call the confirm method on it
            confirmationResult: ConfirmationResult | null | undefined;
            callback: (
                args:
                    | { type: 'success' }
                    | {
                          type: 'error';
                          message: string;
                      }
            ) => void;
        },
        { dispatch }
    ) => {
        // If the confirmationResult is null, then the user has not yet requested the OTP, return
        if (!args.confirmationResult) return;

        // If the user is signing up with phone number, they will not be logged in yet.
        if (args.signUpType !== 'phone') {
            if (args.auth.type !== LoadingStateTypes.LOADED) return;
        }

        // If the OTPCode or verificationId is null, then the user has not yet requested the OTP
        if (args.OTPCode === null || !args.confirmationResult.verificationId) return;

        try {
            if (args.signUpType !== 'phone' && args.auth.type === LoadingStateTypes.LOADED) {
                const credential = PhoneAuthProvider.credential(
                    args.confirmationResult.verificationId,
                    args.OTPCode
                );
                await updatePhoneNumber(args.auth.user, credential);
            }

            if (args.signUpType === 'phone' && args.confirmationResult) {
                await args.confirmationResult.confirm(args.OTPCode);
            }

            if (firebaseAuth.currentUser) {
                firebaseAuth.currentUser?.reload();
            }

            dispatch(
                showToast({
                    message: 'Logged in Successfully',
                    type: 'success',
                })
            );

            args.callback({ type: 'success' });
        } catch (error: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                    type: 'error',
                })
            );
            if (args.callback)
                args.callback({
                    type: 'error',
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                });
        }
    }
);

export const useVerifyPhoneNumberLoading = () => {
    const loading = useSelector((state: RootState) => state.loading.verifyPhoneNumber);
    return loading;
};
