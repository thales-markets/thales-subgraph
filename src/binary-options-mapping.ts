import {
  MarketCreated as MarketCreatedEvent,
  MarketExpired as MarketExpiredEvent,
} from '../generated/BinaryOptionMarketManager/BinaryOptionMarketManager';
import {
  Mint as MintEvent,
  MarketResolved as MarketResolvedEvent,
  OptionsExercised as OptionsExercisedEvent,
  BinaryOptionMarket,
} from '../generated/templates/BinaryOptionMarket/BinaryOptionMarket';
import { Market, OptionTransaction, BinaryOption } from '../generated/schema';
import { BinaryOptionMarket as BinaryOptionMarketContract } from '../generated/templates';

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

  let longEntity = new BinaryOption(event.params.long.toHex());
  longEntity.market = event.params.market;
  longEntity.timestamp = event.block.timestamp;
  longEntity.side = 'long';
  longEntity.save();
  let shortEntity = new BinaryOption(event.params.short.toHex());
  shortEntity.market = event.params.market;
  shortEntity.timestamp = event.block.timestamp;
  shortEntity.side = 'short';
  shortEntity.save();
}

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
}
