import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {WebRTCService} from "~/app/services/web-rtc.service";

@Component({
    selector: "Home",
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    @ViewChild("remoteVideoView", {static: true}) remoteVideoView: ElementRef
    @ViewChild("localVideoView", {static: true}) localVideoView: ElementRef

    constructor(private webRTCService: WebRTCService) {}

    ngOnInit(): void {
        this.webRTCService.setUp(this.localVideoView.nativeElement, this.remoteVideoView.nativeElement)
    }
}
