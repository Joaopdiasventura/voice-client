import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  private socket: Socket;
  private readonly uri: string = API_URL;

  constructor() {
    this.socket = io(this.uri);
  }

  sendOffer(offer: any) {
    this.socket.emit('offer', offer);
  }

  sendAnswer(answer: any) {
    this.socket.emit('answer', answer);
  }

  sendCandidate(candidate: any) {
    this.socket.emit('candidate', candidate);
  }

  onOffer(callback: (offer: any) => void) {
    this.socket.on('offer', callback);
  }

  onAnswer(callback: (answer: any) => void) {
    this.socket.on('answer', callback);
  }

  onCandidate(callback: (candidate: any) => void) {
    this.socket.on('candidate', callback);
  }
}
