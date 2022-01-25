import { Claim as RetroRewardsClaimEvent } from '../generated/VestingEscrow/VestingEscrow';
import { TokenTransaction } from '../generated/schema';

export function handleRetroUnlockedClaimEvent(event: RetroRewardsClaimEvent): void {
  let tokenTransaction = new TokenTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  tokenTransaction.transactionHash = event.transaction.hash;
  tokenTransaction.timestamp = event.block.timestamp;
  tokenTransaction.account = event.params._address;
  tokenTransaction.amount = event.params._amount;
  tokenTransaction.type = 'claimRetroUnlocked';
  tokenTransaction.save();
}
