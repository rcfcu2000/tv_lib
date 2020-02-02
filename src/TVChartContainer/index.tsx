import * as React from 'react';
import './index.css';
import {
	widget,
	ChartingLibraryWidgetOptions,
	LanguageCode,
	IChartingLibraryWidget,
} from '../charting_library/charting_library.min';

import icon_infomation from '../images/icon_infomation.svg'

import socket from '../datafeeds/socket';
import datafeeds from '../datafeeds/datafeeds';

export interface ChartContainerProps {
	symbol: ChartingLibraryWidgetOptions['symbol'];
	precision: number;
	interval: ChartingLibraryWidgetOptions['interval'];

	// BEWARE: no trailing slash is expected in feed URL
	datafeedUrl: string;
	libraryPath: ChartingLibraryWidgetOptions['library_path'];
	chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
	chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
	clientId: ChartingLibraryWidgetOptions['client_id'];
	userId: ChartingLibraryWidgetOptions['user_id'];
	fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
	autosize: ChartingLibraryWidgetOptions['autosize'];
	studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
	containerId: ChartingLibraryWidgetOptions['container_id'];
}

export interface ChartContainerState {
	loaded: boolean,
	time: string,
	[key: string]: any,
}

const intervalMap = {
	'1': '1min',
	'5': '5min',
	'15': '15min',
	'30': '30min',
	'60': '60min',
	'1D': '1day',
	'1W': '1W',
	'1M': '1M'
};

// second
const intervalTimeMap = {
	'1': 1 * 60,
	'5': 5 * 60,
	'15': 5 * 60,
	'30': 30 * 60,
	'60': 60 * 60,
	'1D': 24 * 60 * 60,
	'1W': 7 * 24 * 60 * 60,
	'1M': 30 * 24 * 60 * 60,
}

