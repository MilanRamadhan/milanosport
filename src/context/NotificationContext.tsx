import React, { createContext, useContext, useState, useCallback } from "react";
import Notification, { type NotificationType } from "../components/common/Notification";

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
  success: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

interface NotificationData {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((type: NotificationType, title: string, message: string, duration: number = 5000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("success", title, message, duration);
    },
    [showNotification]
  );

  const error = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("error", title, message, duration);
    },
    [showNotification]
  );

  const warning = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("warning", title, message, duration);
    },
    [showNotification]
  );

  const info = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("info", title, message, duration);
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}
      <div style={{ position: "fixed", top: 0, right: 0, zIndex: 10000 }}>
        {notifications.map((notification, index) => (
          <div key={notification.id} style={{ marginTop: index > 0 ? "0.5rem" : 0 }}>
            <Notification type={notification.type} title={notification.title} message={notification.message} duration={notification.duration} onClose={() => removeNotification(notification.id)} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
