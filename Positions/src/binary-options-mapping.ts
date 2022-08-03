import {
  MarketCreated as MarketCreatedEvent,
  MarketExpired as MarketExpiredEvent,
} from '../generated/BinaryOptionMarketManager/BinaryOptionMarketManager';
import { Transfer as TransferEvent } from '../generated/templates/Position/Position';
import { Market, Position, PositionBalance } from '../generated/schema';
import { Position as PositionContract } from '../generated/templates';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleNewMarket(event: MarketCreatedEvent): void {
  let entity = new Market(event.params.market.toHex());
  entity.creator = event.params.creator;
  entity.timestamp = event.block.timestamp;
  entity.currencyKey = event.params.oracleKey;
  entity.strikePrice = event.params.strikePrice;
  entity.maturityDate = event.params.maturityDate;
  entity.expiryDate = event.params.expiryDate;
  entity.isOpen = true;
  entity.longAddress = event.params.long;
  entity.shortAddress = event.params.short;
  entity.customMarket = event.params.customMarket;
  entity.customOracle = event.params.customOracle;
  entity.poolSize = BigInt.fromI32(0);
  entity.save();

  const upPosition = new Position(event.params.long.toHex());
  upPosition.side = 'long';
  upPosition.market = entity.id;
  upPosition.save();

  const downPosition = new Position(event.params.short.toHex());
  downPosition.side = 'short';
  downPosition.market = entity.id;
  downPosition.save();

  PositionContract.create(event.params.long);
  PositionContract.create(event.params.short);
}

export function handleTransfer(event: TransferEvent): void {
  const position = Position.load(event.address.toHex());
  if (position !== null) {
    let userBalanceFrom = PositionBalance.load(event.address.toHex() + ' - ' + event.params.from.toHex());
    if (userBalanceFrom === null) {
      userBalanceFrom = new PositionBalance(event.address.toHex() + ' - ' + event.params.from.toHex());
      userBalanceFrom.account = event.params.from;
      userBalanceFrom.amount = BigInt.fromI32(0);
      userBalanceFrom.position = position.id;
    }
    userBalanceFrom.amount = userBalanceFrom.amount.minus(event.params.value);
    userBalanceFrom.save();

    let userBalanceTo = PositionBalance.load(event.address.toHex() + ' - ' + event.params.to.toHex());
    if (userBalanceTo === null) {
      userBalanceTo = new PositionBalance(event.address.toHex() + ' - ' + event.params.to.toHex());
      userBalanceTo.account = event.params.to;
      userBalanceTo.amount = BigInt.fromI32(0);
      userBalanceTo.position = position.id;
    }
    userBalanceTo.amount = userBalanceTo.amount.plus(event.params.value);
    userBalanceTo.save();
  }
}
