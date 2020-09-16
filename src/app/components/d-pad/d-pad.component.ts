import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DPadAction} from "~/app/domain/d-pad-action";
import {GridLayout} from "tns-core-modules"

@Component({
    selector: 'ns-d-pad',
    templateUrl: './d-pad.component.html',
    styleUrls: ['./d-pad.component.scss']
})
export class DPadComponent extends GridLayout {
    @Output() actionReceived = new EventEmitter<DPadAction>()
    @Input() size: number | string = 50

    get rows() { return `${this.size}, ${this.size}, ${this.size}`}
    get columns() { return this.rows }

    tapUp() { this.actionReceived.emit(DPadAction.MoveForward) }
    tapDown() { this.actionReceived.emit(DPadAction.MoveBackward) }
    tapLeft() { this.actionReceived.emit(DPadAction.MoveLeft) }
    tapRight() { this.actionReceived.emit(DPadAction.MoveRight) }
}
