import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {
    @property({
        type: Node,
        tooltip: 'Объект игрока, за которым нужно следить'
    })
    public target: Node | null = null;

    @property({
        tooltip: 'Смещение камеры: X (вправо/влево), Y (высота), Z (отдаление назад)'
    })
    public offset: Vec3 = new Vec3(0, 5, 7);

    private _targetPos: Vec3 = new Vec3();
    private _cameraPos: Vec3 = new Vec3();

    lateUpdate(deltaTime: number) {
        if (!this.target) return;

        this.target.getPosition(this._targetPos);
        this.node.getPosition(this._cameraPos);

        this._cameraPos.z = this._targetPos.z + this.offset.z;
        this._cameraPos.y = this._targetPos.y + this.offset.y;

        this.node.setPosition(this._cameraPos);
    }
}
