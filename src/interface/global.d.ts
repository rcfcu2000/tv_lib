// declare global {
    interface Window {
        TradingView: any
    }
// }

interface document {
    Element: {
        mozRequestFullScreen: any
    },
    documentElement: any,
}

interface Element{

    mozRequestFullScreen(): void;
    webkitRequestFullscreen(): void;
    // documentElement: {
    //     mozRequestFullScreen: any
    // },
}
