import { _decorator, Component, Node, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { eventBus } from '../Managers/EventBus';
const { ccclass, property } = _decorator;

const TARGET_SCALE = new Vec3(1, 1, 1);
const ZERO_SCALE = new Vec3(0, 0, 0);

@ccclass('UIManager')
export class UIManager extends Component {
    @property({ type: Node, tooltip: 'Нода с черным фоном для затемнения' })
    public darkBg: Node | null = null;

    @property({ type: Node, tooltip: 'Узел затемненного экрана (фон)' })
    public endScreen: Node | null = null;

    @property({
        type: Sprite,
        tooltip: 'Нода Спрайта, где будет показываться результат'
    })
    public resultImage: Sprite | null = null;

    @property({ type: SpriteFrame, tooltip: 'Картинка ПОБЕДЫ' })
    public winSprite: SpriteFrame | null = null;

    @property({ type: SpriteFrame, tooltip: 'Картинка ПОРАЖЕНИЯ' })
    public loseSprite: SpriteFrame | null = null;

    @property({ type: Node, tooltip: 'Кнопка рестарта или перехода в стор' })
    public actionButton: Node | null = null;

    start() {
        if (this.endScreen) {
            this.endScreen.active = false;
        }
        eventBus.on('GAME_END', this.showEndScreen, this);
    }

    onDestroy() {
        eventBus.off('GAME_END', this.showEndScreen, this);
    }

    public showEndScreen(isWin: boolean) {
        if (!this.endScreen || !this.resultImage) return;

        this.resultImage.spriteFrame = isWin ? this.winSprite : this.loseSprite;
        this.resultImage.node.setScale(ZERO_SCALE);

        if (this.actionButton) {
            this.actionButton.setScale(ZERO_SCALE);
        }

        this.endScreen.active = true;

        if (this.darkBg) {
            let uiOpacity = this.darkBg.getComponent(UIOpacity);
            if (!uiOpacity) {
                uiOpacity = this.darkBg.addComponent(UIOpacity);
            }
            uiOpacity.opacity = 0;

            tween(uiOpacity).to(0.3, { opacity: 200 }).start();
        }

        tween(this.resultImage.node).delay(0.2).to(0.4, { scale: TARGET_SCALE }, { easing: 'backOut' }).start();

        if (this.actionButton) {
            let btnNode = this.actionButton;
            tween(btnNode)
                .delay(0.4)
                .to(0.3, { scale: TARGET_SCALE }, { easing: 'bounceOut' })
                .call(() => {
                    tween(btnNode)
                        .to(0.7, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'sineInOut' })
                        .to(0.7, { scale: TARGET_SCALE }, { easing: 'sineInOut' })
                        .union()
                        .repeatForever()
                        .start();
                })
                .start();
        }
    }
}
