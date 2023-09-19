import { io, Socket } from 'socket.io-client'

type Fof<T extends any[]> = (...args: T) => void;
type Hack<T extends any[]> = T;

class SockManager {
	socket: Socket;
	options: any;
	constructor() {
		// FIXME: Somehow get dynamically the url of the server.
		this.socket = io('http://localhost:3000', {
			withCredentials: true
		});
	}

	// We need to "Omit" the type of the callback because otherwise Typescript would not
	// allow us to spread the dictionary we are getting from the socket.
	on(ev: string, cb: Fof<any[]>) {
		this.socket.on(ev, cb);
	}

	emit(ev: string, ...args: Hack<any[]>) {
		this.socket.emit(ev, args);
	}

	off(ev: string, cb?: Fof<any[]>) {
		this.socket.off(ev, cb);
	}
}

export const socket = new SockManager();