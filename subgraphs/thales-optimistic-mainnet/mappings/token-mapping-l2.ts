import { Staker, TokenTransaction } from '../../../generated/schema';
import {
  Staked as StakedEvent,
  Withdrawn as WithdrawnEvent,
  RewardPaid as RewardPaidEvent,
  SecondRewardTokenPaid as SecondRewardTokenPaidEvent,
} from '../../../generated/LPStakingRewards/LPStakingRewards';
import { StakedOnBehalf as StakedOnBehalfEvent } from '../../../generated/StakingThales/StakingThales';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleStakedEvent(event: StakedEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.user;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'lpStake';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleWithdrawnEvent(event: WithdrawnEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.user;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'lpUnstake';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleRewardPaidEvent(event: RewardPaidEvent): void {
  let tokenTransaction = new TokenTransaction(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString() + '-1',
  );
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.user;
  tokenTransaction.amount = event.params.reward;
  tokenTransaction.type = 'lpClaimStakingRewards';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleSecondRewardTokenPaidEvent(event: SecondRewardTokenPaidEvent): void {
  let tokenTransaction = new TokenTransaction(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString() + '-2',
  );
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.user;
  tokenTransaction.amount = event.params.reward;
  tokenTransaction.type = 'lpClaimStakingRewardsSecond';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleStakedOnBehalfEvent(event: StakedOnBehalfEvent): void {
  let staker = Staker.load(event.params.staker.toHex());
  if (staker === null) {
    staker = new Staker(event.params.staker.toHex());
    staker.account = event.params.staker;
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
