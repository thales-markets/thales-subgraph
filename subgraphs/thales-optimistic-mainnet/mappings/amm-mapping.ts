/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { BoughtFromAmm, ReferrerPaid, SoldToAMM } from '../../../generated/AMM/AMM';
import { Trade, ReferralTransfer, ReferredTrader, Referrer, AccountBuyVolume } from '../../../generated/schema';

export function handleBoughtFromAmmEvent(event: BoughtFromAmm): void {
  let trade = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  trade.transactionHash = event.transaction.hash;
  trade.timestamp = event.block.timestamp;
  trade.blockNumber = event.block.number;
  trade.orderHash = event.transaction.hash;
  trade.maker = event.address;
  trade.taker = event.params.buyer;
  trade.makerToken = event.params.asset;
  trade.takerToken = event.params.susd;
  trade.makerAmount = event.params.amount;
  trade.takerAmount = event.params.sUSDPaid;

  trade.market = event.params.market;
  trade.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'long' : 'short';
  trade.orderSide = 'buy';
  trade.save();

  let accountBuyVolume = new AccountBuyVolume(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  accountBuyVolume.timestamp = event.block.timestamp;
  accountBuyVolume.account = event.params.buyer;
  accountBuyVolume.amount = event.params.sUSDPaid;
  accountBuyVolume.type = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'buyUp' : 'buyDown';
  accountBuyVolume.save();
}

export function handleSoldToAMMEvent(event: SoldToAMM): void {
  let trade = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  trade.transactionHash = event.transaction.hash;
  trade.timestamp = event.block.timestamp;
  trade.blockNumber = event.block.number;
  trade.orderHash = event.transaction.hash;
  trade.maker = event.address;
  trade.taker = event.params.seller;
  trade.makerToken = event.params.susd;
  trade.takerToken = event.params.asset;
  trade.makerAmount = event.params.sUSDPaid;
  trade.takerAmount = event.params.amount;

  trade.market = event.params.market;
  trade.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'long' : 'short';
  trade.orderSide = 'sell';
  trade.save();
}

export function handleReferrerPaid(event: ReferrerPaid): void {
  let referralTx = new ReferralTransfer(event.transaction.hash.toHexString());
  referralTx.amount = event.params.amount;
  referralTx.refferer = event.params.refferer;
  referralTx.trader = event.params.trader;
  referralTx.timestamp = event.block.timestamp;
  referralTx.volume = event.params.volume;

  referralTx.save();

  let referrer = Referrer.load(event.params.refferer.toHex());

  if (referrer == null) {
    referrer = new Referrer(event.params.refferer.toHex());
    referrer.totalVolume = event.params.volume;
    referrer.totalEarned = event.params.amount;
    referrer.trades = BigInt.fromI32(1);
    referrer.timestamp = event.block.timestamp;
  } else {
    referrer.totalVolume = referrer.totalVolume.plus(event.params.volume);
    referrer.totalEarned = referrer.totalEarned.plus(event.params.amount);
    referrer.trades = referrer.trades.plus(BigInt.fromI32(1));
  }

  referrer.save();

  let referredTrader = ReferredTrader.load(event.params.trader.toHex());

  if (referredTrader == null) {
    referredTrader = new ReferredTrader(event.params.trader.toHex());
    referredTrader.trades = BigInt.fromI32(1);
    referredTrader.totalVolume = event.params.volume;
    referredTrader.totalEarned = event.params.amount;
    referredTrader.refferer = event.params.refferer.toHex();
    referredTrader.timestamp = event.block.timestamp;
  } else {
    referredTrader.trades = referredTrader.trades.plus(BigInt.fromI32(1));
    referredTrader.totalVolume = referredTrader.totalVolume.plus(event.params.volume);
    referredTrader.totalEarned = referredTrader.totalEarned.plus(event.params.amount);
  }

  referredTrader.save();
}
