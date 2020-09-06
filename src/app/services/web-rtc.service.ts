import {Injectable} from '@angular/core';
import {WebRTCView, Quality} from 'nativescript-webrtc-plugin';
import {WebRTC} from 'nativescript-webrtc-plugin';

@Injectable({
    providedIn: 'root'
})
export class WebRTCService {

    constructor() { }

    public setUp(localView: WebRTCView, remoteView: WebRTCView) {
        let remoteStream
        let localStream

        const webrtc = new WebRTC({
            enableAudio: true, // default true
            enableVideo: false, // default true
            iceServers: [
                // Optional defaults to google stun servers
                {
                    url: 'stun:stun.l.google.com:19302'
                },
                {
                    url: 'serverRequiresAuth',
                    username: 'username',
                    password: 'password'
                }
            ]
        });

        webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
            const object = args.object;
            const remoteVideoTrack = object.get('remoteVideoTrack');
            remoteStream = object.get('stream');
            remoteView.videoTrack = remoteVideoTrack;
        });

        webrtc.on('webRTCClientStartCallWithSdp', args => {
            const sdp = args.object.get('sdp');
            const type = args.object.get('type');
            if (type === 'answer') {
                webrtc.handleAnswerReceived({
                    sdp: sdp,
                    type: type
                });
            } else {
                // send data to signaling server
            }
        });

        webrtc.on('webRTCClientDidGenerateIceCandidate', args => {
            const iceCandidate = args.object.get('iceCandidate');
            // send data to signaling server
        });

        // Before using getUserMedia verify the app has the permissions and if not try requesting them
        if (!WebRTC.hasPermissions()) {
            WebRTC.requestPermissions().then(() => {
                webrtc.getUserMedia(Quality.HIGHEST).then(stream => {
                    localStream = stream
                    localView.videoTrack = stream
                    webrtc.connect();
                    webrtc.addLocalStream(localStream);
                    webrtc.makeOffer();
                })
            });
        }

    }
}
