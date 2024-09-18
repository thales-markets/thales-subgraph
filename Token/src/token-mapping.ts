import { Address, BigInt, store } from '@graphprotocol/graph-ts';
import { Claim as AirdropClaimEvent } from '../generated/Airdrop/Airdrop';
import { AddedToEscrow as AddedToEscrowEvent, Vested as VestedEvent } from '../generated/EscrowThales/EscrowThales';
import {
  AccountMerged as AccountMergedEvent,
  CanClaimOnBehalfChanged as CanClaimOnBehalfChangedEvent,
  CancelUnstake as CancelUnstakeEvent,
  ClosedPeriod,
  DelegatedVolume as DelegatedVolumeEvent,
  FeeRewardsClaimed,
  ReceivedStakingRewardsUpdate,
  Staked as StakedEvent,
  StakedThalesDecreased,
  StakedThalesIncreased,
  StakingPeriodStarted,
  RewardsClaimed as StakingRewardsClaimEvent,
  RewardsClaimed1 as StakingRewardsClaimEventWithBonus,
  UnstakeCooldown as StartUnstakeEvent,
  Unstaked as UnstakedEvent,
} from '../generated/StakingThales/StakingThales';
import { RewardsClaimed as OldStakingRewardsClaimEvent } from '../generated/StakingThales_OldRewardsClaimed/StakingThales_OldRewardsClaimed';
import {
  CanClaimOnBehalfItem,
  LPReward,
  LPRewardsDuration,
  Staker,
  Staking,
  StakingClaim,
  TokenTransaction,
} from '../generated/schema';

import {
  BothRewardsAdded as BothRewardsAddedEvent,
  Staked as LPStakedEvent,
  RewardPaid as RewardPaidEvent,
  RewardsDurationUpdated as RewardsDurationUpdatedEvent,
  SecondRewardTokenPaid as SecondRewardTokenPaidEvent,
  Withdrawn as WithdrawnEvent,
} from '../generated/LPStakingRewards/LPStakingRewards';
import { Claim as MigratedRewardsClaimEvent } from '../generated/OngoingAirdrop/OngoingAirdrop';
import { StakedOnBehalf as StakedOnBehalfEvent } from '../generated/StakingThales/StakingThales';

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

export function handleLpStakedEvent(event: LPStakedEvent): void {
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

export function handleCanClaimOnBehalfChangedEvent(event: CanClaimOnBehalfChangedEvent): void {
  let canClaimOnBehalfItem = CanClaimOnBehalfItem.load(
    event.params.sender.toHexString() + '-' + event.params.account.toHexString(),
  );
  if (canClaimOnBehalfItem === null) {
    canClaimOnBehalfItem = new CanClaimOnBehalfItem(
      event.params.sender.toHexString() + '-' + event.params.account.toHexString(),
    );
  }
  canClaimOnBehalfItem.transactionHash = event.transaction.hash;
  canClaimOnBehalfItem.timestamp = event.block.timestamp;
  canClaimOnBehalfItem.sender = event.params.sender;
  canClaimOnBehalfItem.account = event.params.account;
  canClaimOnBehalfItem.canClaimOnBehalf = event.params.canClaimOnBehalf;
  canClaimOnBehalfItem.save();
}

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
  tokenTransaction.protocolRewards = BigInt.fromI32(0);
  tokenTransaction.feeRewards = BigInt.fromI32(0);
  tokenTransaction.save();

  let staking = Staking.load(event.address.toHex());
  if (staking !== null) {
    let stakingClaim = StakingClaim.load(event.address.toHex() + '-' + staking.period.toString());
    if (stakingClaim !== null) {
      stakingClaim.baseThalesClaimed = stakingClaim.baseThalesClaimed.plus(event.params.baseRewards);
      stakingClaim.extraThalesClaimed = stakingClaim.extraThalesClaimed.plus(
        event.params.unclaimedReward.minus(event.params.baseRewards),
      );
      stakingClaim.save();
    }
  }
}

export function handleStakingRewardsClaimEventWithBonus(event: StakingRewardsClaimEventWithBonus): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.unclaimedReward;
  tokenTransaction.type = 'claimStakingRewards';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.protocolRewards = event.params.protocolBonus;
  tokenTransaction.feeRewards = BigInt.fromI32(0);
  tokenTransaction.save();
}

export function handleFeeRewardsClaimEvent(event: FeeRewardsClaimed): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.feeRewards = event.params.unclaimedFees;
  tokenTransaction.type = 'claimStakingRewards';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.amount = BigInt.fromI32(0);
  tokenTransaction.protocolRewards = BigInt.fromI32(0);
  tokenTransaction.save();

  let staking = Staking.load(event.address.toHex());
  if (staking !== null) {
    let stakingClaim = StakingClaim.load(event.address.toHex() + '-' + staking.period.toString());
    if (stakingClaim !== null) {
      stakingClaim.feesClaimed = stakingClaim.feesClaimed.plus(event.params.unclaimedFees);
      stakingClaim.save();
    }
  }
}

