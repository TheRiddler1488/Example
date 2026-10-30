import { _decorator, Component, Label, Prefab, instantiate, Vec3, BoxCollider } from 'cc';
import { CombatHandler } from './CombatHandler';
const { ccclass, property } = _decorator;

@ccclass('EnemyGroup')
export class EnemyGroup extends Component {
    @property({ tooltip: 'Начальное количество врагов' })
    public enemyCount: number = 5;

    @property({ type: Label, tooltip: 'Ссылка на 3D-текст с цифрой' })
    public textLabel: Label | null = null;

    @property({ type: Prefab, tooltip: 'Префаб вражеского кубика/скелета' })
    public enemyPrefab: Prefab | null = null;

    @property({ tooltip: 'Это последняя толпа (финиш)?' })
    public isFinalEnemy: boolean = false;

    start() {
        this.spawnInitialClones();
        this.updateText();
    }

    public updateText() {
        if (this.textLabel) {
            this.textLabel.string = this.enemyCount.toString();
        }
    }

    private spawnInitialClones() {
        if (!this.enemyPrefab) return;

        let columns = 5;
        let spacing = 1.2;

        for (let i = 0; i < this.enemyCount; i++) {
            let clone = instantiate(this.enemyPrefab);
            this.node.addChild(clone);

            let row = Math.floor(i / columns);
            let col = i % columns;

            let step = Math.ceil(col / 2);
            let sign = col % 2 !== 0 ? -1 : 1;

            let offsetX = step * sign * spacing;

            let offsetZ = row * spacing;

            clone.setPosition(new Vec3(offsetX, 0, offsetZ));
        }

        this.updateColliderBounds();
    }

    public removeOneVisualClone() {
        let children = this.node.children;
        for (let i = children.length - 1; i >= 0; i--) {
            let child = children[i];

            if (child.name !== 'CountText' && child.isValid && !(child as any).isDying) {
                (child as any).isDying = true;

                if (CombatHandler.instance) {
                    CombatHandler.instance.processHit(child, false);
                } else {
                    child.destroy();
                }
                break;
            }
        }
        this.updateColliderBounds();
    }

    private updateColliderBounds() {
        let collider = this.getComponent(BoxCollider);
        if (!collider) return;

        let minX = 0,
            maxX = 0;
        let minZ = 0,
            maxZ = 0;
        let hasClones = false;

        for (let i = 0; i < this.node.children.length; i++) {
            let child = this.node.children[i];

            if (child.name !== 'CountText' && child.isValid) {
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

            collider.size = new Vec3(width, 1, depth);
            collider.center = new Vec3(centerX, 0, centerZ);
        } else {
            collider.size = new Vec3(1, 1, 1);
            collider.center = new Vec3(0, 0, 0);
        }
    }
}
