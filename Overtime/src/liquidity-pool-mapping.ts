/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import {
  RoundClosed,
  // PoolStarted,
  Deposited,
  WithdrawalRequested,
  Claimed,
} from '../generated/LiquidityPool/LiquidityPool';
import { LiquidityPool, LiquidityPoolPnl, LiquidityPoolUserTransaction } from '../generated/schema';

// export function handleLiquidityPoolStarted(event: PoolStarted): void {
//   let vault = new LiquidityPool(event.address.toHex());
//   vault.address = event.address;
//   vault.round = BigInt.fromI32(1);
//   vault.save();
// }

export function handleRoundClosed(event: RoundClosed): void {
  let vaultPnl = new LiquidityPoolPnl(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  vaultPnl.liquidityPool = event.address;
  vaultPnl.timestamp = event.block.timestamp;
  vaultPnl.round = event.params.round;
  vaultPnl.pnl = event.params.roundPnL;

  let vault = LiquidityPool.load(event.address.toHex());
  if (vault !== null) {
    vault.round = event.params.round.plus(BigInt.fromI32(1));
    vault.save();
  }

  vaultPnl.save();
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
  transaction.round = event.params.round;
  transaction.type = 'deposit';

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

  let vault = LiquidityPool.load(event.address.toHex());
  if (vault !== null) {
    transaction.round = vault.round;
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

  let vault = LiquidityPool.load(event.address.toHex());
  if (vault !== null) {
    transaction.round = vault.round;
  } else {
    transaction.round = BigInt.fromI32(0);
  }

  transaction.save();
}
