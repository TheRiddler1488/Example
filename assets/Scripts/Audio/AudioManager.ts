import { _decorator, Component, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager | null = null;
    public static get instance() {
        return this._instance;
    }

    @property(AudioSource)
    bgmSource: AudioSource = null;

    @property(AudioSource)
    sfxSource: AudioSource = null;

    @property(AudioClip)
    bgmMusic: AudioClip = null;

    @property(AudioClip)
    gateClip: AudioClip = null;

    @property(AudioClip)
    popClip: AudioClip = null;

    @property(AudioClip)
    winClip: AudioClip = null;

    @property(AudioClip)
    loseClip: AudioClip = null;

    onLoad() {
        if (!AudioManager._instance) {
            AudioManager._instance = this;
        } else {
            this.node.destroy();
        }
    }

    public playBGM() {
        if (this.bgmSource.clip === this.bgmMusic && this.bgmSource.playing) return;
        this.bgmSource.clip = this.bgmMusic;

        this.bgmSource.loop = true;
        this.bgmSource.volume = 0.3;

        this.bgmSource.play();
    }

    public stopBGM() {
        this.bgmSource.stop();
    }

    private playSFX(clip: AudioClip, volume: number = 1.0) {
        if (clip) this.sfxSource.playOneShot(clip, volume);
    }

    public playGateSound() {
        this.playSFX(this.gateClip);
    }

    public playPopSound() {
        this.playSFX(this.popClip, 0.8);
    }

    public playWinSound() {
        this.stopBGM();
        this.playSFX(this.winClip);
    }

    public playLoseSound() {
        this.stopBGM();
        this.playSFX(this.loseClip);
    }
}
