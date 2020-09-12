import {Component, OnInit} from '@angular/core';
import {WebRTCService} from "~/app/services/web-rtc.service";
import {User} from "~/app/domain/user";

@Component({
    selector: 'ns-caller',
    templateUrl: './caller.component.html',
    styleUrls: ['./caller.component.scss']
})
export class CallerComponent{
    get targets() { return [this.webRTC.callee] }

    constructor(private webRTC: WebRTCService) { }

    call(target: User) {

    }
}
