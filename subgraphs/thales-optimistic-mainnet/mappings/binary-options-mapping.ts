import {
  MarketCreated as MarketCreatedEvent,
  MarketExpired as MarketExpiredEvent,
} from '../../../generated/BinaryOptionMarketManager/BinaryOptionMarketManager';
import {
  Mint as MintEvent,
  MarketResolved as MarketResolvedEvent,
  OptionsExercised as OptionsExercisedEvent,
  BinaryOptionMarket,
} from '../../../generated/templates/BinaryOptionMarket/BinaryOptionMarket';
import { Market, OptionTransaction, Position, PositionBalance } from '../../../generated/schema';
import { BinaryOptionMarket as BinaryOptionMarketContract } from '../../../generated/templates';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleNewMarket(event: MarketCreatedEvent): void {
  BinaryOptionMarketContract.create(event.params.market);
  let binaryOptionContract = BinaryOptionMarket.bind(event.params.market);

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
  entity.poolSize = binaryOptionContract.deposited();
  entity.save();

  let upPosition = new Position(event.params.long.toHex());
  upPosition.side = 'long';
  upPosition.market = entity.id;
  upPosition.save();

  let downPosition = new Position(event.params.short.toHex());
  downPosition.side = 'short';
  downPosition.market = entity.id;
  downPosition.save();
}

// export function handleTransfer(event: TransferEvent): void {
//   let position = Position.load(event.address.toHex());
//   let userBalanceFrom = PositionBalance.load(event.address.toHex() + ' - ' + event.params.from.toHex());
//   if (userBalanceFrom === null) {
//     userBalanceFrom = new PositionBalance(event.address.toHex() + ' - ' + event.params.from.toHex());
//     userBalanceFrom.account = event.params.from;
//     userBalanceFrom.amount = BigInt.fromI32(0);
//     userBalanceFrom.position = position.id;
//   }
//   userBalanceFrom.amount = userBalanceFrom.amount.minus(event.params.value);
//   userBalanceFrom.save();

//   let userBalanceTo = PositionBalance.load(event.address.toHex() + ' - ' + event.params.to.toHex());
//   if (userBalanceTo === null) {
//     userBalanceTo = new PositionBalance(event.address.toHex() + ' - ' + event.params.to.toHex());
//     userBalanceTo.account = event.params.to;
//     userBalanceTo.amount = BigInt.fromI32(0);
//     userBalanceTo.position = position.id;
//   }
//   userBalanceTo.amount = userBalanceTo.amount.plus(event.params.value);
//   userBalanceTo.save();
// }

export function handleMarketExpired(event: MarketExpiredEvent): void {
  let marketEntity = Market.load(event.params.market.toHex());
  marketEntity.isOpen = false;
  marketEntity.save();
}

export function handleMarketResolved(event: MarketResolvedEvent): void {
  let market = Market.load(event.address.toHex());
  market.result = event.params.result;
  market.poolSize = event.params.deposited;
  market.finalPrice = event.params.oraclePrice;
  market.save();
}

export function handleOptionsExercised(event: OptionsExercisedEvent): void {
  let marketEntity = Market.load(event.address.toHex());
  let binaryOptionContract = BinaryOptionMarket.bind(event.address);
  let optionTransactionEntity = new OptionTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  let poolSize = binaryOptionContract.deposited();

  marketEntity.poolSize = poolSize;
  marketEntity.save();

  optionTransactionEntity.type = 'exercise';
  optionTransactionEntity.timestamp = event.block.timestamp;
  optionTransactionEntity.blockNumber = event.block.number;
  optionTransactionEntity.account = event.params.account;
  optionTransactionEntity.market = event.address;
  optionTransactionEntity.amount = event.params.value;
  optionTransactionEntity.save();

  let positionUp = marketEntity.longAddress;
  let positionDown = marketEntity.shortAddress;
  if (positionUp !== null) {
    let userBalanceUp = PositionBalance.load(positionUp.toHex() + ' - ' + event.params.account.toHex());
    if (userBalanceUp !== null) {
      userBalanceUp.amount = BigInt.fromI32(0);
      userBalanceUp.save();
    }
  }
  if (positionDown !== null) {
    let userBalanceDown = PositionBalance.load(positionDown.toHex() + ' - ' + event.params.account.toHex());
    if (userBalanceDown !== null) {
      userBalanceDown.amount = BigInt.fromI32(0);
      userBalanceDown.save();
    }
  }
}

export function handleMint(event: MintEvent): void {
  let marketEntity = Market.load(event.address.toHex());
  let binaryOptionContract = BinaryOptionMarket.bind(event.address);
  let optionTransactionEntity = new OptionTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  let poolSize = binaryOptionContract.deposited();

  marketEntity.poolSize = poolSize;
  marketEntity.save();

  optionTransactionEntity.type = 'mint';
  optionTransactionEntity.timestamp = event.block.timestamp;
  optionTransactionEntity.blockNumber = event.block.number;
  optionTransactionEntity.account = event.params.account;
  optionTransactionEntity.market = event.address;
  optionTransactionEntity.amount = event.params.value;
  optionTransactionEntity.save();

  if (event.params.side === 0) {
    let position = Position.load(marketEntity.longAddress.toHex());
    let userBalanceUp = PositionBalance.load(marketEntity.longAddress.toHex() + ' - ' + event.params.account.toHex());
    if (userBalanceUp === null) {
      userBalanceUp = new PositionBalance(marketEntity.longAddress.toHex() + ' - ' + event.params.account.toHex());
      userBalanceUp.account = event.params.account;
      userBalanceUp.amount = BigInt.fromI32(0);
      userBalanceUp.position = position.id;
    }
    userBalanceUp.amount = userBalanceUp.amount.plus(event.params.value);
    userBalanceUp.save();
  } else {
    let position = Position.load(marketEntity.shortAddress.toHex());
    let userBalanceDown = PositionBalance.load(
      marketEntity.shortAddress.toHex() + ' - ' + event.params.account.toHex(),
    );
    if (userBalanceDown === null) {
      userBalanceDown = new PositionBalance(marketEntity.shortAddress.toHex() + ' - ' + event.params.account.toHex());
      userBalanceDown.account = event.params.account;
      userBalanceDown.amount = BigInt.fromI32(0);
      userBalanceDown.position = position.id;
    }
    userBalanceDown.amount = userBalanceDown.amount.plus(event.params.value);
    userBalanceDown.save();
  }
}
