import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebRTCService} from "~/app/services/web-rtc.service";

@Component({
    selector: 'ns-callee',
    templateUrl: './callee.component.html',
    styleUrls: ['./callee.component.scss']
})
export class CalleeComponent implements OnInit, OnDestroy {
    constructor(private webRTCService: WebRTCService) { }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.webRTCService.logout().then(() => console.log('Logged out'))
    }

}
