/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { BoughtFromAmm, ReferrerPaid, SoldToAMM } from '../../../generated/AMM/AMM';
import { Referral, Trade } from '../../../generated/schema';

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
  let referral = new Referral(event.transaction.hash.toHexString());
  referral.amount = event.params.amount;
  referral.refferer = event.params.refferer;
  referral.trader = event.params.trader;
  referral.timestamp = event.block.timestamp;
  referral.volume = event.params.volume;

  referral.save();
}
