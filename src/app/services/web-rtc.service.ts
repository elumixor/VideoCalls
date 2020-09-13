import {Injectable} from '@angular/core'
import {WebRTCSdpType, WebRTCView} from 'nativescript-webrtc-plugin'
import {WebRTC} from 'nativescript-webrtc-plugin'
import {User} from "~/app/domain/user"
import {SocketIO} from 'nativescript-socketio';

@Injectable({
    providedIn: 'root',
})
export class WebRTCService {
    // readonly users: User[]
    caller: User
    callee: User

    constructor(private socketIO: SocketIO) {
        const [caller, callee] = require('../../../sensitive/users.json')
        this.caller = caller
        this.callee = callee
    }

    loginUser(user: User) {
        return new Promise((resolve) => {
            this.socketIO.connect()

            this.socketIO.on('message', message => console.log('[SEVER] ' + message))
            this.socketIO.on('login', () => {
                this.socketIO.emit('id', user.id)
                console.log(`Successfully logged in as (${user.id})`)
                resolve()
            })
        })
    }

    async loginCallee(user: User) {
        await this.loginUser(user)
    }

    async loginCaller(user: User) {
        await this.loginUser(user)
    }

    async logout() {
        return new Promise(resolve => {
            this.socketIO.disconnect()

            const i = setInterval(() => {
                if (!this.socketIO.connected) {
                    clearInterval(i)
                    resolve()
                }
            })
        })

    }

    async call({id: targetId}: User) {
        console.log('calling ' + targetId)

        const webrtc = new WebRTC({
            enableAudio: true, // default true
            enableVideo: false, // default true
            iceServers: [// Optional defaults to google stun servers
                {url: 'stun:stun.l.google.com:19302'}
                // {url: 'serverRequiresAuth', username: 'username', password: 'password',}
            ],
        })

        // Setup handlers
        webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
            const object = args.object
            const remoteVideoTrack = object.get('remoteVideoTrack')

            console.log('Stream received')
            console.log(remoteVideoTrack)

            // remoteStream = object.get('stream')
            // remoteView.videoTrack = remoteVideoTrack
        })

        webrtc.on('webRTCClientStartCallWithSdp', args => {
            const sdp = args.object.get('sdp')
            const type = args.object.get('type')
            if (type === WebRTCSdpType.ANSWER) {
                webrtc.handleAnswerReceived({
                    sdp: sdp, type: type,
                })
            } else {
                const webRTCData = {sdp, type}
                this.socketIO.emit('call', {targetId, webRTCData})
            }
        })

        webrtc.on('webRTCClientDidGenerateIceCandidate', args => {
            const iceCandidate = args.object.get('iceCandidate')
        })

        // Before using getUserMedia verify the app has the permissions and if not try requesting them
        if (!WebRTC.hasPermissions()) {
            try {
                await WebRTC.requestPermissions()
            } catch (e) {
                console.error(e)
            }
        }

        // localStream = await webrtc.getUserMedia()

        // if (localStream)
        //     webrtc.addLocalStream(localStream);

        webrtc.connect()
        webrtc.makeOffer()
    }
}
