import { useEffect, useRef } from 'react';
import socketService from '../services/socket';

/**
 * @param {string} eventName The event to listen for (e.g., 'parcelUpdate').
 * @param {function} callback The function to execute on event reception.
 * @returns {object|null} The Socket.IO connection instance.
 */
export const useSocket = (eventName, callback) => {
  const socketRef = useRef(null);

  useEffect(() => {
   
    if (socketService.socket) {
      socketRef.current = socketService.socket;
    }

    // Use a stable handler wrapper so we can safely off() the same function
    const handler = (payload) => {
      if (typeof callback === 'function') callback(payload);
    };

    if (socketRef.current && eventName && callback) {
      socketRef.current.on(eventName, handler);
    }

    return () => {
      if (socketRef.current && eventName && callback) {
        socketRef.current.off(eventName, handler);
      }
    };
  }, [eventName, callback]);

  // Return the ref so consumers can read `.current` when needed without causing re-renders
  return socketRef;
};