export function handleOldStakingRewardsClaimEvent(event: OldStakingRewardsClaimEvent): void {
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

export function handleAccountMergedEvent(event: AccountMergedEvent): void {
  let tokenTransactionSrc = new TokenTransaction(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString() + '-' + event.params.srcAccount.toString(),
  );
  tokenTransactionSrc.transactionHash = event.transaction.hash;
  tokenTransactionSrc.timestamp = event.block.timestamp;
  tokenTransactionSrc.account = event.params.srcAccount;
  tokenTransactionSrc.type = 'mergeAccount';
  tokenTransactionSrc.blockNumber = event.block.number;
  tokenTransactionSrc.save();

  let tokenTransactionDest = new TokenTransaction(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString() + '-' + event.params.destAccount.toString(),
  );
  tokenTransactionDest.transactionHash = event.transaction.hash;
  tokenTransactionDest.timestamp = event.block.timestamp;
  tokenTransactionDest.account = event.params.destAccount;
  tokenTransactionDest.type = 'mergeAccount';
  tokenTransactionDest.blockNumber = event.block.number;
  tokenTransactionDest.save();

  let stakerSrc = Staker.load(event.params.srcAccount.toHex());
  let stakerDest = Staker.load(event.params.destAccount.toHex());
  if (stakerSrc !== null) {
    if (stakerDest !== null) {
      stakerDest.stakedAmount = stakerDest.stakedAmount.plus(stakerSrc.stakedAmount);
      stakerDest.escrowedAmount = stakerDest.escrowedAmount.plus(stakerSrc.escrowedAmount);
      stakerDest.totalStakedAmount = stakerDest.totalStakedAmount.plus(stakerSrc.totalStakedAmount);
      stakerDest.unstakingAmount = stakerDest.unstakingAmount.plus(stakerSrc.unstakingAmount);
    } else {
      stakerDest = new Staker(event.params.destAccount.toHex());
      stakerDest.account = event.params.destAccount;
      stakerDest.stakedAmount = stakerSrc.stakedAmount;
      stakerDest.escrowedAmount = stakerSrc.escrowedAmount;
      stakerDest.totalStakedAmount = stakerSrc.totalStakedAmount;
      stakerDest.unstakingAmount = stakerSrc.unstakingAmount;
    }
    stakerDest.timestamp = event.block.timestamp;
    stakerDest.save();
    store.remove('Staker', stakerSrc.id);
  }
}

export function handleDelegatedVolume(event: DelegatedVolumeEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.transaction.from;
  tokenTransaction.destAccount = event.params.destAccount;
  tokenTransaction.type = event.params.destAccount.equals(
    Address.fromString('0x0000000000000000000000000000000000000000'),
  )
    ? 'removeDelegation'
    : 'delegateVolume';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleBothRewardsAddedEvent(event: BothRewardsAddedEvent): void {
  let lpReward = new LPReward(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  lpReward.transactionHash = event.transaction.hash;
  lpReward.timestamp = event.block.timestamp;
  lpReward.reward = event.params.reward;
  lpReward.secondReward = event.params.secondReward;
  lpReward.save();
}

export function handleRewardsDurationUpdatedEvent(event: RewardsDurationUpdatedEvent): void {
  let lpReward = new LPRewardsDuration(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  lpReward.transactionHash = event.transaction.hash;
  lpReward.timestamp = event.block.timestamp;
  lpReward.newDuration = event.params.newDuration;
  lpReward.save();
}

export function handleStakingPeriodStartedEvent(event: StakingPeriodStarted): void {
  let staking = new Staking(event.address.toHex());
  staking.period = BigInt.fromI32(0);
  staking.save();

  let stakingClaim = new StakingClaim(event.address.toHex() + '-0');
  stakingClaim.period = BigInt.fromI32(0);
  stakingClaim.baseThalesClaimed = BigInt.fromI32(0);
  stakingClaim.extraThalesClaimed = BigInt.fromI32(0);
  stakingClaim.feesClaimed = BigInt.fromI32(0);
  stakingClaim.baseRewards = BigInt.fromI32(0);
  stakingClaim.extraRewards = BigInt.fromI32(0);
  stakingClaim.feesRewards = BigInt.fromI32(0);
  stakingClaim.save();
}

export function handleClosedPeriodEvent(event: ClosedPeriod): void {
  let staking = Staking.load(event.address.toHex());
  if (staking !== null) {
    staking.period = event.params.PeriodOfStaking;
    staking.save();
  }

  let stakingClaim = new StakingClaim(event.address.toHex() + '-' + event.params.PeriodOfStaking.toString());
  stakingClaim.period = event.params.PeriodOfStaking;
  stakingClaim.baseThalesClaimed = BigInt.fromI32(0);
  stakingClaim.extraThalesClaimed = BigInt.fromI32(0);
  stakingClaim.feesClaimed = BigInt.fromI32(0);
  stakingClaim.baseRewards = BigInt.fromI32(0);
  stakingClaim.extraRewards = BigInt.fromI32(0);
  stakingClaim.feesRewards = BigInt.fromI32(0);
  stakingClaim.save();
}

export function handleReceivedStakingRewardsUpdateEvent(event: ReceivedStakingRewardsUpdate): void {
  let staking = Staking.load(event.address.toHex());
  if (staking !== null) {
    let stakingClaim = StakingClaim.load(event.address.toHex() + '-' + staking.period.toString());
    if (stakingClaim !== null) {
      stakingClaim.baseRewards = event.params._currentPeriodRewards;
      stakingClaim.extraRewards = event.params._extraRewards;
      stakingClaim.feesRewards = event.params._revShare;
      stakingClaim.save();
    }
  }
}

export function handleStakedThalesDecreasedEvent(event: StakedThalesDecreased): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'overtimeTrade';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.account.toHex());
  if (staker !== null) {
    staker.stakedAmount = staker.stakedAmount.minus(event.params.amount);
    staker.totalStakedAmount = staker.stakedAmount.equals(BigInt.fromI32(0))
      ? BigInt.fromI32(0)
      : staker.stakedAmount.plus(staker.escrowedAmount);
    staker.timestamp = event.block.timestamp;
    staker.save();
  }
}

export function handleStakedThalesIncreasedEvent(event: StakedThalesIncreased): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.account;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'overtimeClaim';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();

  let staker = Staker.load(event.params.account.toHex());
  if (staker === null) {
    staker = new Staker(event.params.account.toHex());
    staker.account = event.params.account;
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
