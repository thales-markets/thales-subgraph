import { Claim as InvestorsMigratedRewardsClaimEvent } from '../generated/InvestorsMigratedRewards/Airdrop';
import { Claim as InvestorsRetroUnlockClaimEvent } from '../generated/InvestorsRetroUnlock/VestingEscrow';
import { TokenTransaction } from '../generated/schema';

export function handleInvestorsMigratedRewardsClaimEvent(event: InvestorsMigratedRewardsClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.claimer;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'claimMigratedRewards';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}

export function handleInvestorsRetroUnlockClaimEvent(event: InvestorsRetroUnlockClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params._address;
  tokenTransaction.amount = event.params._amount;
  tokenTransaction.type = 'claimRetroUnlocked';
  tokenTransaction.blockNumber = event.block.number;
  tokenTransaction.save();
}
