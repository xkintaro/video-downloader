import { useEffect, useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { IoCheckmarkCircle } from "react-icons/io5";
import './kintaroSystemMessages.css';

const KintaroErrorMessage1 = ({
    message,
    autoDismiss = true,
    duration = 5000
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoDismiss && isVisible) {
            const timer = setTimeout(() => setIsVisible(false), duration);
            return () => clearTimeout(timer);
        }
    }, [autoDismiss, duration, isVisible]);

    if (!isVisible) return null;

    return (
        <div className="kintaro-error-message-1 fade-in">
            <IoIosCloseCircle className='kintaro-error-message-1-icon' />
            <p className="kintaro-error-message-1-text">{message}</p>
        </div>
    );
};

const KintaroSuccessMessage1 = ({
    message,
    autoDismiss = true,
    duration = 5000
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoDismiss && isVisible) {
            const timer = setTimeout(() => setIsVisible(false), duration);
            return () => clearTimeout(timer);
        }
    }, [autoDismiss, duration, isVisible]);

    if (!isVisible) return null;

    return (
        <div className="kintaro-success-message-1 fade-in">
            <IoCheckmarkCircle className='kintaro-success-message-1-icon' />
            <p className="kintaro-success-message-1-text">{message}</p>
        </div>
    );
};

export { KintaroErrorMessage1, KintaroSuccessMessage1 };
