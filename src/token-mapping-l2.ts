import { Claim as MigratedRewardsClaimEvent } from '../generated/OngoingAirdrop/OngoingAirdrop';
import { TokenTransaction } from '../generated/schema';

export function handleMigratedRewardsClaimEvent(event: MigratedRewardsClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params.claimer;
  tokenTransaction.amount = event.params.amount;
  tokenTransaction.type = 'claimMigratedRewards';
  tokenTransaction.save();
}
