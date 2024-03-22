import { createAsyncThunk } from '@reduxjs/toolkit';
import { updateEmail } from 'firebase/auth';
import { showToast } from '../toast/toastSlice';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { AuthContextType } from '@/components/useAuth';
import { LoadingStateTypes } from '../types';

export const addEmailToUser = createAsyncThunk(
    'updateEmail',
    async (
        args: {
            email: string;
            auth: AuthContextType;
            callback: (args: { type: 'success' } | { type: 'error'; message: string }) => void;
        },
        { dispatch }
    ) => {
        // We need a user in order to update the email address
        if (args.auth.type !== LoadingStateTypes.LOADED) return;

        // Updating a user's email address will potentially be a two step process

        // Step 1: Update the user's account with the email address
        try {
            if (!args.email) {
                dispatch(
                    showToast({
                        message: 'Please enter a valid email address',
                        type: 'info',
                    })
                );
                return;
            }

            // Use the auth object to update the user's email address
            await updateEmail(args.auth.user, args.email);

            dispatch(
                showToast({
                    message: 'Email Address has been updated.',
                    type: 'success',
                })
            );

            firebaseAuth.currentUser?.reload();

            // Let's implement this later if necesssary
            // Step 2: Send the user a verification email
            // await sendEmailVerification(args.auth.user);

            // dispatch(
            //     showToast({
            //         message: 'Verification Code has been sent to your Email.',
            //         type: 'success',
            //     })
            // );

            if (args.callback)
                args.callback({
                    type: 'success',
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
