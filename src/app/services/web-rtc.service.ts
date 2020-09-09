import {Injectable} from '@angular/core'
import {WebRTCView, Quality} from 'nativescript-webrtc-plugin'
import {WebRTC} from 'nativescript-webrtc-plugin'
import {User} from "~/app/shared/User"
import {knownFolders} from "tns-core-modules/file-system"

@Injectable({
    providedIn: 'root',
})
export class WebRTCService {
    // readonly users: User[]

    caller: User
    callee: User

    constructor() {
        const [caller, callee] = require('../../../sensitive/users.json')
        this.caller = caller
        this.callee = callee
    }

    public async setUp(localView: WebRTCView, remoteView: WebRTCView) {
        let remoteStream
        let localStream

        const webrtc = new WebRTC({
            enableAudio: true, // default true
            enableVideo: false, // default true
            iceServers: [// Optional defaults to google stun servers
                {
                    url: 'stun:stun.l.google.com:19302',
                }, {
                    url: 'serverRequiresAuth', username: 'username', password: 'password',
                }],
        })

        console.log(webrtc)

        // Setup handlers
        webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
            const object = args.object
            const remoteVideoTrack = object.get('remoteVideoTrack')
            remoteStream = object.get('stream')
            remoteView.videoTrack = remoteVideoTrack
        })
        webrtc.on('webRTCClientStartCallWithSdp', args => {
            const sdp = args.object.get('sdp')
            const type = args.object.get('type')
            if (type === 'answer') {
                webrtc.handleAnswerReceived({
                    sdp: sdp, type: type,
                })
            } else {
                // send data to signaling server
            }
        })
        webrtc.on('webRTCClientDidGenerateIceCandidate', args => {
            const iceCandidate = args.object.get('iceCandidate')
            // send data to signaling server
        })

        // Before using getUserMedia verify the app has the permissions and if not try requesting them
        if (!WebRTC.hasPermissions()) {
            try {
                await WebRTC.requestPermissions()
                localStream = await webrtc.getUserMedia()
            } catch (e) {
                console.error(e)
            }
        }

        webrtc.connect()
        webrtc.makeOffer()

        // webrtc.addLocalStream(localStream);
    }

    async loginUser(user: User) {
        new WebRTC({
            enableAudio: true, enableVideo: false, iceServers: [{
                url: 'stun:stun.l.google.com:19302',
            }, {
                url: 'serverRequiresAuth', username: 'username', password: 'password',
            }],
        })

        // todo: send data to server with login
    }

    async loginCallee(user: User) {
        await this.loginUser(user)
    }

    async loginCaller(user: User) {
        await this.loginUser(user)
    }
}
