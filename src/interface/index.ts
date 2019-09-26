export type ICoinTypes = 'ETH' | 'BTC' | 'CXP' | 'EOS';

export interface CoinInfo {
    address: string,
    amount: string
}

export interface INavigation {
    navigate: (router: string, params?: Object) => void,
    back: Function,
    getParam: (param: string, defaultValue: any) => any
}

export interface IEntrustItem {
    no: number,
    noFilled: number,
    price: number,
    state: number,
    dt: string,
    name: string,
    type: 'buy' | 'sell',
    amount: number | string,
    coinType: string,
    [key: string]: any,
}

export interface ISupplyInfo{
    supply_rate: number,
    total_supply: number;
    current_supply: number;
}

export interface IReward {
    user: string,
    amount: string;
}

export interface IFullSupplyInfo{
    current_supply: number,
    hub_rewards_pool: string,
    issued_supply: number,
    supply_index: number,
    supply_rate: number,
    total_burned: number,
    total_rewarded: string,
    total_supply: string,
}

export interface IBalanceRecord{
    [key: string]: number,
}

export interface IUserRecord{
    [key: string]: string,
}

// redux state
export interface IReduxUserInfo {
    readonly name: string,
    readonly sessionid: string,
    readonly userNameChain: string,
}

/**
 * sample:
 * {
 *     ETH: 1,
 *     BTC: 999,
 * }
 */
export interface IReduxBalanceInfo {
    [key: string]: number,
}

/**
 * 显示的行情数据
 */
export interface IReduxMarketItem {
    type: string,
    extent: string,
    value: number,
    lastPrice?: number,
    amount?: number,
}

export interface IReduxMarketInfo {
    market: Array<IReduxMarketItem>,
    amountToCNY: number,
}

export interface ISymbolList{
    symbol: string,
    symbolName: string,
    pricePrecision: number,
    amountPrecision: number,
    totalPrecision: number,
    fee: number,
    min: number,
    base: string,
    minExtract: number,
    minDeposit?: number,
    code: string,
}

export interface IBalanceSymbolList {
    code: string,
    type: number,
    enable: number,
    minWithdrawAmount: number,
}

// export type IBalanceSymbolList = Array<string>;

/**
 * 资产页面，给表格渲染的资产数据格式
 */
export interface IBalanceTable{
    coinType?: string,
    amount?: number,
    restAmount?: number,
    freezeAmount?: number,
    valuation?: number,
    address?: string,
    showCase?: number,
    icon?: string,
}

export interface ILastPriceInfo{
    amount: number,
    price: number,
    request_id: string,
    extent: string,
    timestamp: number,
}

export interface IReduxOrderItems{
    state: number, // <= 2 为 open 状态
    coinType: string,
    amount: number,
    type: string,
    price: string | number,
    dt: Date,
    noFilled: number,
    priceFilled: number,
    orderId: string,
}
