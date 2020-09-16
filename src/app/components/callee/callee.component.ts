import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {WebRTCService} from "~/app/services/web-rtc.service";
import {Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {WebRTCView} from "nativescript-webrtc-plugin";

@Component({
    selector: 'ns-callee',
    templateUrl: './callee.component.html',
    styleUrls: ['./callee.component.scss']
})
export class CalleeComponent implements OnInit, OnDestroy {
    @ViewChild('webRTCRef', {static: false}) webRTCRef: ElementRef

    subscription: Subscription

    inCall: boolean = false

    constructor(private webRTCService: WebRTCService, private router: Router, private detector: ChangeDetectorRef) { }

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

}
