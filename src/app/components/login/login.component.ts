import {Component} from '@angular/core'
import {WebRTCService} from "~/app/services/web-rtc.service"

@Component({
    selector: 'ns-login', templateUrl: './login.component.html', styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

    constructor(private webRTC: WebRTCService) { }


    async loginCallee() {
        await this.webRTC.loginCallee(this.webRTC.callee)
    }

    async loginCaller() {
        await this.webRTC.loginCaller(this.webRTC.caller)
    }
}
