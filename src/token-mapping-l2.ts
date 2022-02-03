import { Claim as MigratedRewardsClaimEvent } from '../generated/OngoingAirdrop/OngoingAirdrop';
import { TokenTransaction } from '../generated/schema';
import {
  Staked as StakedEvent,
  Withdrawn as WithdrawnEvent,
  RewardPaid as RewardPaidEvent,
} from '../generated/LPStakingRewards/LPStakingRewards';

export function handleMigratedRewardsClaimEvent(event: MigratedRewardsClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.claimer;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'claimMigratedRewards';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

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
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.user;
  tokenTransaction.amount = event.params.reward;
  tokenTransaction.type = 'lpClaimStakingRewards';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}
