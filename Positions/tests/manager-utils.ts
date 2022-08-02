import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  CreatorCapitalRequirementUpdated,
  ExpiryDurationUpdated,
  MarketCreated,
  MarketCreationEnabledUpdated,
  MarketExpired,
  MarketsMigrated,
  MarketsReceived,
  MaxTimeToMaturityUpdated,
  OwnerChanged,
  OwnerNominated,
  PauseChanged,
  SetBinaryOptionsMarketFactory,
  SetCustomMarketCreationEnabled,
  SetMigratingManager,
  SetPriceFeed,
  SetZeroExAddress,
  SetsUSD
} from "../generated/Manager/Manager"

export function createCreatorCapitalRequirementUpdatedEvent(
  value: BigInt
): CreatorCapitalRequirementUpdated {
  let creatorCapitalRequirementUpdatedEvent = changetype<
    CreatorCapitalRequirementUpdated
  >(newMockEvent())

  creatorCapitalRequirementUpdatedEvent.parameters = new Array()

  creatorCapitalRequirementUpdatedEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return creatorCapitalRequirementUpdatedEvent
}

export function createExpiryDurationUpdatedEvent(
  duration: BigInt
): ExpiryDurationUpdated {
  let expiryDurationUpdatedEvent = changetype<ExpiryDurationUpdated>(
    newMockEvent()
  )

  expiryDurationUpdatedEvent.parameters = new Array()

  expiryDurationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(duration)
    )
  )

  return expiryDurationUpdatedEvent
}

export function createMarketCreatedEvent(
  market: Address,
  creator: Address,
  oracleKey: Bytes,
  strikePrice: BigInt,
  maturityDate: BigInt,
  expiryDate: BigInt,
  long: Address,
  short: Address,
  customMarket: boolean,
  customOracle: Address
): MarketCreated {
  let marketCreatedEvent = changetype<MarketCreated>(newMockEvent())

  marketCreatedEvent.parameters = new Array()

  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("market", ethereum.Value.fromAddress(market))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "oracleKey",
      ethereum.Value.fromFixedBytes(oracleKey)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "strikePrice",
      ethereum.Value.fromUnsignedBigInt(strikePrice)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maturityDate",
      ethereum.Value.fromUnsignedBigInt(maturityDate)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "expiryDate",
      ethereum.Value.fromUnsignedBigInt(expiryDate)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("long", ethereum.Value.fromAddress(long))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("short", ethereum.Value.fromAddress(short))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "customMarket",
      ethereum.Value.fromBoolean(customMarket)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "customOracle",
      ethereum.Value.fromAddress(customOracle)
    )
  )

  return marketCreatedEvent
}

export function createMarketCreationEnabledUpdatedEvent(
  enabled: boolean
): MarketCreationEnabledUpdated {
  let marketCreationEnabledUpdatedEvent = changetype<
    MarketCreationEnabledUpdated
  >(newMockEvent())

  marketCreationEnabledUpdatedEvent.parameters = new Array()

  marketCreationEnabledUpdatedEvent.parameters.push(
    new ethereum.EventParam("enabled", ethereum.Value.fromBoolean(enabled))
  )

  return marketCreationEnabledUpdatedEvent
}

export function createMarketExpiredEvent(market: Address): MarketExpired {
  let marketExpiredEvent = changetype<MarketExpired>(newMockEvent())

  marketExpiredEvent.parameters = new Array()

  marketExpiredEvent.parameters.push(
    new ethereum.EventParam("market", ethereum.Value.fromAddress(market))
  )

  return marketExpiredEvent
}

export function createMarketsMigratedEvent(
  receivingManager: Address,
  markets: Array<Address>
): MarketsMigrated {
  let marketsMigratedEvent = changetype<MarketsMigrated>(newMockEvent())

  marketsMigratedEvent.parameters = new Array()

  marketsMigratedEvent.parameters.push(
    new ethereum.EventParam(
      "receivingManager",
      ethereum.Value.fromAddress(receivingManager)
    )
  )
  marketsMigratedEvent.parameters.push(
    new ethereum.EventParam("markets", ethereum.Value.fromAddressArray(markets))
  )

  return marketsMigratedEvent
}

