/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import { TradeExecuted, RoundClosed } from '../generated/SportVault/SportVault';
import { SportMarket, VaultPnl, VaultTransaction } from '../generated/schema';

export function handleVaultTrade(event: TradeExecuted): void {
  let transaction = new VaultTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  let market = SportMarket.load(event.params.market.toHex());
  if (market !== null) {
    transaction.hash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp;
    transaction.blockNumber = event.block.number;
    transaction.amount = event.params.amount;
    transaction.position = BigInt.fromI32(event.params.position);
    transaction.market = event.params.market;
    transaction.paid = event.params.quote;
    transaction.wholeMarket = market.id;
    transaction.save();
  }
}

export function handleRoundClosed(event: RoundClosed): void {
  let vaultPnl = new VaultPnl(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  vaultPnl.timestamp = event.block.timestamp;
  vaultPnl.round = event.params.round;
  vaultPnl.pnl = event.params.roundPnL;
  vaultPnl.save();
}
