import { io } from 'socket.io-client';

const SOCKET_URL =  'https://curier-server.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('accessToken')
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinParcel(trackingId) {
    if (this.socket) {
      this.socket.emit('joinParcel', trackingId);
    }
  }

  onParcelUpdate(callback) {
    if (this.socket) {
      this.socket.on('parcelUpdate', callback);
    }
  }

  offParcelUpdate() {
    if (this.socket) {
      this.socket.off('parcelUpdate');
    }
  }
}

export default new SocketService();