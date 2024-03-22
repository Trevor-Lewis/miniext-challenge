import Input from './Input';
import LoadingButton from './LoadingButton';

interface OneTimePasswordProps {
    verifyPhoneNumberLoading: boolean;
    setOTPCode: (code: string) => void;
    OTPCode: string;
    ValidateOtp: () => void;
}

const OneTimePassword = ({
    verifyPhoneNumberLoading,
    setOTPCode,
    OTPCode,
    ValidateOtp,
}: OneTimePasswordProps) => {
    return (
        <div className="max-w-xl w-full flex flex-col justify-center items-center bg-white py-6 rounded-lg">
            <h2 className="text-lg font-semibold text-center mb-10">Enter Code to Verify</h2>
            <div className="px-4 flex items-center gap-4 pb-10">
                <Input
                    value={OTPCode}
                    type="text"
                    placeholder="Enter your OTP"
                    onChange={(e) => setOTPCode(e.target.value)}
                />

                <LoadingButton
                    onClick={ValidateOtp}
                    loading={verifyPhoneNumberLoading}
                    loadingText="Verifying..."
                >
                    Verify
                </LoadingButton>
            </div>
        </div>
    );
};

export default OneTimePassword;
