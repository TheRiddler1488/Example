import { _decorator, Component, Node, tween, Vec3, input, Input, EventTouch, UIOpacity } from 'cc';
import { eventBus } from '../Managers/EventBus';
const { ccclass, property } = _decorator;

@ccclass('TutorialUI')
export class TutorialUI extends Component {
    @property(Node)
    handIcon: Node = null;

    private _isTutorialActive: boolean = true;

    start() {
        this.startSwipeAnimation();

        input.on(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    private startSwipeAnimation() {
        if (!this.handIcon) return;

        tween(this.handIcon)
            .by(0.6, { position: new Vec3(120, 0, 0) }, { easing: 'sineInOut' })
            .by(1.2, { position: new Vec3(-240, 0, 0) }, { easing: 'sineInOut' })
            .by(0.6, { position: new Vec3(120, 0, 0) }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();
    }

    private onFirstTouch(event: EventTouch) {
        if (!this._isTutorialActive) return;
        this._isTutorialActive = false;

        input.off(Input.EventType.TOUCH_START, this.onFirstTouch, this);
        eventBus.emit('GAME_START');

        const uiOpacity = this.getComponent(UIOpacity);
        if (uiOpacity) {
            tween(uiOpacity)
                .to(0.3, { opacity: 0 })
                .call(() => {
                    this.node.active = false;
                })
                .start();
        } else {
            this.node.active = false;
        }
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }
}
