import { Claim as RetroRewardsClaimEvent } from '../generated/VestingEscrow/VestingEscrow';
import { Claim as StakingRewardsClaimEvent, NewRoot as NewRootEvent } from '../generated/OngoingAirdrop/OngoingAirdrop';
import { TokenTransaction, OngoingAirdropNewRoot } from '../generated/schema';

export function handleRetroUnlockedClaimEvent(event: RetroRewardsClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params._address;
  tokenTransaction.amount = event.params._amount;
  tokenTransaction.type = 'claimRetroUnlocked';
  tokenTransaction.save();
}

export function handleStakingRewardsClaimEvent(event: StakingRewardsClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.claimer;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'claimStakingRewards';
  tokenTransaction.save();
}

export function handleNewRootEvent(event: NewRootEvent): void {
  let tokenTransaction = new OngoingAirdropNewRoot(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString(),
  );
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.root = event.params.root;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.period = event.params.period;
  tokenTransaction.save();
}
