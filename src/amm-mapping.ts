/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { BoughtFromAmm, SoldToAMM } from '../generated/AMM/AMM';
import { Trade } from '../generated/schema';

export function handleBoughtFromAmmEvent(event: BoughtFromAmm): void {
  let nativeFill = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  nativeFill.transactionHash = event.transaction.hash;
  nativeFill.timestamp = event.block.timestamp;
  nativeFill.orderHash = event.transaction.hash;
  nativeFill.maker = event.address;
  nativeFill.taker = event.params.buyer;
  nativeFill.makerToken = event.params.asset;
  nativeFill.takerToken = event.params.susd;
  nativeFill.makerAmount = event.params.amount;
  nativeFill.takerAmount = event.params.sUSDPaid;

  nativeFill.market = event.params.market;
  nativeFill.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'long' : 'short';
  nativeFill.orderSide = 'buy';
  nativeFill.save();
}

export function handleSoldToAMMEvent(event: SoldToAMM): void {
  let nativeFill = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  nativeFill.transactionHash = event.transaction.hash;
  nativeFill.timestamp = event.block.timestamp;
  nativeFill.orderHash = event.transaction.hash;
  nativeFill.maker = event.address;
  nativeFill.taker = event.params.seller;
  nativeFill.makerToken = event.params.susd;
  nativeFill.takerToken = event.params.asset;
  nativeFill.makerAmount = event.params.sUSDPaid;
  nativeFill.takerAmount = event.params.amount;

  nativeFill.market = event.params.market;
  nativeFill.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'long' : 'short';
  nativeFill.orderSide = 'buy';
  nativeFill.save();
}
