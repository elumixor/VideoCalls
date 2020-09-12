import {Component, OnDestroy, OnInit} from "@angular/core";
import {SocketIO} from "nativescript-socketio";
import {WebRTCService} from "~/app/services/web-rtc.service";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent implements OnDestroy {
    constructor(private webRTCService: WebRTCService) {}

    ngOnDestroy() {
        this.webRTCService.logout()
    }
}
