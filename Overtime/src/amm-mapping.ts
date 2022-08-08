/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { BoughtFromAmm, SoldToAMM } from '../generated/SportsAMM/SportsAMM';
import { MarketTransaction, Position, PositionBalance, SportMarket } from '../generated/schema';
import { log } from '@graphprotocol/graph-ts';

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
  transaction.paid = event.params.sUSDPaid;
  log.info('zero adress draw: {}', [event.params.asset.toHexString()]);
  let position = Position.load(event.params.asset.toHex());
  if (position !== null) {
    log.info('zero adress draw: {}', ['0']);
    let userBalanceFrom = PositionBalance.load(position.id + ' - ' + event.params.buyer.toHex());
    if (userBalanceFrom === null) {
      userBalanceFrom = new PositionBalance(position.id + ' - ' + event.params.buyer.toHex());
      userBalanceFrom.account = event.params.buyer;
      userBalanceFrom.amount = BigInt.fromI32(0);
      userBalanceFrom.position = position.id;
    }
    userBalanceFrom.amount = userBalanceFrom.amount.plus(event.params.amount);
    userBalanceFrom.save();
  }
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
  transaction.paid = event.params.sUSDPaid;

  transaction.save();

  let position = Position.load(event.params.asset.toHex());
  if (position !== null) {
    log.info('zero adress draw: {}', ['0']);
    let userBalanceFrom = PositionBalance.load(position.id + ' - ' + event.params.seller.toHex());
    if (userBalanceFrom === null) {
      userBalanceFrom = new PositionBalance(position.id + ' - ' + event.params.seller.toHex());
      userBalanceFrom.account = event.params.seller;
      userBalanceFrom.amount = BigInt.fromI32(0);
      userBalanceFrom.position = position.id;
    }
    userBalanceFrom.amount = userBalanceFrom.amount.minus(event.params.amount);
    userBalanceFrom.save();
  }
}
