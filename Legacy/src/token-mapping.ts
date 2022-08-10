import { Claim as AirdropClaimEvent } from '../generated/OngoingAirdrop/OngoingAirdrop';
import {
  Staked as StakedEvent,
  UnstakeCooldown as StartUnstakeEvent,
  Unstaked as UnstakedEvent,
  CancelUnstake as CancelUnstakeEvent,
  RewardsClaimed as StakingRewardsClaimEvent,
} from '../generated/StakingThales/StakingThales';
import { AddedToEscrow as AddedToEscrowEvent, Vested as VestedEvent } from '../generated/EscrowThales/EscrowThales';
import { TokenTransaction, Staker } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleRetroAirdropClaimEvent(event: AirdropClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.claimer;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'claimRetroAirdrop';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleStakingRewardsClaimEvent(event: StakingRewardsClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.unclaimedReward;
  tokenTransaction.type = 'claimStakingRewards';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleStakedEvent(event: StakedEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.user;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'stake';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.user.toHex());
  if (staker === null) {
    staker = new Staker(event.params.user.toHex());
    staker.account = event.params.user;
    staker.stakedAmount = event.params.amount;
    staker.escrowedAmount = BigInt.fromI32(0);
    staker.totalStakedAmount = event.params.amount;
    staker.unstakingAmount = BigInt.fromI32(0);
  } else {
    staker.stakedAmount = staker.stakedAmount.plus(event.params.amount);
    staker.totalStakedAmount = staker.stakedAmount.plus(staker.escrowedAmount);
  }
  staker.timestamp = event.block.timestamp;
  staker.save();
}

export function handleStartUnstakeEvent(event: StartUnstakeEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'startUnstake';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.account.toHex());
  if (staker !== null) {
    staker.stakedAmount = staker.stakedAmount.minus(event.params.amount);
    staker.totalStakedAmount = staker.stakedAmount.equals(BigInt.fromI32(0))
      ? BigInt.fromI32(0)
      : staker.stakedAmount.plus(staker.escrowedAmount);
    staker.unstakingAmount = event.params.amount;
    staker.timestamp = event.block.timestamp;
    staker.save();
  }
}

export function handleUnstakedEvent(event: UnstakedEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.unstakeAmount;
  tokenTransaction.type = 'unstake';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.account.toHex());
  if (staker !== null) {
    staker.unstakingAmount = BigInt.fromI32(0);
    staker.timestamp = event.block.timestamp;
    staker.save();
  }
}

export function handleAddedToEscrowEvent(event: AddedToEscrowEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.acount;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'addToEscrow';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.acount.toHex());
  if (staker === null) {
    staker = new Staker(event.params.acount.toHex());
    staker.account = event.params.acount;
    staker.stakedAmount = BigInt.fromI32(0);
    staker.escrowedAmount = event.params.amount;
    staker.totalStakedAmount = BigInt.fromI32(0);
    staker.unstakingAmount = BigInt.fromI32(0);
  } else {
    staker.escrowedAmount = staker.escrowedAmount.plus(event.params.amount);
    staker.totalStakedAmount = staker.stakedAmount.equals(BigInt.fromI32(0))
      ? BigInt.fromI32(0)
      : staker.stakedAmount.plus(staker.escrowedAmount);
  }
  staker.timestamp = event.block.timestamp;
  staker.save();
}

export function handleVestedEvent(event: VestedEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'vest';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.account.toHex());
  if (staker !== null) {
    staker.escrowedAmount = staker.escrowedAmount.minus(event.params.amount);
    staker.totalStakedAmount = staker.stakedAmount.equals(BigInt.fromI32(0))
      ? BigInt.fromI32(0)
      : staker.stakedAmount.plus(staker.escrowedAmount);
    staker.timestamp = event.block.timestamp;
    staker.save();
  }
}

export function handleCancelUnstakeEvent(event: CancelUnstakeEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.type = 'cancelUnstake';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.account.toHex());
  if (staker !== null) {
    staker.stakedAmount = staker.stakedAmount.plus(staker.unstakingAmount);
    staker.totalStakedAmount = staker.stakedAmount.plus(staker.escrowedAmount);
    staker.unstakingAmount = BigInt.fromI32(0);
    staker.timestamp = event.block.timestamp;
    staker.save();
  }
}
