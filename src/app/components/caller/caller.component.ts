import {Component, OnDestroy} from '@angular/core';
import {WebRTCService} from "~/app/services/web-rtc.service";
import {User} from "~/app/domain/user";

@Component({
    selector: 'ns-caller',
    templateUrl: './caller.component.html',
    styleUrls: ['./caller.component.scss']
})
export class CallerComponent implements OnDestroy {
    get targets() { return [this.webRTCService.callee] }

    constructor(private webRTCService: WebRTCService) { }

    call(target: User) {
        this.webRTCService.call(target)
    }

    ngOnDestroy(): void {
        this.webRTCService.logout().then(() => console.log('Logged out'))
    }
}
