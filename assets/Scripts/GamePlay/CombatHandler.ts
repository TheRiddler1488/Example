import { _decorator, Component, Node, tween, Collider, Vec3 } from 'cc';
import { PoolManager } from '../Managers/PoolManager';
import { AudioManager } from '../Audio/AudioManager';

const { ccclass } = _decorator;

const ZERO_SCALE = new Vec3(0, 0, 0);

@ccclass('CombatHandler')
export class CombatHandler extends Component {
    private static _instance: CombatHandler | null = null;
    public static get instance() {
        return this._instance;
    }

    onLoad() {
        if (!CombatHandler._instance) {
            CombatHandler._instance = this;
        } else {
            this.node.destroy();
        }
    }

    public processHit(targetNode: Node, isPlayerClone: boolean = true) {
        const collider = targetNode.getComponent(Collider);
        if (collider) collider.enabled = false;

        if (AudioManager.instance) {
            AudioManager.instance.playPopSound();
        }

        tween(targetNode)
            .to(0.08, { scale: ZERO_SCALE }, { easing: 'backIn' })
            .call(() => {
                if (isPlayerClone && PoolManager.instance) {
                    PoolManager.instance.returnClone(targetNode);
                } else {
                    targetNode.destroy();
                }
            })
            .start();
    }
}
