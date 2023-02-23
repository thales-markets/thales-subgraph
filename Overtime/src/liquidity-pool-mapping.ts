/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import {
  RoundClosed,
  PoolStarted,
  Deposited,
  WithdrawalRequested,
  Claimed,
} from '../generated/LiquidityPool/LiquidityPool';
import { LiquidityPool, LiquidityPoolPnl, LiquidityPoolUserTransaction } from '../generated/schema';

export function handlePoolStarted(event: PoolStarted): void {
  let liquidityPool = new LiquidityPool(event.address.toHex());
  liquidityPool.address = event.address;
  liquidityPool.round = BigInt.fromI32(1);
  liquidityPool.save();
}

export function handleRoundClosed(event: RoundClosed): void {
  let liquidityPoolPnl = new LiquidityPoolPnl(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  liquidityPoolPnl.liquidityPool = event.address;
  liquidityPoolPnl.timestamp = event.block.timestamp;
  liquidityPoolPnl.round = event.params.round;
  liquidityPoolPnl.pnl = event.params.roundPnL;

  let liquidityPool = LiquidityPool.load(event.address.toHex());
  if (liquidityPool !== null) {
    liquidityPool.round = event.params.round.plus(BigInt.fromI32(1));
    liquidityPool.save();
  }

  liquidityPoolPnl.save();
}

export function handleDeposited(event: Deposited): void {
  let transaction = new LiquidityPoolUserTransaction(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString(),
  );

  transaction.liquidityPool = event.address;
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.account = event.params.user;
  transaction.amount = event.params.amount;
  transaction.type = 'deposit';

  let liquidityPool = LiquidityPool.load(event.address.toHex());
  if (liquidityPool !== null) {
    transaction.round = liquidityPool.round;
  } else {
    transaction.round = BigInt.fromI32(0);
  }

  transaction.save();
}

export function handleWithdrawalRequested(event: WithdrawalRequested): void {
  let transaction = new LiquidityPoolUserTransaction(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString(),
  );

  transaction.liquidityPool = event.address;
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.account = event.params.user;
  transaction.type = 'withdrawalRequest';

  let liquidityPool = LiquidityPool.load(event.address.toHex());
  if (liquidityPool !== null) {
    transaction.round = liquidityPool.round;
  } else {
    transaction.round = BigInt.fromI32(0);
  }

  transaction.save();
}

export function handleClaimed(event: Claimed): void {
  let transaction = new LiquidityPoolUserTransaction(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString(),
  );

  transaction.liquidityPool = event.address;
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.account = event.params.user;
  transaction.amount = event.params.amount;
  transaction.type = 'claim';

  let liquidityPool = LiquidityPool.load(event.address.toHex());
  if (liquidityPool !== null) {
    transaction.round = liquidityPool.round;
  } else {
    transaction.round = BigInt.fromI32(0);
  }

  transaction.save();
}
