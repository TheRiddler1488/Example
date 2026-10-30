import { _decorator, Component, Prefab, Node, instantiate, NodePool } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PoolManager')
export class PoolManager extends Component {
    private static _instance: PoolManager | null = null;
    public static get instance() {
        return this._instance;
    }

    @property({ type: Prefab, tooltip: 'Префаб нашего кубика/клона' })
    public clonePrefab: Prefab | null = null;

    @property({ tooltip: 'Сколько клонов создать при старте игры' })
    public initialPoolSize: number = 100;

    private _clonePool: NodePool = new NodePool();

    onLoad() {
        if (!PoolManager._instance) {
            PoolManager._instance = this;
            this.initPool();
        } else {
            this.node.destroy();
        }
    }

    private initPool() {
        if (!this.clonePrefab) return;

        for (let i = 0; i < this.initialPoolSize; i++) {
            let clone = instantiate(this.clonePrefab);
            this._clonePool.put(clone);
        }
    }

    public getClone(): Node {
        if (this._clonePool.size() > 0) {
            return this._clonePool.get()!;
        }

        return instantiate(this.clonePrefab!);
    }

    public returnClone(clone: Node) {
        (clone as any).isDying = false;

        clone.setScale(1, 1, 1);
        let collider = clone.getComponent('cc.Collider') as any;
        if (collider) collider.enabled = true;

        this._clonePool.put(clone);
    }
}
