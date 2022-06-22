/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { BoughtFromAmm, SoldToAMM } from '../../generated/SportsAMM/SportsAMM';
import { MarketTransaction } from '../../generated/schema';

export function handleBoughtFromAmmEvent(event: BoughtFromAmm): void {
  let transaction = new MarketTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.type = 'buy';
  transaction.account = event.params.buyer;
  transaction.amount = event.params.amount;
  transaction.position = BigInt.fromI32(event.params.position);
  transaction.market = event.params.market;

  transaction.save();
}

export function handleSoldToAMMEvent(event: SoldToAMM): void {
  let transaction = new MarketTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.type = 'sell';
  transaction.account = event.params.seller;
  transaction.amount = event.params.amount;
  transaction.position = BigInt.fromI32(event.params.position);
  transaction.market = event.params.market;

  transaction.save();
}
