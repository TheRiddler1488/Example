import { _decorator, Component, Enum, Label } from 'cc';
const { ccclass, property } = _decorator;

export enum GateType {
    ADD = 0,
    MULTIPLY = 1,
    SUBTRACT = 2,
    DIVIDE = 3
}
Enum(GateType);

@ccclass('MathGate')
export class MathGate extends Component {
    @property({ type: GateType })
    public gateType: GateType = GateType.ADD;

    @property
    public value: number = 2;

    @property({ type: Label, tooltip: 'Ссылка на дочерний текст' })
    public textLabel: Label | null = null;

    start() {
        if (this.textLabel) {
            let symbol = '';

            switch (this.gateType) {
                case GateType.ADD:
                    symbol = '+';
                    break;
                case GateType.MULTIPLY:
                    symbol = 'x';
                    break;
                case GateType.SUBTRACT:
                    symbol = '-';
                    break;
                case GateType.DIVIDE:
                    symbol = '÷';
                    break;
            }

            this.textLabel.string = `${symbol}${this.value}`;
        }
    }

    public calculateNewCount(currentCount: number): number {
        let result = currentCount;

        switch (this.gateType) {
            case GateType.ADD:
                result += this.value;
                break;
            case GateType.MULTIPLY:
                result *= this.value;
                break;
            case GateType.SUBTRACT:
                result -= this.value;
                break;
            case GateType.DIVIDE:
                if (this.value !== 0) {
                    result /= this.value;
                }
                break;
        }

        return Math.max(0, Math.floor(result));
    }
}
