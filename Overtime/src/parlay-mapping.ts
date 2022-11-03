import { log, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { NewParlayMarket, ParlayMarketCreated, ParlayResolved } from '../generated/ParlayMarketsAMM/ParlayMarketsAMM';
import { MarketToGameId, ParlayMarket, Position, SportMarket, User } from '../generated/schema';
import { getPositionAddressFromPositionIndex } from './functions/helpers';

export function handleNewParlayMarket(event: NewParlayMarket): void {
  log.warning('handleNewParlayMarket -> parlayMarket address {}', [event.params.market.toHexString()]);
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

  const sportMarketAddresses: Bytes[] = [];
  for (let i = 0; i < event.params.markets.length; i++) {
    sportMarketAddresses.push(event.params.markets[i]);
  }
  parlayMarket.sportMarkets = sportMarketsArray;
  parlayMarket.sportMarketsFromContract = sportMarketAddresses;
  parlayMarket.positions = positionsArray;
  parlayMarket.positionsFromContract = event.params.positions;
  parlayMarket.account = event.transaction.from;
  parlayMarket.totalAmount = event.params.amount;
  parlayMarket.sUSDAfterFees = event.params.sUSDpaid;
  parlayMarket.timestamp = event.block.timestamp;
  parlayMarket.lastGameStarts = lastGameStarts !== null ? lastGameStarts : BigInt.fromString('0');
  parlayMarket.blockNumber = event.block.number;
  parlayMarket.claimed = false;
  parlayMarket.won = false;
  parlayMarket.save();
}

export function handleParlayMarketCreated(event: ParlayMarketCreated): void {
  log.warning('handleParlayMarketCreated -> parlayMarket address {}', [event.params.market.toHexString()]);
  let parlayMarket = ParlayMarket.load(event.params.market.toHex());
  if (parlayMarket !== null) {
    parlayMarket.totalQuote = event.params.totalQuote;
    parlayMarket.skewImpact = event.params.skewImpact;
    parlayMarket.sUSDAfterFees = event.params.sUSDAfterFees;
    parlayMarket.sUSDPaid = event.params.sUSDPaid;
    parlayMarket.marketQuotes = event.params.marketQuotes;
    parlayMarket.save();

    let userStats = User.load(event.transaction.from.toHex());
    if (userStats === null) {
      userStats = new User(event.transaction.from.toHex());
      userStats.volume = BigInt.fromI32(0);
      userStats.pnl = BigInt.fromI32(0);
      userStats.trades = 0;
    }
    userStats.volume = userStats.volume.plus(event.params.sUSDPaid);
    userStats.pnl = userStats.pnl.minus(event.params.sUSDPaid);
    userStats.trades = userStats.trades + 1;
    userStats.save();
  }
}

export function handleParlayResolved(event: ParlayResolved): void {
  log.info('handleParlayResolved -> parlayMarket address {}', [event.params._parlayMarket.toHexString()]);
  let parlayMarket = ParlayMarket.load(event.params._parlayMarket.toHex());
  if (parlayMarket !== null) {
    parlayMarket.claimed = true;
    parlayMarket.won = event.params._userWon;
    parlayMarket.save();
  }
}