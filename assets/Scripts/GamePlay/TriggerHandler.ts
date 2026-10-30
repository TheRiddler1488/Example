import { _decorator, Component, BoxCollider, Collider, ITriggerEvent, Label, Vec3 } from 'cc';
import { MathGate } from './MathGate';
import { eventBus } from '../Managers/EventBus';
import { RunnerMovement } from './RunnerMovement';
import { EnemyGroup } from './EnemyGroup';
import { PoolManager } from '../Managers/PoolManager';
import { CombatHandler } from './CombatHandler';
import { AudioManager } from '../Audio/AudioManager';

const { ccclass, property } = _decorator;

@ccclass('TriggerHandler')
export class TriggerHandler extends Component {
    @property({ type: Label, tooltip: 'Ссылка на дочерний текст игрока' })
    public countLabel: Label | null = null;

    private _canHitGate: boolean = true;
    private _currentCount: number = 1;

    private _tempSize: Vec3 = new Vec3();
    private _tempCenter: Vec3 = new Vec3();

    start() {
        let collider = this.getComponent(Collider);
        if (collider) collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.updatePlayerText();
    }

    private updatePlayerText() {
        if (this.countLabel) {
            this.countLabel.string = this._currentCount.toString();
        }
    }

    onTriggerEnter(event: ITriggerEvent) {
        let hitNode = event.otherCollider.node;

        let gateData = hitNode.getComponent(MathGate);
        if (gateData) {
            AudioManager.instance.playGateSound();
            if (!this._canHitGate) return;

            this._canHitGate = false;
            this.scheduleOnce(() => {
                this._canHitGate = true;
            }, 1.5);

            this.processGate(gateData);
            hitNode.destroy();
            return;
        }

        let enemyData = hitNode.getComponent(EnemyGroup);
        if (enemyData) this.startBattle(enemyData);
    }

    private processGate(gate: MathGate) {
        let newCount = gate.calculateNewCount(this._currentCount);
        let difference = newCount - this._currentCount;

        if (difference > 0) {
            this.spawnClones(difference);
        } else if (difference < 0) {
            this.removeClones(Math.abs(difference), false);
        }

        this._currentCount = newCount;
        this.updatePlayerText();

        if (this._currentCount <= 0) {
            this.handleGameOver(false);
        }
    }

    private spawnClones(amount: number) {
        let columns = 5;
        let spacing = 1.2;

        for (let i = 0; i < amount; i++) {
            let clone = PoolManager.instance.getClone();
            this.node.addChild(clone);

            let index = this._currentCount + i;
            let row = Math.floor(index / columns);
            let col = index % columns;

            let step = Math.ceil(col / 2);
            let sign = col % 2 !== 0 ? -1 : 1;

            let offsetX = step * sign * spacing;
            let offsetZ = row * spacing;

            clone.setPosition(offsetX, 0, offsetZ);
        }

        this._currentCount += amount;
        this.updateColliderBounds();
    }

    private removeClones(amount: number, isCombatHit: boolean) {
        let children = this.node.children;
        let removedCount = 0;

        for (let i = children.length - 1; i >= 0; i--) {
            let child = children[i];

            if (child.name !== 'CountText' && child.isValid && !(child as any).isDying) {
                (child as any).isDying = true;

                if (isCombatHit && CombatHandler.instance) {
                    CombatHandler.instance.processHit(child);
                } else {
                    PoolManager.instance.returnClone(child);
                }

                removedCount++;
                if (removedCount >= amount) break;
            }
        }
        this.updateColliderBounds();
    }

    private startBattle(enemy: EnemyGroup) {
        let movement = this.getComponent(RunnerMovement) || this.node.parent?.getComponent(RunnerMovement);
        if (movement) movement.isBattling = true;

        this.schedule(() => {
            if (this._currentCount > 0 && enemy.enemyCount > 0) {
                this._currentCount--;
                enemy.enemyCount--;
                this.updatePlayerText();
                enemy.updateText();

                this.removeClones(1, true);
                enemy.removeOneVisualClone();
            } else {
                this.unscheduleAllCallbacks();

                if (this._currentCount > 0) {
                    let wasFinal = enemy.isFinalEnemy;
                    enemy.node.destroy();

                    if (wasFinal) {
                        this.handleGameOver(true);
                    } else {
                        if (movement) movement.isBattling = false;
                    }
                } else {
                    this.handleGameOver(false);
                }
            }
        }, 0.1);
    }

    private updateColliderBounds() {
        let collider = this.getComponent(BoxCollider);
        if (!collider) return;

        let minX = 0,
            maxX = 0,
            minZ = 0,
            maxZ = 0;
        let hasClones = false;

        for (let i = 0; i < this.node.children.length; i++) {
            let child = this.node.children[i];

            if (child.name !== 'CountText' && child.isValid && !(child as any).isDying) {
                let pos = child.position;
                if (pos.x < minX) minX = pos.x;
                if (pos.x > maxX) maxX = pos.x;
                if (pos.z < minZ) minZ = pos.z;
                if (pos.z > maxZ) maxZ = pos.z;

                hasClones = true;
            }
        }

        if (hasClones) {
            let width = Math.abs(maxX - minX) + 1;
            let depth = Math.abs(maxZ - minZ) + 1;
            let centerX = (minX + maxX) / 2;
            let centerZ = (minZ + maxZ) / 2;

            this._tempSize.set(width, 1, depth);
            this._tempCenter.set(centerX, 0, centerZ);

            collider.size = this._tempSize;
            collider.center = this._tempCenter;
        } else {
            this._tempSize.set(1, 1, 1);
            this._tempCenter.set(0, 0, 0);
            collider.size = this._tempSize;
            collider.center = this._tempCenter;
        }
    }

    private handleGameOver(isWin: boolean) {
        let movement = this.getComponent(RunnerMovement) || this.node.parent?.getComponent(RunnerMovement);
        if (movement) {
            movement.isBattling = true;
            movement.enabled = false;
        }

        if (!isWin) {
            this.node.active = false;
            AudioManager.instance.playLoseSound();
        } else {
            AudioManager.instance.playWinSound();
        }

        eventBus.emit('GAME_END', isWin);
    }
}
