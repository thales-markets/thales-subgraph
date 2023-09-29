import { SpeedMarket } from '../generated/schema';
import { MarketCreated } from '../generated/SpeedMarketsAMM/SpeedMarketsAMM';

export function handleMarketCreated(event: MarketCreated): void {
  let speedMarket = new SpeedMarket(event.transaction.hash.toHexString());

  speedMarket.timestamp = event.block.timestamp;
  speedMarket.address = event.params.market;
  speedMarket.user = event.params.user;
  speedMarket.asset = event.params.asset.toString();
  speedMarket.strikeTime = event.params.strikeTime;
  speedMarket.strikePrice = event.params.strikePrice;
  speedMarket.direction = event.params.direction === 0 ? 'UP' : 'DOWN';
  speedMarket.amount = event.params.buyinAmount;

  speedMarket.save();
}
