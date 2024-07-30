import { io } from 'socket.io-client';

export function getSocketForUrl(URL) {
  return io(URL)
}