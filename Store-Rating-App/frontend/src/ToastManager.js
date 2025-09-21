import React, { createContext, useState, useContext, useEffect } from "react";
import "./css/Toast.css";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "error", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  
  useEffect(() => {
    window.alert = (msg) => addToast(msg, "info");
    window.confirm = (msg) => {
      addToast(msg, "info");
      return true; 
    };
    window.prompt = (msg, defaultVal = "") => {
      addToast(msg, "info");
      return defaultVal; 
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
            <button className="close-toast" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
