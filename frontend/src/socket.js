import { io } from 'socket.io-client';


// autoConnect false rakha hai taaki hum manually control kar sakein
export const socket = io("http://localhost:3002", {
    autoConnect: false,
    withCredentials: true,
});