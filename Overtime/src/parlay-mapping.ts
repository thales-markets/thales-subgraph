import { log, BigInt } from '@graphprotocol/graph-ts';
import { NewParlayMarket, ParlayMarketCreated } from '../generated/ParlayMarketsAMM/ParlayMarketsAMM';
import { MarketToGameId, ParlayMarket, Position, SportMarket } from '../generated/schema';
import { getPositionAddressFromPositionIndex } from './functions/helpers';

export function handleNewParlayMarket(event: NewParlayMarket): void {
  let parlayMarket = new ParlayMarket(event.params.market.toHex());
  const sportMarketsArray: string[] = [];
  const positionsArray: string[] = [];
  let lastGameStarts: BigInt | null = null;

  for (let i = 0; i < event.params.markets.length; i++) {
    const marketToGameId = MarketToGameId.load(event.params.markets[i].toHex());

    if (marketToGameId !== null) {
      const sportMarket = SportMarket.load(marketToGameId.gameId.toHex());
      if (sportMarket !== null) {
        sportMarketsArray.push(sportMarket.id);
        if (i == 0) lastGameStarts = sportMarket.maturityDate;
        if (lastGameStarts !== null && lastGameStarts.lt(sportMarket.maturityDate)) {
          lastGameStarts = sportMarket.maturityDate;
        }

        const positionAddress = getPositionAddressFromPositionIndex(event.params.positions[i], sportMarket);

        if (positionAddress !== null) {
          const position = Position.load(positionAddress.toHex());
          if (position !== null) positionsArray.push(position.id);
        }
      }
    }
  }
  parlayMarket.sportMarkets = sportMarketsArray;
  parlayMarket.positions = positionsArray;
  parlayMarket.account = event.transaction.from;
  parlayMarket.totalAmount = event.params.amount;
  parlayMarket.sUSDAfterFees = event.params.sUSDpaid;
  parlayMarket.timestamp = event.block.timestamp;
  parlayMarket.lastGameStarts = lastGameStarts !== null ? lastGameStarts : BigInt.fromString('0');
  parlayMarket.blockNumber = event.block.number;
  parlayMarket.resolved = false;
  parlayMarket.won = false;
  parlayMarket.save();
}

export function handleParlayMarketCreated(event: ParlayMarketCreated): void {
  let parlayMarket = ParlayMarket.load(event.params.market.toHex());

  if (parlayMarket !== null) {
    parlayMarket.totalQuote = event.params.totalQuote;
    parlayMarket.skewImpact = event.params.skewImpact;
    parlayMarket.marketQuotes = event.params.marketQuotes;
    parlayMarket.save();
  }
}
