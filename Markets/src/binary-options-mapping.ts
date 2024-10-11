import { BigInt } from '@graphprotocol/graph-ts';
import {
  MarketCreated as MarketCreatedEvent,
  MarketExpired as MarketExpiredEvent,
} from '../generated/BinaryOptionMarketManager/BinaryOptionMarketManager';
import { Market, OptionTransaction, Position, PositionBalance } from '../generated/schema';
import { BinaryOptionMarket as BinaryOptionMarketContract } from '../generated/templates';
import {
  BinaryOptionMarket,
  MarketResolved as MarketResolvedEvent,
  Mint as MintEvent,
  OptionsExercised as OptionsExercisedEvent,
} from '../generated/templates/BinaryOptionMarket/BinaryOptionMarket';

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
  entity.managerAddress = event.address;
  entity.save();

  let upPosition = new Position(event.params.long.toHex());
  upPosition.side = 'long';
  upPosition.market = entity.id;
  upPosition.managerAddress = event.address;
  upPosition.save();

  let downPosition = new Position(event.params.short.toHex());
  downPosition.side = 'short';
  downPosition.market = entity.id;
  downPosition.managerAddress = event.address;
  downPosition.save();
}

export function handleMarketExpired(event: MarketExpiredEvent): void {
  let marketEntity = Market.load(event.params.market.toHex());
  if (marketEntity !== null) {
    marketEntity.isOpen = false;
    marketEntity.save();
  }
}

export function handleMarketResolved(event: MarketResolvedEvent): void {
  let market = Market.load(event.address.toHex());
  if (market !== null) {
    market.result = event.params.result;
    market.poolSize = event.params.deposited;
    market.finalPrice = event.params.oraclePrice;
    market.save();
  }
}

export function handleOptionsExercised(event: OptionsExercisedEvent): void {
  let marketEntity = Market.load(event.address.toHex());
  let binaryOptionContract = BinaryOptionMarket.bind(event.address);
  let optionTransactionEntity = new OptionTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  let poolSize = binaryOptionContract.deposited();
  if (marketEntity !== null) {
    marketEntity.poolSize = poolSize;
    marketEntity.save();

    optionTransactionEntity.type = 'exercise';
    optionTransactionEntity.timestamp = event.block.timestamp;
    optionTransactionEntity.blockNumber = event.block.number;
    optionTransactionEntity.account = event.params.account;
    optionTransactionEntity.market = event.address;
    optionTransactionEntity.amount = event.params.value;
    optionTransactionEntity.isRangedMarket = false;
    optionTransactionEntity.managerAddress = marketEntity.managerAddress;

    let positionUp = marketEntity.longAddress;
    let positionDown = marketEntity.shortAddress;
    if (positionUp !== null) {
      let userBalanceUp = PositionBalance.load(positionUp.toHex() + ' - ' + event.params.account.toHex());
      if (userBalanceUp !== null) {
        optionTransactionEntity.side = 0;
        userBalanceUp.amount = BigInt.fromI32(0);
        userBalanceUp.save();
      }
    }
    if (positionDown !== null) {
      let userBalanceDown = PositionBalance.load(positionDown.toHex() + ' - ' + event.params.account.toHex());
      if (userBalanceDown !== null) {
        optionTransactionEntity.side = 1;
        userBalanceDown.amount = BigInt.fromI32(0);
        userBalanceDown.save();
      }
    }
    optionTransactionEntity.save();
  }
}

export function handleMint(event: MintEvent): void {
  let marketEntity = Market.load(event.address.toHex());
  let binaryOptionContract = BinaryOptionMarket.bind(event.address);
  let optionTransactionEntity = new OptionTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  let poolSize = binaryOptionContract.deposited();

  if (marketEntity !== null) {
    marketEntity.poolSize = poolSize;
    marketEntity.save();

    optionTransactionEntity.type = 'mint';
    optionTransactionEntity.timestamp = event.block.timestamp;
    optionTransactionEntity.blockNumber = event.block.number;
    optionTransactionEntity.account = event.params.account;
    optionTransactionEntity.market = event.address;
    optionTransactionEntity.amount = event.params.value;
    optionTransactionEntity.isRangedMarket = false;
    optionTransactionEntity.managerAddress = marketEntity.managerAddress;
    optionTransactionEntity.save();

    if (event.params.side === 0) {
      let position = Position.load(marketEntity.longAddress.toHex());
      if (position !== null) {
        let userBalanceUp = PositionBalance.load(
          marketEntity.longAddress.toHex() + ' - ' + event.params.account.toHex(),
        );
        if (userBalanceUp === null) {
          userBalanceUp = new PositionBalance(marketEntity.longAddress.toHex() + ' - ' + event.params.account.toHex());
          userBalanceUp.account = event.params.account;
          userBalanceUp.amount = BigInt.fromI32(0);
          userBalanceUp.paid = BigInt.fromI32(0);
          userBalanceUp.position = position.id;
          userBalanceUp.managerAddress = marketEntity.managerAddress;
        }
        userBalanceUp.amount = userBalanceUp.amount.plus(event.params.value);
        userBalanceUp.save();
      }
    } else {
      let position = Position.load(marketEntity.shortAddress.toHex());
      if (position !== null) {
        let userBalanceDown = PositionBalance.load(
          marketEntity.shortAddress.toHex() + ' - ' + event.params.account.toHex(),
        );
        if (userBalanceDown === null) {
          userBalanceDown = new PositionBalance(
            marketEntity.shortAddress.toHex() + ' - ' + event.params.account.toHex(),
          );
          userBalanceDown.account = event.params.account;
          userBalanceDown.amount = BigInt.fromI32(0);
          userBalanceDown.paid = BigInt.fromI32(0);
          userBalanceDown.position = position.id;
          userBalanceDown.managerAddress = marketEntity.managerAddress;
        }
        userBalanceDown.amount = userBalanceDown.amount.plus(event.params.value);
        userBalanceDown.save();
      }
    }
  }
}
