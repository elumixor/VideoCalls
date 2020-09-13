import {Injectable} from '@angular/core'
import {
    WebRTCSdpType,
    WebRTCView,
    TNSRTCPeerConnection,
    TNSRTCConfiguration,
    TNSRTCIceServer,
    TNSRTCIceCandidate, TNSRTCSessionDescription, TNSRTCSdpType, WebRTCSdp, WebRTCIceCandidate,
} from 'nativescript-webrtc-plugin'
import {WebRTC} from 'nativescript-webrtc-plugin'
import {User} from "~/app/domain/user"
import {SocketIO} from 'nativescript-socketio'

@Injectable({
    providedIn: 'root',
})
export class WebRTCService {
    // readonly users: User[]
    caller: User
    callee: User

    private me: User
    private other: User
    private webrtc: WebRTC
    private connection: TNSRTCPeerConnection

    private remoteStream: any;

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
                    break
                }
                case 'call': { // receive call
                    const {from, sdp, sdpType} = data
                    await this.answerCall({sdp, type: sdpType})
                    break
                }
                case 'answered':
                    console.log('Call answered!')
                    this.webrtc.handleAnswerReceived({sdp: data.sdp, type: data.sdpType})
                    break
                default:
                    break
            }
        })

        // this.socketIO.on('call:answer', async data => {
        //     await this.answerCall({
        //         sdp: data.sdp,
        //         type: data.type
        //     });
        // });
        //
        // this.socketIO.on('call:answered', data => {
        //     this.webrtc.handleAnswerReceived({sdp: data.sdp, type: data.type});
        // });
        //
        // this.socketIO.on('call:iceCandidate', data => {
        //     const sdpMid = data.sdpMid;
        //     const sdpMLineIndex = data.sdpMLineIndex;
        //     const sdp = data.sdp;
        //     if (this.webrtc) {
        //         this.webrtc.addIceCandidate({
        //             sdp: sdp,
        //             sdpMid: sdpMid,
        //             sdpMLineIndex: sdpMLineIndex
        //         });
        //     }
        // });

        const p = new Promise<void>(resolve => {
            this.socketIO.on('id:confirmed', () => resolve())
            this.socketIO.on('connected', () => this.socketIO.emit('id', me.id))
        })

        this.socketIO.connect()
        return p
    }

    async call(username) {
        console.log('Starting a call')

        this.webrtc = new WebRTC({
            enableAudio: true,
            enableVideo: true
        });

        if (!WebRTC.hasPermissions())
            await WebRTC.requestPermissions()

        console.log('Permissions granted')

        // this.localStream = await this.webrtc.getUserMedia(4);
        // this.notify({
        //     eventName: 'localStream',
        //     object: fromObject({})
        // });

        this.webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
            console.log('remote video track stream')

            // const object = args.object;
            // this.remoteStream = object.get('stream');
            // const remoteVideoTrack = object.get('remoteVideoTrack');
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
        // this.webrtc.addLocalStream(this.localStream);
        this.webrtc.makeOffer();

        console.log('Offer made')
    }

    async answerCall(sdp: WebRTCSdp, options = {enableVideo: true, enableAudio: true}) {
        console.log('[CALLEE] answer call started')
        this.webrtc = new WebRTC(options);
        if (!WebRTC.hasPermissions())
            await WebRTC.requestPermissions()

        // this.localStream = await this.webrtc.getUserMedia(Quality.HIGHEST);
        // this.notify({
        //     eventName: 'localStream',
        //     object: fromObject({})
        // });

        this.webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
            console.log('[CALLEE] Received Remote Video Track Stream')

            // const object = args.object;
            // const remoteVideoTrack = object.get('remoteVideoTrack');
            // console.log('[TODO] Received remote stream, set to WebRTCView')
            // // this.remoteStream = object.get('stream');
            // // const video = frame
            // //     .topmost()
            // //     .currentPage
            // //     .getViewById('remoteVideoView') as WebRTCView;
            // // if (video) {
            // //     video.videoTrack = remoteVideoTrack;
            // // }
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

        // this.webrtc.addLocalStream(this.localStream);
        this.webrtc.createAnswerForOfferReceived({
            type: sdp.type,
            sdp: sdp.sdp
        });
    }


    // loginUser(user: User) {
    //     this.connection = new TNSRTCPeerConnection(new TNSRTCConfiguration({
    //         iceServers: [
    //             new TNSRTCIceServer(['stun:stun.l.google.com:19302']),
    //             new TNSRTCIceServer(['stun:stun1.l.google.com:19302'])
    //         ],
    //     }))
    //
    //     return new Promise((resolve) => {
    //         this.socketIO.on('message', message => console.log('[SEVER] ' + message))
    //         this.socketIO.on('iceCandidate', ({sdp, sdpMid, sdpMLineIndex}) => {
    //             console.log('Received iceCandidate')
    //             const candidate = new TNSRTCIceCandidate(sdp, sdpMid, sdpMLineIndex)
    //             this.connection.addIceCandidate(candidate)
    //         })
    //
    //         this.socketIO.on('login', () => {
    //             this.socketIO.emit('id', user.id)
    //             console.log(`Successfully logged in as(${user.id})`)
    //             resolve()
    //         })
    //
    //         this.socketIO.connect()
    //     })
    // }
    //
    // async loginCallee(user: User) {
    //     await this.loginUser(user)
    //
    //     this.socketIO.on('call:incoming', async ({targetID, sdp}) => {
    //         console.log(`received call from ${targetID}`)
    //
    //         const remoteSDP = new TNSRTCSessionDescription(TNSRTCSdpType.OFFER, sdp)
    //         await this.connection.setRemoteDescription(remoteSDP)
    //
    //         console.log('here??')
    //
    //         await this.connection.createAnswer({})
    //
    //         console.log(this.connection.localDescription.type)
    //         console.log(sdp.type)
    //     })
    // }
    //
    // async loginCaller(user: User) {
    //     await this.loginUser(user)
    // }

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

