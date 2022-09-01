/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { BoughtFromAmm, SoldToAMM } from '../generated/SportsAMM/SportsAMM';
import {
  MarketTransaction,
  Position,
  PositionBalance,
  SportMarket,
  MarketToGameId,
  BuyTransaction,
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
      transaction.save();

      let position = Position.load(event.params.asset.toHex());
      if (position !== null) {
        let userBalanceFrom = PositionBalance.load(position.id + ' - ' + event.params.buyer.toHex());
        if (userBalanceFrom === null) {
          userBalanceFrom = new PositionBalance(position.id + ' - ' + event.params.buyer.toHex());
          userBalanceFrom.account = event.params.buyer;
          userBalanceFrom.amount = BigInt.fromI32(0);
          userBalanceFrom.position = position.id;
        }
        userBalanceFrom.amount = userBalanceFrom.amount.plus(event.params.amount);
        userBalanceFrom.save();

        let buyTransaction = new BuyTransaction(event.transaction.hash.toHexString());
        buyTransaction.marketTransactionId = transaction.id;
        buyTransaction.positionBalanceId = userBalanceFrom.id;
        buyTransaction.save();
      }
    }
  }
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
      transaction.save();

      let position = Position.load(event.params.asset.toHex());
      if (position !== null) {
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
  }
}
