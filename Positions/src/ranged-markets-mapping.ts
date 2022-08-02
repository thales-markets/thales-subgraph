import { RangedMarketCreated } from '../generated/RangedMarkets/RangedMarketsAMM';

import { Market, RangedMarket, RangedPosition, RangedPositionBalance } from '../generated/schema';
import { RangedMarket as RangedMarketTemplate } from '../generated/templates';
import { Transfer as TransferEvent } from '../generated/templates/RangedPosition/RangedPosition';

import { RangedMarket as RangedMarketContract, Resolved } from '../generated/RangedMarkets/RangedMarket';
import { RangedPosition as RangedPositionContract } from '../generated/templates';
import { BigInt } from '@graphprotocol/graph-ts';

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

    let inPosition = new RangedPosition(rangedMarket.inAddress.toHex());
    inPosition.side = 'in';
    inPosition.market = rangedMarket.id;
    inPosition.save();

    let outPosition = new RangedPosition(rangedMarket.outAddress.toHex());
    outPosition.side = 'out';
    outPosition.market = rangedMarket.id;
    outPosition.save();

    RangedPositionContract.create(rangedMarketContract.positions().value0);
    RangedPositionContract.create(rangedMarketContract.positions().value1);
  }
}

export function handleTransfer(event: TransferEvent): void {
  let position = RangedPosition.load(event.address.toHex());
  if (position !== null) {
    let userBalanceFrom = RangedPositionBalance.load(event.address.toHex() + ' - ' + event.params.from.toHex());
    if (userBalanceFrom === null) {
      userBalanceFrom = new RangedPositionBalance(event.address.toHex() + ' - ' + event.params.from.toHex());
      userBalanceFrom.account = event.params.from;
      userBalanceFrom.amount = BigInt.fromI32(0);
      userBalanceFrom.position = position.id;
    }
    userBalanceFrom.amount = userBalanceFrom.amount.minus(event.params.value);
    userBalanceFrom.save();

    let userBalanceTo = RangedPositionBalance.load(event.address.toHex() + ' - ' + event.params.to.toHex());
    if (userBalanceTo === null) {
      userBalanceTo = new RangedPositionBalance(event.address.toHex() + ' - ' + event.params.to.toHex());
      userBalanceTo.account = event.params.to;
      userBalanceTo.amount = BigInt.fromI32(0);
      userBalanceTo.position = position.id;
    }
    userBalanceTo.amount = userBalanceTo.amount.plus(event.params.value);
    userBalanceTo.save();
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
