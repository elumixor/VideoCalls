import {EventEmitter, Injectable} from '@angular/core'
import {
    WebRTCSdpType,
    WebRTCView,
    TNSRTCPeerConnection,
    TNSRTCConfiguration,
    TNSRTCIceServer,
    TNSRTCIceCandidate,
    TNSRTCSessionDescription,
    TNSRTCSdpType,
    WebRTCSdp,
    WebRTCIceCandidate,
    Quality,
} from 'nativescript-webrtc-plugin'
import {WebRTC} from 'nativescript-webrtc-plugin'
import {User} from "~/app/domain/user"
import {SocketIO} from 'nativescript-socketio'

@Injectable({
    providedIn: 'root',
})
export class WebRTCService {
    caller: User
    callee: User

    private _stream: any
    get stream() { return this._stream }

    private me: User
    private other: User
    private webrtc: WebRTC

    readonly onLocalStreamReceived = new EventEmitter<any>()
    readonly onMessage = new EventEmitter<any>()

    constructor(private socketIO: SocketIO) {
        const [caller, callee] = require('../../../sensitive/users.json')
        this.caller = caller
        this.callee = callee
    }

    init(me: User, other: User): Promise<void> {
        this.me = me
        this.other = other

        this.socketIO.on('targeted', async data => {
            const {type} = data
            switch (type) {
                case 'iceCandidate': {
                    console.log(`Received iceCandidate from ${data.from}`)
                    const {sdp, sdpMid, sdpMLineIndex} = data
                    if (this.webrtc) this.webrtc.addIceCandidate({sdp, sdpMid, sdpMLineIndex})
                    return
                }
                case 'call': { // receive call
                    const {from, sdp, sdpType} = data
                    await this.answerCall({sdp, type: sdpType})
                    return
                }
                case 'answered':
                    console.log('Call answered!')
                    this.webrtc.handleAnswerReceived({sdp: data.sdp, type: data.sdpType})
                    return
            }

            // targeted message has not been handled -> notify observers
            this.onMessage.emit(data)
        })

        const p = new Promise<void>(resolve => {
            this.socketIO.on('connected', () => this.socketIO.emit('id', me.id))
            this.socketIO.on('id:confirmed', () => resolve())
        })

        this.socketIO.connect()
        return p
    }

    async call() {
        console.log('Starting a call')

        this.webrtc = new WebRTC({
            enableAudio: true,
            enableVideo: true
        });

        if (!WebRTC.hasPermissions())
            await WebRTC.requestPermissions()

        console.log('Permissions granted')

        this.webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
            console.log('remote video track stream')


            const object = args.object;
            const remoteVideoTrack = object.get('remoteVideoTrack');
            // this._stream = object.get('stream');
            this._stream = remoteVideoTrack.streams[0] // ?

            console.log(remoteVideoTrack)

            this.onLocalStreamReceived.emit(this._stream)

            // const object = args.object;
            // this.remoteStream = object.get('stream');
            // const video = frame.topmost().currentPage.getViewById('remoteVideoView') as any;
            // if (video) {
            //     video.videoTrack = remoteVideoTrack;
            // }
        })

        this.webrtc.on('webRTCClientStartCallWithSdp', args => {
            console.log('Client Start call with sdp')

            const sdp = args.object.get('sdp');
            const type = args.object.get('type');

            if (type == WebRTCSdpType.ANSWER) {
                console.warn('CALLER\'S SDP WAS ANSWER????')
                return
            }

            this.socketIO.emit('targeted', {
                type: 'call',
                to: this.other.id,
                sdp: sdp,
                sdpType: type
            });
        })

        this.webrtc.on('webRTCClientDidGenerateIceCandidate', args => {
            console.log('Generated Ice Candidate')

            let iceCandidate = args.object.get('iceCandidate');

            this.socketIO.emit('targeted',
                {to: this.other.id, type: 'iceCandidate', ...iceCandidate})
        })

        this.webrtc.connect();
        this.webrtc.makeOffer();

        console.log('Offer made')
    }

    async answerCall(sdp: WebRTCSdp, options = {enableVideo: true, enableAudio: true}) {
        console.log('[CALLEE] answer call started')
        this.webrtc = new WebRTC(options);

        if (!WebRTC.hasPermissions())
            await WebRTC.requestPermissions()

        this._stream = await this.webrtc.getUserMedia(Quality.HIGHEST);
        this.onLocalStreamReceived.emit(this._stream)

        this.webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
            console.log('[CALLEE] Received Remote Video Track Stream')

            // const object = args.object;
            // this._stream = object.get('stream');
            // this.onLocalStreamReceived.emit(this._stream)

        });
        this.webrtc.on('webRTCClientStartCallWithSdp', args => {
            console.log('[CALLEE] Start Call With SDP')

            const _sdp = args.object.get('sdp');
            const _type = args.object.get('type');

            if (_type === WebRTCSdpType.ANSWER) {
                this.socketIO.emit('targeted', {
                    type: 'answered', to: this.other.id, sdp: _sdp, sdpType: _type
                });
            }
        });
        this.webrtc.on('webRTCClientDidGenerateIceCandidate', args => {
            console.log('[CALLEE] Client Generated Ice Candidate')
            const iceCandidate = args.object.get('iceCandidate') as WebRTCIceCandidate;
            this.socketIO.emit('targeted',
                {type: 'iceCandidate', to: this.other.id, ...iceCandidate})
        });

        this.webrtc.connect();

        this.webrtc.addLocalStream(this.stream)
        this.webrtc.createAnswerForOfferReceived({
            type: sdp.type,
            sdp: sdp.sdp
        })

    }

    async logout() {
        return new Promise(resolve => {
            this.socketIO.disconnect()
            this.webrtc.disconnect()

            const i = setInterval(() => {
                if (!this.socketIO.connected) {
                    clearInterval(i)
                    resolve()
                }
            })
        })
    }

    sendMessage(to: User, data: any) {
        // send via signaling server for now
        this.socketIO.emit('targeted', data)

        // todo: try to notify to send message
        // this.webrtc.notify()
        // this.webrtc.on( ??? )
    }
}
