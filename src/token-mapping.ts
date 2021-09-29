import { Claim as AirdropClaimEvent } from '../generated/Airdrop/Airdrop';
import { Claim as RetroRewardsClaimEvent } from '../generated/VestingEscrow/VestingEscrow';
import { Claim as StakingRewardsClaimEvent, NewRoot as NewRootEvent } from '../generated/OngoingAirdrop/OngoingAirdrop';
import {
  Staked as StakedEvent,
  UnstakeCooldown as StartUnstakeEvent,
  Unstaked as UnstakedEvent,
  CancelUnstake as CancelUnstakeEvent,
} from '../generated/StakingThales/StakingThales';
import { AddedToEscrow as AddedToEscrowEvent, Vested as VestedEvent } from '../generated/EscrowThales/EscrowThales';
import { TokenTransaction, OngoingAirdropNewRoot } from '../generated/schema';

export function handleRetroAirdropClaimEvent(event: AirdropClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.claimer;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'claimRetroAirdrop';
  tokenTransaction.save();
}

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

export function handleStakedEvent(event: StakedEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.user;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'stake';
  tokenTransaction.save();
}

export function handleStartUnstakeEvent(event: StartUnstakeEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'startUnstake';
  tokenTransaction.save();
}

export function handleUnstakedEvent(event: UnstakedEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.unstakeAmount;
  tokenTransaction.type = 'unstake';
  tokenTransaction.save();
}

export function handleAddedToEscrowEvent(event: AddedToEscrowEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.acount;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'addToEscrow';
  tokenTransaction.save();
}

export function handleVestedEvent(event: VestedEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'vest';
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

export function handleCancelUnstakeEvent(event: CancelUnstakeEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.type = 'cancelUnstake';
  tokenTransaction.save();
}
