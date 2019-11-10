import { Rate } from 'antd';
import * as React from 'react';
import './App.scss';

import logo from './logo.svg';
import { TVChartContainer } from './TVChartContainer';

class App extends React.Component<{}, any> {

  constructor(props){
    super(props);

    // 读取当前请求参数
    const url = new URL(window.location.href);
    const symbol = url.searchParams.get("symbol");
    const precision = url.searchParams.get("precision");

    this.state = {
      symbol: symbol ? symbol : 'BTC/USDT',
      precision: precision ? precision : 4
    };

    console.log('current symbol: '+ this.state.symbol)

    const self = this;

    window.onmessage = (message)=>{
      self.onMessage(message);
    };

    document.addEventListener('message', function(msg) {
      self.onMessage(msg);
    });

  }

  public onMessage(message){
    console.log('listened onMessage', message);

    if (message && message.data) {
        
      let data = message.data;
        if ( typeof(message.data) == 'string') {
          // 转换为JSON对象
          data = JSON.parse(message.data);
        }

      console.log('data', data);

      if (data.action == 'symbol_change') {
        // symbol change
        this.setState({symbol: data.value});
      }
    }
  }

  public render() {

        // let symbol = 'ETH/USDT';
    // let symbol = 'HUB/USDT';
    let symbol = this.state.symbol;
    symbol = symbol.split('/').join('').toLocaleLowerCase();

    return (
      <div className="App">
        <div style={{ width: '100%', height: '100%' }}>
          <TVChartContainer 
            symbol={symbol} 
            precision={this.state.precision}
            key={symbol} />
        </div>
      </div>
    );
  }
}

export default App;
