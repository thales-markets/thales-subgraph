import { RangedMarketCreated } from '../generated/RangedMarkets/RangedMarketsAMM';

import {
  Market,
  RangedMarket,
  Trade,
  AccountBuyVolume,
  OptionTransaction,
  Referrer,
  ReferralTransfer,
  ReferredTrader,
} from '../generated/schema';
import { RangedMarket as RangedMarketTemplate } from '../generated/templates';
import { BigInt } from '@graphprotocol/graph-ts';
import { RangedMarket as RangedMarketContract, Resolved } from '../generated/RangedMarkets/RangedMarket';
import { BoughtFromAmm, SoldToAMM, ReferrerPaid } from '../generated/RangedMarkets/RangedMarketsAMM';
import { Exercised, Mint } from '../generated/RangedMarkets/RangedMarket';

export function handleRangedMarket(event: RangedMarketCreated): void {
  let rangedMarket = new RangedMarket(event.params.market.toHex());
  RangedMarketTemplate.create(event.params.market);

  let leftMarket = Market.load(event.params.leftMarket.toHex());
  let rightMarket = Market.load(event.params.rightMarket.toHex());

  let rangedMarketContract = RangedMarketContract.bind(event.params.market);

  if (leftMarket !== null && rightMarket !== null) {
    rangedMarket.timestamp = event.block.timestamp;
    rangedMarket.currencyKey = leftMarket.currencyKey;
    rangedMarket.maturityDate = leftMarket.maturityDate;
    rangedMarket.expiryDate = leftMarket.expiryDate;
    rangedMarket.leftPrice = leftMarket.strikePrice;
    rangedMarket.rightPrice = rightMarket.strikePrice;
    rangedMarket.inAddress = rangedMarketContract.positions().value0;
    rangedMarket.outAddress = rangedMarketContract.positions().value1;
    rangedMarket.isOpen = true;
    rangedMarket.leftMarket = leftMarket.id;
    rangedMarket.rightMarket = rightMarket.id;
    rangedMarket.save();
  }
}

export function handleMarketResolved(event: Resolved): void {
  let market = RangedMarket.load(event.address.toHex());
  if (market !== null) {
    market.result = event.params.winningPosition;
    market.finalPrice = event.params.finalPrice;
    market.save();
  }
}

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
  trade.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'in' : 'out';
  trade.orderSide = 'buy';
  trade.save();

  let accountBuyVolume = new AccountBuyVolume(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  accountBuyVolume.timestamp = event.block.timestamp;
  accountBuyVolume.account = event.params.buyer;
  accountBuyVolume.amount = event.params.sUSDPaid;
  accountBuyVolume.type = 'buyRanged';
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
  trade.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'in' : 'out';
  trade.orderSide = 'sell';
  trade.save();
}

export function handleExercised(event: Exercised): void {
  let optionTransactionEntity = new OptionTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());

  optionTransactionEntity.type = 'exercise';
  optionTransactionEntity.timestamp = event.block.timestamp;
  optionTransactionEntity.blockNumber = event.block.number;
  optionTransactionEntity.account = event.params.exerciser;
  optionTransactionEntity.market = event.address;
  optionTransactionEntity.amount = event.params.amount;
  optionTransactionEntity.side = event.params._position;
  optionTransactionEntity.save();
}

export function handleMint(event: Mint): void {
  let optionTransactionEntity = new OptionTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());

  optionTransactionEntity.type = 'mint';
  optionTransactionEntity.timestamp = event.block.timestamp;
  optionTransactionEntity.blockNumber = event.block.number;
  optionTransactionEntity.account = event.params.minter;
  optionTransactionEntity.market = event.address;
  optionTransactionEntity.amount = event.params.amount;
  optionTransactionEntity.side = event.params._position;
  optionTransactionEntity.save();
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
