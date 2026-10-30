import { _decorator, Component, input, Input, EventTouch, Vec3, math } from 'cc';
import { eventBus } from '../Managers/EventBus';
import { AudioManager } from '../Audio/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('RunnerMovement')
export class RunnerMovement extends Component {
    @property({ tooltip: 'Скорость бега вперед' })
    public forwardSpeed: number = 10;

    public isStarted: boolean = false;
    public isBattling: boolean = false;

    @property({ tooltip: 'Чувствительность свайпа' })
    public swipeSensitivity: number = 0.05;

    @property({ tooltip: 'Ширина дороги (ограничение влево/вправо)' })
    public roadLimit: number = 4;

    @property({ tooltip: 'Плавность свайпа (больше = резче)' })
    public lerpSpeed: number = 15;

    private _targetX: number = 0;
    private _currentPos: Vec3 = new Vec3();

    start() {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this._targetX = this.node.position.x;
        eventBus.on('GAME_START', this.onGameStart, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        eventBus.off('GAME_START', this.onGameStart, this);
    }

    private onGameStart() {
        this.isStarted = true;
    }

    onTouchMove(event: EventTouch) {
        if (!this.isStarted || this.isBattling) return;
        this._targetX += event.getDeltaX() * this.swipeSensitivity;
        this._targetX = math.clamp(this._targetX, -this.roadLimit, this.roadLimit);

        if (AudioManager.instance) {
            AudioManager.instance.playBGM();
        }
    }

    update(deltaTime: number) {
        if (!this.isStarted) return;

        this.node.getPosition(this._currentPos);

        this._currentPos.x = math.lerp(this._currentPos.x, this._targetX, this.lerpSpeed * deltaTime);

        if (this.isBattling) {
            let battlePushSpeed = this.forwardSpeed * 0.3;
            this._currentPos.z -= battlePushSpeed * deltaTime;
        } else {
            this._currentPos.z -= this.forwardSpeed * deltaTime;
        }

        this.node.setPosition(this._currentPos);
    }
}