export function createMarketsReceivedEvent(
  migratingManager: Address,
  markets: Array<Address>
): MarketsReceived {
  let marketsReceivedEvent = changetype<MarketsReceived>(newMockEvent())

  marketsReceivedEvent.parameters = new Array()

  marketsReceivedEvent.parameters.push(
    new ethereum.EventParam(
      "migratingManager",
      ethereum.Value.fromAddress(migratingManager)
    )
  )
  marketsReceivedEvent.parameters.push(
    new ethereum.EventParam("markets", ethereum.Value.fromAddressArray(markets))
  )

  return marketsReceivedEvent
}

export function createMaxTimeToMaturityUpdatedEvent(
  duration: BigInt
): MaxTimeToMaturityUpdated {
  let maxTimeToMaturityUpdatedEvent = changetype<MaxTimeToMaturityUpdated>(
    newMockEvent()
  )

  maxTimeToMaturityUpdatedEvent.parameters = new Array()

  maxTimeToMaturityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(duration)
    )
  )

  return maxTimeToMaturityUpdatedEvent
}

export function createOwnerChangedEvent(
  oldOwner: Address,
  newOwner: Address
): OwnerChanged {
  let ownerChangedEvent = changetype<OwnerChanged>(newMockEvent())

  ownerChangedEvent.parameters = new Array()

  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("oldOwner", ethereum.Value.fromAddress(oldOwner))
  )
  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerChangedEvent
}

export function createOwnerNominatedEvent(newOwner: Address): OwnerNominated {
  let ownerNominatedEvent = changetype<OwnerNominated>(newMockEvent())

  ownerNominatedEvent.parameters = new Array()

  ownerNominatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerNominatedEvent
}

export function createPauseChangedEvent(isPaused: boolean): PauseChanged {
  let pauseChangedEvent = changetype<PauseChanged>(newMockEvent())

  pauseChangedEvent.parameters = new Array()

  pauseChangedEvent.parameters.push(
    new ethereum.EventParam("isPaused", ethereum.Value.fromBoolean(isPaused))
  )

  return pauseChangedEvent
}

export function createSetBinaryOptionsMarketFactoryEvent(
  _binaryOptionMarketFactory: Address
): SetBinaryOptionsMarketFactory {
  let setBinaryOptionsMarketFactoryEvent = changetype<
    SetBinaryOptionsMarketFactory
  >(newMockEvent())

  setBinaryOptionsMarketFactoryEvent.parameters = new Array()

  setBinaryOptionsMarketFactoryEvent.parameters.push(
    new ethereum.EventParam(
      "_binaryOptionMarketFactory",
      ethereum.Value.fromAddress(_binaryOptionMarketFactory)
    )
  )

  return setBinaryOptionsMarketFactoryEvent
}

export function createSetCustomMarketCreationEnabledEvent(
  enabled: boolean
): SetCustomMarketCreationEnabled {
  let setCustomMarketCreationEnabledEvent = changetype<
    SetCustomMarketCreationEnabled
  >(newMockEvent())

  setCustomMarketCreationEnabledEvent.parameters = new Array()

  setCustomMarketCreationEnabledEvent.parameters.push(
    new ethereum.EventParam("enabled", ethereum.Value.fromBoolean(enabled))
  )

  return setCustomMarketCreationEnabledEvent
}

export function createSetMigratingManagerEvent(
  manager: Address
): SetMigratingManager {
  let setMigratingManagerEvent = changetype<SetMigratingManager>(newMockEvent())

  setMigratingManagerEvent.parameters = new Array()

  setMigratingManagerEvent.parameters.push(
    new ethereum.EventParam("manager", ethereum.Value.fromAddress(manager))
  )

  return setMigratingManagerEvent
}

export function createSetPriceFeedEvent(_address: Address): SetPriceFeed {
  let setPriceFeedEvent = changetype<SetPriceFeed>(newMockEvent())

  setPriceFeedEvent.parameters = new Array()

  setPriceFeedEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  )

  return setPriceFeedEvent
}

export function createSetZeroExAddressEvent(
  _zeroExAddress: Address
): SetZeroExAddress {
  let setZeroExAddressEvent = changetype<SetZeroExAddress>(newMockEvent())

  setZeroExAddressEvent.parameters = new Array()

  setZeroExAddressEvent.parameters.push(
    new ethereum.EventParam(
      "_zeroExAddress",
      ethereum.Value.fromAddress(_zeroExAddress)
    )
  )

  return setZeroExAddressEvent
}

export function createSetsUSDEvent(_address: Address): SetsUSD {
  let setsUsdEvent = changetype<SetsUSD>(newMockEvent())

  setsUsdEvent.parameters = new Array()

  setsUsdEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  )

  return setsUsdEvent
}
