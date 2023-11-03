import { log, BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  NewParlayMarket,
  ParlayMarketCreated,
  ParlayResolved,
  ReferrerPaid,
} from '../generated/ParlayMarketsAMM/ParlayMarketsAMM';
import {
  ParlayMarket,
  Position,
  ReferralTransaction,
  ReferredTrader,
  Referrer,
  SportMarket,
  User,
} from '../generated/schema';
import { getPositionAddressFromPositionIndex } from './functions/helpers';

export function handleNewParlayMarket(event: NewParlayMarket): void {
  log.warning('handleNewParlayMarket -> parlayMarket address {}', [event.params.market.toHexString()]);
  let parlayMarket = new ParlayMarket(event.params.market.toHex());
  const sportMarketsArray: string[] = [];
  const positionsArray: string[] = [];
  let lastGameStarts: BigInt | null = null;

  for (let i = 0; i < event.params.markets.length; i++) {
    const sportMarket = SportMarket.load(event.params.markets[i].toHex());
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

  const sportMarketAddresses: Bytes[] = [];
  for (let i = 0; i < event.params.markets.length; i++) {
    sportMarketAddresses.push(event.params.markets[i]);
  }
  parlayMarket.txHash = event.transaction.hash;
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
    parlayMarket.account = event.params.account;
    parlayMarket.save();

    let userStats = User.load(event.params.account.toHex());
    if (userStats === null) {
      userStats = new User(event.params.account.toHex());
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

export function handleReferralTransaction(event: ReferrerPaid): void {
  let referrer = Referrer.load(event.params.refferer.toHex());
  let trader = ReferredTrader.load(event.params.trader.toHex());

  if (referrer == null) {
    referrer = new Referrer(event.params.refferer.toHex());
    referrer.trades = BigInt.fromI32(1);
    referrer.totalEarned = event.params.amount;
    referrer.totalVolume = event.params.volume;
    referrer.timestamp = event.block.timestamp;
    referrer.save();
  } else {
    referrer.trades = referrer.trades.plus(BigInt.fromI32(1));
    referrer.totalEarned = referrer.totalEarned.plus(event.params.amount);
    referrer.totalVolume = referrer.totalVolume.plus(event.params.volume);
    referrer.save();
  }

  if (trader == null) {
    trader = new ReferredTrader(event.params.trader.toHex());
    trader.trades = BigInt.fromI32(1);
    trader.totalAmount = event.params.amount;
    trader.totalVolume = event.params.volume;
    trader.referrer = referrer.id;
    trader.timestamp = event.block.timestamp;
    trader.save();
  } else {
    trader.trades = trader.trades.plus(BigInt.fromI32(1));
    trader.totalAmount = trader.totalAmount.plus(event.params.amount);
    trader.totalVolume = trader.totalVolume.plus(event.params.volume);
    trader.save();
  }

  let referralTransaction = new ReferralTransaction(event.transaction.hash.toHex());
  referralTransaction.referrer = referrer.id;
  referralTransaction.trader = trader.id;
  referralTransaction.amount = event.params.amount;
  referralTransaction.volume = event.params.volume;
  referralTransaction.ammType = 'parlay';
  referralTransaction.timestamp = event.block.timestamp;
  referralTransaction.save();
}
