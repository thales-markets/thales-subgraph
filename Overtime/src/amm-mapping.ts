/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { BoughtFromAmm, ReferrerPaid, SoldToAMM } from '../generated/SportsAMM/SportsAMM';
import {
  MarketTransaction,
  Position,
  PositionBalance,
  SportMarket,
  MarketToGameId,
  BuyTransaction,
  User,
  Referrer,
  ReferredTrader,
  ReferralTransaction,
} from '../generated/schema';

export function handleBoughtFromAmmEvent(event: BoughtFromAmm): void {
  let transaction = new MarketTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  let marketToGameId = MarketToGameId.load(event.params.market.toHex());
  if (marketToGameId !== null) {
    let market = SportMarket.load(marketToGameId.gameId.toHex());
    if (market !== null) {
      transaction.hash = event.transaction.hash;
      transaction.timestamp = event.block.timestamp;
      transaction.blockNumber = event.block.number;
      transaction.type = 'buy';
      transaction.account = event.params.buyer;
      transaction.amount = event.params.amount;
      transaction.position = BigInt.fromI32(event.params.position);
      transaction.market = event.params.market;
      transaction.paid = event.params.sUSDPaid;
      transaction.wholeMarket = market.id;

      let position = Position.load(event.params.asset.toHex());
      if (position !== null) {
        let userBalanceFrom = PositionBalance.load(position.id + ' - ' + event.params.buyer.toHex());
        if (userBalanceFrom === null) {
          userBalanceFrom = new PositionBalance(position.id + ' - ' + event.params.buyer.toHex());
          userBalanceFrom.firstTxHash = event.transaction.hash;
          userBalanceFrom.account = event.params.buyer;
          userBalanceFrom.amount = BigInt.fromI32(0);
          userBalanceFrom.position = position.id;
          userBalanceFrom.sUSDPaid = BigInt.fromI32(0);
        }

        transaction.positionBalance = userBalanceFrom.id;

        userBalanceFrom.amount = userBalanceFrom.amount.plus(event.params.amount);
        userBalanceFrom.sUSDPaid = userBalanceFrom.sUSDPaid.plus(event.params.sUSDPaid);
        userBalanceFrom.save();

        let buyTransaction = new BuyTransaction(event.transaction.hash.toHexString());
        buyTransaction.marketTransactionId = transaction.id;
        buyTransaction.positionBalanceId = userBalanceFrom.id;
        buyTransaction.save();
      }
      transaction.save();
    }
  }

  let userStats = User.load(event.params.buyer.toHex());
  if (userStats === null) {
    userStats = new User(event.params.buyer.toHex());
    userStats.volume = BigInt.fromI32(0);
    userStats.pnl = BigInt.fromI32(0);
    userStats.trades = 0;
  }
  userStats.volume = userStats.volume.plus(event.params.sUSDPaid);
  userStats.pnl = userStats.pnl.minus(event.params.sUSDPaid);
  userStats.trades = userStats.trades + 1;
  userStats.save();
}

export function handleSoldToAMMEvent(event: SoldToAMM): void {
  let transaction = new MarketTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  let marketToGameId = MarketToGameId.load(event.params.market.toHex());
  if (marketToGameId !== null) {
    let market = SportMarket.load(marketToGameId.gameId.toHex());
    if (market !== null) {
      transaction.hash = event.transaction.hash;
      transaction.timestamp = event.block.timestamp;
      transaction.blockNumber = event.block.number;
      transaction.type = 'sell';
      transaction.account = event.params.seller;
      transaction.amount = event.params.amount;
      transaction.position = BigInt.fromI32(event.params.position);
      transaction.market = event.params.market;
      transaction.paid = event.params.sUSDPaid;
      transaction.wholeMarket = market.id;

      let position = Position.load(event.params.asset.toHex());
      if (position !== null) {
        let userBalanceFrom = PositionBalance.load(position.id + ' - ' + event.params.seller.toHex());
        if (userBalanceFrom === null) {
          userBalanceFrom = new PositionBalance(position.id + ' - ' + event.params.seller.toHex());
          userBalanceFrom.firstTxHash = event.transaction.hash;
          userBalanceFrom.account = event.params.seller;
          userBalanceFrom.amount = BigInt.fromI32(0);
          userBalanceFrom.position = position.id;
        }

        transaction.positionBalance = userBalanceFrom.id;

        userBalanceFrom.amount = userBalanceFrom.amount.minus(event.params.amount);
        userBalanceFrom.save();
      }
      transaction.save();
    }
  }

  let userStats = User.load(event.params.seller.toHex());
  if (userStats === null) {
    userStats = new User(event.params.seller.toHex());
    userStats.volume = BigInt.fromI32(0);
    userStats.pnl = BigInt.fromI32(0);
    userStats.trades = 0;
  }
  userStats.volume = userStats.volume.plus(event.params.sUSDPaid);
  userStats.pnl = userStats.pnl.plus(event.params.sUSDPaid);
  userStats.trades = userStats.trades + 1;
  userStats.save();
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
  referralTransaction.ammType = 'single';
  referralTransaction.timestamp = event.block.timestamp;
  referralTransaction.save();
}
