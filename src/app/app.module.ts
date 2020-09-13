import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { WebRTCModule  } from "nativescript-webrtc-plugin/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from './components/login/login.component';
import { CalleeComponent } from './components/callee/callee.component';
import { CallerComponent } from './components/caller/caller.component';
import { SocketIOModule } from "nativescript-socketio/angular";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        WebRTCModule,
        NativeScriptModule,
        AppRoutingModule,
        SocketIOModule.forRoot("http://192.168.0.31:3000"),
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        CalleeComponent,
        CallerComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
