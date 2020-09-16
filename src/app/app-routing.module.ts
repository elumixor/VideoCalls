import {NgModule} from "@angular/core";
import {Routes} from "@angular/router";
import {NativeScriptRouterModule} from "nativescript-angular/router";
import {LoginComponent} from "~/app/components/login/login.component"
import {CalleeComponent} from "~/app/components/callee/callee.component"
import {CallerComponent} from "~/app/components/caller/caller.component"


const routes: Routes = [
    {path: "", redirectTo: "/login", pathMatch: "full"},
    {path: "login", component: LoginComponent},
    {path: "callee", component: CalleeComponent},
    {path: "caller", component: CallerComponent},
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule {}