export class TVChartContainer extends React.PureComponent<Partial<ChartContainerProps>, ChartContainerState> {
	// cons
	amountd: boolean;
	constructor (props) {
		super(props);
		this.state = {
			loaded: false,
			time: '1D',
		}
	}
	public static defaultProps: ChartContainerProps = {
		symbol: 'AAPL',
		precision: 4,
		interval: 'D',
		containerId: 'tv_chart_container',
		datafeedUrl: 'https://demo_feed.tradingview.com',
		libraryPath: '/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	private tvWidget: IChartingLibraryWidget | null = null;
	private symbol: string;
	private interval: number | any;
	private socket: any;
	private cacheData: any = {};
	// private loaded = 
	[key: string]: any;


	public componentDidMount(): void {

		this.symbol = this.getSymbolName().toLocaleUpperCase();
		this.interval = '1D';
		// this.socket = new socket({});
		this.socket = new socket({});
		this.datafeeds = new datafeeds(this);

		// this.socket.doOpen();
		this.socket.onMessage('open', this.getKlineData);
		this.socket.onMessage('message', this.onMessage);

		const height = document.documentElement.clientHeight - 30;
		const width = document.documentElement.clientWidth;

		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: this.props.symbol,
			interval: this.interval,
			height,
			width,
			// fullscreen: true,
			// preset: "mobile",
			container_id: this.props.containerId as ChartingLibraryWidgetOptions['container_id'],
			datafeed: this.datafeeds,
			library_path: this.props.libraryPath as string,
			timezone: 'Asia/Shanghai',
			locale: 'zh',
			debug: false,
			custom_css_url: '/coinxp.css',
			// favorites: {
			// 	intervals: ['1', '5', '15', '30', '60', '1D', '2D', '3D', '1W', '1M'],
			// 	chartTypes: ["Area", "Candles"]
			// },
			overrides: {
				"paneProperties.background": "#1b1e37",
				// 网格
				"paneProperties.vertGridProperties.color": "transparent",
				"paneProperties.horzGridProperties.color": "transparent",
				"symbolWatermarkProperties.transparency": 90,
				"scalesProperties.textColor": "#AAA",
				'scalesProperties.fontSize': 13,
				'paneProperties.legendProperties.showLegend': false,
				"symbolWatermarkProperties.color": "rgba(0, 0, 0, 0.00)",
				"volumePaneSize": "medium",
				"paneProperties.topMargin": "15", // 防止被遮住
				// "paneProperties.bottomMargin": "5",
				// "scalesProperties.showRightScale": false,
				// K线图样式
				"mainSeriesProperties.candleStyle.upColor": "#33A798",
				"mainSeriesProperties.candleStyle.downColor": "#EE5451",
				// 
				// "mainSeriesProperties.hollowCandleStyle.wickUpColor": "rgba(51, 167, 152, 0.5)",
				// "mainSeriesProperties.hollowCandleStyle.wickDownColor": "rgba(238, 84, 81, 0.5)",
			},
			loading_screen: { backgroundColor: "#1b1e37" },
			fullscreen: false,
			autosize: true,
			disabled_features: [
				'countdown',
				'timezone_menu',
				'header_symbol_search',
				'symbol_search_hot_key',
				'header_resolutions',
				'header_settings',
				'header_fullscreen_button',
				'header_chart_type',
				'header_indicators',
				'header_undo_redo',
				'header_compare',
				'header_screenshot',
				'control_bar',
				'header_saveload',
				"volume_force_overlay",
				"left_toolbar",
				'use_localstorage_for_settings',
				'go_to_date',
				'timeframes_toolbar',
				'symbol_info',
				'show_chart_property_page'
			],
			enabled_features: [
				'header_widget',
				'adaptive_logo',
			]
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;

		tvWidget.onChartReady( () => {
			this.amountd = true;
			this.setState({loaded: true});
		// 	tvWidget.chart().createStudy('Moving Average', true, false, [5, "close", 0], null, {
		// 		"Plot.color": "#684A95",
		// 	});
		// 	tvWidget.chart().createStudy('Moving Average', true, false, [10, "close", 0], null, {
		// 		"Plot.color": "#5677A4",
		// 	});
		// 	tvWidget.chart().createStudy('Moving Average', true, false, [30, "close", 0], null, {
		// 		"Plot.color": "#417D57",
		// 	});
		// 	tvWidget.chart().createStudy('Moving Average', true, false, [60, "close", 0], null, {
		// 		"Plot.color": "#782C6C",
		// 	});
		})
	}

	public componentWillUnmount(): void {
		this.setState = (state) => {
			return;
		}
		if (this.tvWidget !== null) {
			if (this.amountd) {
				this.tvWidget.remove();
				this.tvWidget = null;
			}
		}
		this.amountd = false;
		// if (this.socket.socket) {
		try {
			if (this.socket.isConnected()) {
				this.socket.socket.close();
			}
		} catch (e) {
			console.warn('close....tv ws error ', e);
		}
		// }
	}

	// public componentWillReceiveProps(nextProps) :void {
	// 	console.log('nextProps...', nextProps.symbol, this.symbol);
	// 	const nextSymbol = nextProps.symbol;
	// 	if (nextSymbol && nextSymbol.toLocaleUpperCase() != this.symbol) {
	// 		this.symbol = nextSymbol.toLocaleUpperCase();
	// 		if (this.tvWidget) {
	// 			this.tvWidget.onChartReady(() => {
	// 				this.tvWidget.setSymbol(nextSymbol.toLocaleUpperCase(), this.interval, () =>{
						
	// 				});
	// 				setTimeout(() => {
	// 					console.log('change....???');
	// 					this.getKlineData();
	// 					this.subscribe();
	// 				}, 0)
	// 			})
	// 		}
	// 	}
	// }

	public render(): JSX.Element {
		const {loaded, time} = this.state;
		const styles = {
			interval: 'test',
		}
		const intervals = [
			{ name: '1min', value: '1' },
			{ name: '5min', value: '5' },
			// { name: '15min', value: '15' },
			// { name: '30min', value: '30' },
			{ name: '1H', value: '60' },
			{ name: '1D', value: '1D' },
			// { name: '1W', value: '1W' },
			// { name: '1M', value: '1M' },
		]
		return (
			<div style={{
				overflow: 'hidden',
				width: '100%',
				height: '100%',
			}}>
				<div className='utilsbuttons'>
				{
					loaded ? (
						<>
                        <ul className={'interval'} >
                          <li
                            key={'intervals-0'}
                            onClick={() => {
                              this.setState({
                                time: 'realtime'
                              })
                              this.tvWidget.chart().setChartType(3);
                            }}
                            className={time === 'realtime' ? 'active' : null }
                          >
                            Time
                          </li >
                          {
                            intervals.map((item, index) => {
                              return (<li
                                key={`intervals-${index + 1}`}
                                onClick={() => {
                                  this.setState({
                                    time: item.name
                                  })
                                  this.tvWidget.chart().setChartType(1);
                                  this.tvWidget.chart().setResolution(item.value, () => {
                                  })
                                }}
                                className={time === item.name ? 'active': null}
                              >
                                {item.name}
                              </li >
							  )
							})
                          }
                        </ul >
                        <ul className={''} >
                          {/* <li className={''} onClick={() => {
                            this.tvWidget.chart().executeActionById('chartProperties')
                          }} >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2.4 120.9 600 600" width="17"
                                 height="17" >
                              <path
                                d="M594 473.5V368.8h-76c-5.7-23.8-15.2-46.4-27.5-66.4l53.8-53.8-73.9-73.9-53.8 53.4c-20.6-12.8-42.7-21.8-66.4-27.5v-75.9H245.5v75.9c-23.8 5.7-46.4 15.2-66.4 27.5l-53.8-53.8-73.9 73.9 53.4 53.8C92 322.6 83 344.7 77.3 368.4h-76V473h75.9c5.7 23.8 15.2 46.4 27.5 66.4L51 593.3l73.9 73.9 53.8-53.4c20.6 12.8 42.7 21.8 66.4 27.5v75.9h104.6v-75.9c23.8-5.7 46.4-15.2 66.4-27.5l53.8 53.8 73.9-73.9-53.4-53.8c12.8-20.6 21.8-42.7 27.5-66.4H594zm-296.4 69.7c-67.3 0-122.3-54.6-122.3-122.3 0-67.3 54.6-122.3 122.3-122.3 67.3 0 122.3 54.6 122.3 122.3-.4 67.4-54.9 122.3-122.3 122.3z"
                                fill='#6A7286' />
                            </svg >
                          </li > */}
                          <li className={''} onClick={() => {
                            this.tvWidget && this.tvWidget.chart().executeActionById('insertIndicator')
                          }} >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" width="17" height="17" >
                              <path
                                d="M16 0a1 1 0 0 0-1 1 1 1 0 0 0 .127.484L13.017 5A1 1 0 0 0 13 5a1 1 0 0 0-.258.035L10.965 3.26A1 1 0 0 0 11 3a1 1 0 0 0-1-1 1 1 0 0 0-1 1 1 1 0 0 0 .082.393L7.12 6.008a1 1 0 0 0-.12-.01 1 1 0 0 0-.44.104l-1.564-1.04A1 1 0 0 0 5 4.998a1 1 0 0 0-1-1 1 1 0 0 0-1 1 1 1 0 0 0 .002.066l-1.56 1.04A1 1 0 0 0 1 5.998a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-.002-.064l1.56-1.04A1 1 0 0 0 4 6a1 1 0 0 0 .44-.103l1.564 1.04A1 1 0 0 0 6 7a1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-.082-.39l1.965-2.62A1 1 0 0 0 10 4a1 1 0 0 0 .258-.035l1.777 1.777A1 1 0 0 0 12 6a1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-.127-.482L15.983 2A1 1 0 0 0 16 2a1 1 0 0 0 1-1 1 1 0 0 0-1-1zm-1 5v10h2V5h-2zM9 7v8h2V7H9zM3 9v6h2V9H3zm9 1v5h2v-5h-2zM0 11v4h2v-4H0zm6 0v4h2v-4H6z"
                                fill='#6A7286' />
                            </svg >
                          </li >
						  <li onClick={() => {
                            showCoinDetail()
                          }} >
						   <img src={icon_infomation} />
						   </li >
						  <li onClick={() => {
                            const tradingview = document.getElementsByTagName('iframe')[0]
                            tradingview && SetFullScreen(tradingview)
                          }} >
						   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 586.09999 586.09996" width="17" height="17">
							<path 
							fill='#6A7286'
							d="M172.6 367.9l-97.7 97.7L0 390.7v195.4h195.4l-74.9-74.9 97.7-97.7-45.6-45.6zM195.4 0H0v195.4l74.9-74.9 97.7 97.7 45.6-45.6-97.7-97.7L195.4 0zm195.3 0l74.9 74.9-97.7 97.7 45.6 45.6 97.7-97.7 74.9 74.9V0H390.7zm22.8 367.9l-45.6 45.6 97.7 97.7-74.9 74.9h195.4V390.7l-74.9 74.9-97.7-97.7z">
							</path>
						   </svg>
						   </li >
                        </ul >
                      </>
					) : null
				}
				</div>

				<div
					id={this.props.containerId}
					className={'TVChartContainer'}
				/>
			</div>
			
		);
	}

	/**
	 * 从 props 拿到 symbol
	 */
	getSymbolName () {
		let symbol = this.props.symbol || 'btcusdt';
		return symbol;
	}

	getKlineData = () => {
		let symbol = this.getSymbolName();
		let interval = this.interval;
		let to = Math.floor(Date.now() / 1000);
		this.sendMessage({
			"req": `market.${symbol}.kline.${intervalMap[interval]}`,
			id: Math.floor(Math.random() * 1000),
			to,
		})
	}

	initSymbol() {
		let symbolName = this.getSymbolName().toLocaleUpperCase();
		return {
			'name': symbolName,
			'timezone': 'Asia/Shanghai',
			'minmov': 1,
			'minmov2': 0,
			'pointvalue': 1,
			'fractional': false,
			'session': '24x7',
			'has_intraday': true,
			'has_no_volume': false,
			'description': symbolName,
			// 'pricescale': [1, 1, 0.0001],
			'pricescale': Math.pow(10, this.props.precision),
			'ticker': symbolName,
			'supported_resolutions': ['1', '5', '15', '30', '60', '1D', '1W', '1M']
		}
	}

	sendMessage(data: any) {
		if (this.socket.isConnected()) {
			this.socket.send(data)
		}
	}

	unSubscribe(interval: string) {
		let symbolName = this.getSymbolName();
		if (!intervalMap[interval]) {
			return;
		}
		this.sendMessage({
			id: Math.floor(Math.random() * 100000),
			unsub: `market.${symbolName}.kline.${intervalMap[interval]}`
		})
	}

	subscribe() {
		let symbolName = this.getSymbolName();
		let interval = this.interval;
		if (!intervalMap[interval]) {
			console.error('not in map..', interval);
			return;
		}
		let symbol = `market.${symbolName}.kline.${intervalMap[interval]}`;
		this.sendMessage({
			id: Math.floor(Math.random() * 100000),
			sub: symbol
		})
	}

	onMessage = (data: any) => {
		if (data.ping) {
			this.sendMessage({
				pong: data.ping
			})
		}
		// 首次请求拿到的数据
		if (data.rep) {
			const list: any = []
			const klineKey = `${this.symbol}-${this.interval}`
			data.data.forEach((element: any) => {
				list.push({
					time: element.id * 1000,
					open: formatPrice(element.open, this.props.precision),
					high: formatPrice(element.high, this.props.precision),
					low: formatPrice(element.low, this.props.precision),
					close: formatPrice(element.close, this.props.precision),
					volume: formatPrice(element.vol, this.props.precision),
				});
			});
			this.cacheData[klineKey] = list;
			this.lastTime = list[list.length - 1].time;
			this.subscribe();
		}
		// 订阅后，每条数据的推送
		if (data.tick) {
			// console.log('onMessage tick..', data.tick);
			let tick = data.tick;
			let symbol = data.ch.split('.')[1];
			let thisSymbol = this.transferCoinType(this.symbol);
			// console.log('symbol....', symbol, thisSymbol);
			if (thisSymbol !== symbol) {
				return;
			}
			this.datafeeds.updateData();
			let timeInterval = this.getTimeInterval();
			const klineKey = `${this.symbol}-${this.interval}`
			const barsData = {
				time: Math.floor(data.ts / timeInterval) * timeInterval * 1000,
				open: formatPrice(tick.open, this.props.precision),
				high: formatPrice(tick.high, this.props.precision),
				low: formatPrice(tick.low, this.props.precision),
				close: formatPrice(tick.close, this.props.precision),
				volume: formatPrice(tick.vol, this.props.precision)
			}
			if (barsData.time >= this.lastTime && this.cacheData[klineKey] && this.cacheData[klineKey].length) {
				this.cacheData[klineKey][this.cacheData[klineKey].length - 1] = barsData;
				// this.lastTime = barsData.time;
			}
		}
	}

	//onHistoryCallback仅一次调用，接收所有的请求历史
	getBars(symbolInfo: any, resolution: any, from: any, to: any, onHistoryCallback: any) {
		// console.log('getBars....', resolution, 'this.interval:  ', this.interval);
		if (this.interval != resolution) {
			// console.warn('change interval/....', this.interval, resolution);
			this.unSubscribe(this.interval);
			this.interval = resolution;
			// this.subscribe();
			this.getKlineData();
		}
		const klineKey = `${this.symbol}-${this.interval}`;

		if (this.cacheData && this.cacheData[klineKey] && this.cacheData[klineKey].length) {
			this.isLoading = false
			const newBars: any = []
			let length = this.cacheData[klineKey].length;
			this.cacheData[klineKey].forEach((item: any, index: number) => {
				if (item.time >= from * 1000 && item.time <= to * 1000) {
					newBars.push(item)
				}
			});
			if (newBars.length) {
				try {
					onHistoryCallback(newBars, {noData: true});
				} catch (e) {
					console.error("tvc error", new Error(e));
				}
			} else {
          onHistoryCallback(this.cacheData[klineKey], {noData: false});			
			}
		} else {
			const self = this
			this.getBarTimer = setTimeout(function () {
				try {
					self.getBars(symbolInfo, resolution, from, to, onHistoryCallback)
				} catch (e) {
					console.error("tvc error", new Error(e));
				}
			}, 500)
		}
	}

	getTimeInterval(): number{
		// this.symbol;
		let time = intervalTimeMap[this.interval];
		// console.log('getTimeInterval...', this.interval, time);
		if (time) {
			return time;
		}
		return 5 * 60;
	}

	/**
	 * ETH/BTC -> ethbtc
	 * @param symbol 
	 */
	transferCoinType(symbol: string): string {
		try {
			let res = symbol.split('/').join('').toLocaleLowerCase();
			return res;
		} catch (e) {
			return '';
		}
	}

}

const formatPrice = (price, precision) => {

	// const r = Number(price).toFixed(precision);
	// console.log('formatPrice', r, price);

	return Number(price);
}


const SetFullScreen = (docElm) => {

	// 发送 全屏指令
	window.postMessage(JSON.stringify({action: 'fullscreen_change', value: true, symbol: this.symbol}), '*');

	// if (document.documentElement.requestFullscreen) {
	// 	docElm.requestFullscreen()
	// }  else if (document.documentElement.webkitRequestFullscreen) {
	// 	docElm.webkitRequestFullscreen()
	// } else if (document.documentElement.mozRequestFullScreen) {
	// 	docElm.mozRequestFullScreen();
	// }
}

const showCoinDetail = () =>{
	// 发送 显示币种详情指令
	window.postMessage(JSON.stringify({action: 'show_coin_detail', value: true, symbol: this.symbol}), '*');

}
  