import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {WebRTCService} from "~/app/services/web-rtc.service";
import {User} from "~/app/domain/user";
import {WebRTCView} from "nativescript-webrtc-plugin";
import {Subscription} from "rxjs";
import {DPadAction} from '~/app/domain/d-pad-action';

@Component({
    selector: 'ns-caller',
    templateUrl: './caller.component.html',
    styleUrls: ['./caller.component.scss']
})
export class CallerComponent implements OnInit, OnDestroy {
    @ViewChild('webRTCRef', {static: false}) webRTCRef: ElementRef

    inCall: boolean = false
    private subscription: Subscription

    get targets() { return [this.webRTCService.callee] }

    constructor(private webRTCService: WebRTCService, private detector: ChangeDetectorRef) { }

    async call(target: User) {
        await this.webRTCService.call()
    }

    ngOnInit(): void {
        this.subscription = this.webRTCService.onLocalStreamReceived.subscribe(async stream => {
            this.inCall = true
            const webRTCView = this.webRTCRef.nativeElement as WebRTCView
            webRTCView.srcObject = stream;
            this.detector.detectChanges()
        })
    }

    ngOnDestroy(): void {
        this.webRTCService.logout().then(() => console.log('Logged out'))
        this.subscription.unsubscribe()
    }

    onDPadAction(action: DPadAction) {
        this.webRTCService.sendMessage(this.webRTCService.callee, {type:'action', action})
    }
}
