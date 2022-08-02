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
import { Market } from '../generated/schema';
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
  let poolSize = binaryOptionContract.deposited();
  if (marketEntity !== null) {
    marketEntity.poolSize = poolSize;
    marketEntity.save();
  }
}

export function handleMint(event: MintEvent): void {
  let marketEntity = Market.load(event.address.toHex());
  let binaryOptionContract = BinaryOptionMarket.bind(event.address);

  let poolSize = binaryOptionContract.deposited();

  if (marketEntity !== null) {
    marketEntity.poolSize = poolSize;
    marketEntity.save();
  }
}
