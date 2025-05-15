import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  BuybackExecuted,
  ThalesTokenAddressChanged,
  TickLengthChanged,
  TickRateChanged,
} from '../generated/SafeBoxBuyback/SafeBoxBuyback';
import { BuybackByDate, BuybackParam, BuybackParamChange, BuybackTransaction } from '../generated/schema';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function handleBuybackExecutedEvent(event: BuybackExecuted): void {
  let buybackTx = new BuybackTransaction(event.transaction.hash.concatI32(event.logIndex.toI32()));
  buybackTx.transactionHash = event.transaction.hash;
  buybackTx.timestamp = event.block.timestamp;
  buybackTx.amountIn = event.params._amountIn;
  buybackTx.amountOut = event.params._amountOut;
  buybackTx.save();

  let timestampDate = new Date(event.block.timestamp.times(BigInt.fromI32(1000)).toI64());
  let date = `${timestampDate.getUTCFullYear()}-${timestampDate.getUTCMonth() + 1}-${timestampDate.getUTCDate()}`;

  let buybackByDate = BuybackByDate.load(date);
  if (buybackByDate === null) {
    buybackByDate = new BuybackByDate(date);
    buybackByDate.date = date;
    buybackByDate.amountIn = event.params._amountIn;
    buybackByDate.amountOut = event.params._amountOut;
  } else {
    buybackByDate.amountIn = buybackByDate.amountIn.plus(event.params._amountIn);
    buybackByDate.amountOut = buybackByDate.amountOut.plus(event.params._amountOut);
  }
  buybackByDate.lastUpdate = event.block.timestamp;
  buybackByDate.save();
}

export function handleTickLengthChangedEvent(event: TickLengthChanged): void {
  let buybackParam = BuybackParam.load(event.address);
  if (buybackParam === null) {
    buybackParam = new BuybackParam(event.address);
    buybackParam.tickRate = BigInt.fromI32(0);
    buybackParam.tokenAddress = Bytes.fromHexString(ZERO_ADDRESS);
  }

  buybackParam.tickLength = event.params._tickLength;
  buybackParam.lastChange = event.block.timestamp;
  buybackParam.save();

  let buybackParamChange = new BuybackParamChange(event.transaction.hash.concatI32(event.logIndex.toI32()));
  buybackParamChange.transactionHash = event.transaction.hash;
  buybackParamChange.timestamp = event.block.timestamp;
  buybackParamChange.type = 'changeTickLength';
  buybackParamChange.tickLength = buybackParam.tickLength;
  buybackParamChange.tickRate = buybackParam.tickRate;
  buybackParamChange.tokenAddress = buybackParam.tokenAddress;
  buybackParamChange.save();
}

export function handleTickRateChangedEvent(event: TickRateChanged): void {
  let buybackParam = BuybackParam.load(event.address);
  if (buybackParam === null) {
    buybackParam = new BuybackParam(event.address);
    buybackParam.tickLength = BigInt.fromI32(0);
    buybackParam.tokenAddress = Bytes.fromHexString(ZERO_ADDRESS);
  }

  buybackParam.tickRate = event.params._sUSDperTick;
  buybackParam.lastChange = event.block.timestamp;
  buybackParam.save();

  let buybackParamChange = new BuybackParamChange(event.transaction.hash.concatI32(event.logIndex.toI32()));
  buybackParamChange.transactionHash = event.transaction.hash;
  buybackParamChange.timestamp = event.block.timestamp;
  buybackParamChange.type = 'changeTickRate';
  buybackParamChange.tickLength = buybackParam.tickLength;
  buybackParamChange.tickRate = buybackParam.tickRate;
  buybackParamChange.tokenAddress = buybackParam.tokenAddress;
  buybackParamChange.save();
}

export function handleThalesTokenAddressChangedEvent(event: ThalesTokenAddressChanged): void {
  let buybackParam = BuybackParam.load(event.address);
  if (buybackParam === null) {
    buybackParam = new BuybackParam(event.address);
    buybackParam.tickLength = BigInt.fromI32(0);
    buybackParam.tickRate = BigInt.fromI32(0);
  }

  buybackParam.tokenAddress = event.params._tokenAddress;
  buybackParam.lastChange = event.block.timestamp;
  buybackParam.save();

  let buybackParamChange = new BuybackParamChange(event.transaction.hash.concatI32(event.logIndex.toI32()));
  buybackParamChange.transactionHash = event.transaction.hash;
  buybackParamChange.timestamp = event.block.timestamp;
  buybackParamChange.type = 'changeTokenAddress';
  buybackParamChange.tickLength = buybackParam.tickLength;
  buybackParamChange.tickRate = buybackParam.tickRate;
  buybackParamChange.tokenAddress = buybackParam.tokenAddress;
  buybackParamChange.save();
}
