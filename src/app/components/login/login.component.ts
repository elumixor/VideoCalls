import {Component} from '@angular/core'
import {WebRTCService} from "~/app/services/web-rtc.service"
import {Router} from "@angular/router";

@Component({
    selector: 'ns-login', templateUrl: './login.component.html', styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

    constructor(private webRTC: WebRTCService, private router: Router) { }


    async loginCaller() {
        await this.webRTC.init(this.webRTC.caller, this.webRTC.callee)
        console.log('[CALLER] Web RTC init')
        // await this.webRTC.loginCaller(this.webRTC.caller)
        await this.router.navigate(['caller'])
    }

    async loginCallee() {
        await this.webRTC.init(this.webRTC.callee, this.webRTC.caller)
        console.log('[CALLEE] Web RTC init')
        // await this.webRTC.loginCallee(this.webRTC.callee)
        await this.router.navigate(['callee'])
    }
}
