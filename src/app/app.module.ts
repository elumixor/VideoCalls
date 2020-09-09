import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { WebRTCModule  } from "nativescript-webrtc-plugin/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from './components/login/login.component';
import { CalleeComponent } from './components/callee/callee.component';
import { CallerComponent } from './components/caller/caller.component';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        WebRTCModule,
        NativeScriptModule,
        AppRoutingModule,
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
