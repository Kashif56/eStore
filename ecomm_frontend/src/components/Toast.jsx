import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'error':
        return <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in`}>
      <div
        className={`${getToastStyles()} flex items-center p-4 rounded-lg border shadow-lg min-w-[300px]`}
        role="alert"
      >
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 mr-2">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
        >
          <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