//     async call({id: targetID}: User) {
//         console.log('calling ' + targetID)
//
//         this.connection.onIceCandidate(candidate => {
//             console.log('Ice Candidate created!')
//             this.socketIO.emit('iceCandidate', {targetID, candidate})
//         })
//         this.connection.onTrack(track => {
//             console.log('Steam!')
//             // if (track.streams) {
//             //     this.remoteView.srcObject = track.streams[0];
//             // }
//         })
//
//         const sdp = await this.connection.createOffer({})
//         // localDescription == null
//         // console.log(this.connection.localDescription.type) // offer
//         // console.log(sdp.type) // offer
//         // console.log('offer created!')
//         // console.log(sdp)
//
//         await this.connection.setLocalDescription(sdp)
//         console.log('local description')
//         this.socketIO.emit('call', {targetID, sdp})
//         // const webrtc = new WebRTC({
//         //     enableAudio: true, // default true
//         //     enableVideo: false, // default true
//         //     iceServers: [// Optional defaults to google stun servers
//         //         {url: 'stun:stun.l.google.com:19302'}
//         //         // {url: 'serverRequiresAuth', username: 'username', password: 'password',}
//         //     ],
//         // })
//
// // Setup handlers
// // webrtc.on('webRTCClientDidReceiveRemoteVideoTrackStream', args => {
// //     console.log('stream')
// //     const object = args.object
// //     const remoteVideoTrack = object.get('remoteVideoTrack')
// //
// //     console.log('Stream received')
// //     console.log(remoteVideoTrack)
// //
// //     // remoteStream = object.get('stream')
// //     // remoteView.videoTrack = remoteVideoTrack
// // })
// //
// // webrtc.on('webRTCClientStartCallWithSdp', args => {
// //     console.log('start call with sdp')
// //     const sdp = args.object.get('sdp')
// //     const type = args.object.get('type')
// //     if (type === WebRTCSdpType.ANSWER) {
// //         webrtc.handleAnswerReceived({
// //             sdp: sdp, type: type,
// //         })
// //     } else {
// //         console.log(type)
// //         const webRTCData = {sdp, type}
// //         this.socketIO.emit('call', {targetId, webRTCData})
// //     }
// // })
// //
// // webrtc.on('webRTCClientDidGenerateIceCandidate', args => {
// //     console.log('ice candidate')
// //     const iceCandidate = args.object.get('iceCandidate')
// // })
// //
// // console.log('Getting permissions')
// //
// // // Before using getUserMedia verify the app has the permissions and if not try requesting them
// // if (!WebRTC.hasPermissions()) {
// //     try {
// //         await WebRTC.requestPermissions()
// //
// //         // localStream = await webrtc.getUserMedia()
// //
// //         // if (localStream)
// //         //     webrtc.addLocalStream(localStream);
// //
// //         webrtc.connect()
// //         webrtc.makeOffer()
// //     } catch (e) {
// //         console.error(e)
// //     }
// // }
// //
// // console.log('Finished')
//     }
}
