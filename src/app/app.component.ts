import { Component, inject, OnInit } from '@angular/core';
import { SignalService } from './core/services/signal/signal.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  localStream!: MediaStream;
  peerConnection!: RTCPeerConnection;
  configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  private signalService = inject(SignalService);

  async ngOnInit() {
    await this.initMedia();
    this.initPeerConnection();
    this.handleSignaling();
  }

  async initMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      console.log('Stream de áudio capturado');
    } catch (error) {
      console.error('Erro ao acessar o microfone:', error);
    }
  }

  initPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.peerConnection.ontrack = (event) => {
      const remoteAudio = document.getElementById(
        'remoteAudio'
      ) as HTMLAudioElement;
      if (remoteAudio && event.streams && event.streams[0]) {
        remoteAudio.srcObject = event.streams[0];
        remoteAudio
          .play()
          .catch((err) =>
            console.error('Erro ao reproduzir áudio remoto:', err)
          );
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalService.sendCandidate(event.candidate);
      }
    };
  }

  handleSignaling() {
    this.signalService.onOffer(async (offer) => {
      console.log('Oferta recebida:', offer);
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.signalService.sendAnswer(answer);
    });

    this.signalService.onAnswer(async (answer) => {
      console.log('Resposta recebida:', answer);
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    this.signalService.onCandidate((candidate) => {
      console.log('Candidato ICE recebido:', candidate);
      this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }

  async startCall() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.signalService.sendOffer(offer);
  }
}
