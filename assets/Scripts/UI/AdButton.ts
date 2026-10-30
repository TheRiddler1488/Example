import { _decorator, Component, sys } from 'cc';
const { ccclass } = _decorator;

if (typeof window !== 'undefined') {
    (window as any).advChannels = '{{__adv_channels_adapter__}}';
}

@ccclass('AdButton')
export class AdButton extends Component {
    public onDownloadClick() {
        let channel = 'Unknown';
        if (typeof window !== 'undefined') {
            channel = (window as any).advChannels;
        }

        console.log(`Попытка перехода в стор. Текущий канал: ${channel}`);

        if (typeof window === 'undefined') return;

        if (typeof window['ExitApi'] !== 'undefined' && typeof window['ExitApi'].exit === 'function') {
            window['ExitApi'].exit();
            return;
        }

        if (typeof window['mraid'] !== 'undefined') {
            if (typeof window['mraid'].open === 'function') {
                window['mraid'].open('https://play.google.com/store/apps/details?id=your.game.package');
                return;
            }
        }

        if (typeof window['install'] === 'function') {
            window['install']();
            return;
        }
        if (typeof window['openStore'] === 'function') {
            window['openStore']();
            return;
        }

        if (typeof window['ExitApi'] !== 'undefined' && typeof window['ExitApi'].exit === 'function') {
            window['ExitApi'].exit();
            return;
        }

        if (typeof window['clickTag'] !== 'undefined') {
            window.open(window['clickTag'], '_blank');
            return;
        }

        sys.openURL('https://play.google.com/store/games');
    }
}
