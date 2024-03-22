/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/components/redux/store';

import { useAuth } from '../useAuth';
import { showToast } from '../redux/toast/toastSlice';
import { LoadingStateTypes } from '../redux/types';
import { addEmailToUser } from '../redux/auth/addEmailToUser';
import Input from './Input';
import LoadingButton from './LoadingButton';

const AddEmailToAccount = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const router = useRouter();

    const [show, setShow] = useState(true);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Set interval to show the modal if the modal is closed
        // This is to show the modal again if the user closes it
        setInterval(() => {
            if (!show) setShow(true);
        }, 3000);
    }, [show]);

    const handleAddEmailToAccount = () => {
        // Add email to users account via dispatch
        dispatch(
            addEmailToUser({
                email: email,
                auth,
                callback: (result) => {
                    if (result.type === 'success') {
                        setShow(false);
                        router.refresh();
                    } else {
                        dispatch(
                            showToast({
                                message: 'Error adding email to account',
                                type: 'error',
                            })
                        );
                    }
                },
            })
        );
    };

    return (
        <div>
            {auth.type === LoadingStateTypes.LOADED && (
                <>
                    {/* Pops up when user has submitted their email */}
                    <Modal show={show} setShow={setShow}>
                        <div className="max-w-xl w-full flex flex-col justify-center items-center bg-white py-6 rounded-lg">
                            <h1 className="text-lg font-semibold text-center mb-10 w-3/4">
                                We need your email to send you important notifications and updates.
                            </h1>
                            <div className="px-4 flex items-center gap-4 pb-10">
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    type="text"
                                />
                                <LoadingButton onClick={handleAddEmailToAccount}>
                                    Submit
                                </LoadingButton>
                            </div>
                        </div>
                    </Modal>
                </>
            )}

            {/* Error message to show user in case a problem occurs, super generic for now */}
            {auth.type !== LoadingStateTypes.LOADED && (
                <div className="max-w-xl w-full flex flex-col justify-center items-center bg-white py-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-center mb-10">
                        Whoops! Something went wrong, please try again later.
                    </h2>
                </div>
            )}
        </div>
    );
};

export default AddEmailToAccount;
