import { createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { showToast } from '../toast/toastSlice';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';

export const loginWithPhoneNumber = createAsyncThunk(
    'login',
    async (
        args: {
            phoneNumber: string;
            recaptcha: RecaptchaVerifier;
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
        try {
            if (!args.phoneNumber) {
                dispatch(
                    showToast({
                        message: 'Enter a valid phone number',
                        type: 'info',
                    })
                );
                return;
            }

            // Firebase doesn't provide a specific method for signing up with phone number.
            // The signInWithPhoneNumber method can be used for both sign up and sign in.

            const confirmationResult: ConfirmationResult = await signInWithPhoneNumber(
                firebaseAuth,
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
        } catch (e: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(e.code),
                    type: 'error',
                })
            );
        }
    }
);

// Loading state for loginWithPhoneNumber isn't needed, since we are using the verifying phone number loading state instead.
