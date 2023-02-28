/* eslint-disable no-empty */
import { BigInt } from '@graphprotocol/graph-ts';
import {
  TradeExecuted,
  RoundClosed,
  VaultStarted,
  Deposited,
  WithdrawalRequested,
  Claimed,
} from '../generated/DiscountVault/SportVault';
import {  Vault, VaultPnl, ParlayVaultTransaction, VaultUserTransaction, ParlayMarket } from '../generated/schema';

export function handleVaultStarted(event: VaultStarted): void {
  let vault = new Vault(event.address.toHex());
  vault.address = event.address;
  vault.round = BigInt.fromI32(1);
  vault.save();
}

export function handleVaultTrade(event: TradeExecuted): void {
  let transaction = new ParlayVaultTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  let market = ParlayMarket.load(event.params.market.toHex());
  if (market !== null) {
    transaction.vault = event.address;
    transaction.hash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp;
    transaction.blockNumber = event.block.number;
    transaction.amount = event.params.amount;
    transaction.position = BigInt.fromI32(event.params.position);
    transaction.market = event.params.market;
    transaction.paid = event.params.quote;
    transaction.wholeMarket = market.id;

    let vault = Vault.load(event.address.toHex());
    if (vault !== null) {
      transaction.round = vault.round;
    }

    transaction.save();
  }
}

export function handleRoundClosed(event: RoundClosed): void {
  let vaultPnl = new VaultPnl(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  vaultPnl.vault = event.address;
  vaultPnl.timestamp = event.block.timestamp;
  vaultPnl.round = event.params.round;
  vaultPnl.pnl = event.params.roundPnL;

  let vault = Vault.load(event.address.toHex());
  if (vault !== null) {
    vault.round = event.params.round.plus(BigInt.fromI32(1));
    vault.save();
  }

  vaultPnl.save();
}

export function handleDeposited(event: Deposited): void {
  let transaction = new VaultUserTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  transaction.vault = event.address;
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.account = event.params.user;
  transaction.amount = event.params.amount;
  transaction.type = 'deposit';

  let vault = Vault.load(event.address.toHex());
  if (vault !== null) {
    transaction.round = vault.round;
  } else {
    transaction.round = BigInt.fromI32(0);
  }

  transaction.save();
}

export function handleWithdrawalRequested(event: WithdrawalRequested): void {
  let transaction = new VaultUserTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  transaction.vault = event.address;
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.account = event.params.user;
  transaction.type = 'withdrawalRequest';

  let vault = Vault.load(event.address.toHex());
  if (vault !== null) {
    transaction.round = vault.round;
  } else {
    transaction.round = BigInt.fromI32(0);
  }

  transaction.save();
}

export function handleClaimed(event: Claimed): void {
  let transaction = new VaultUserTransaction(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());

  transaction.vault = event.address;
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.account = event.params.user;
  transaction.amount = event.params.amount;
  transaction.type = 'claim';

  let vault = Vault.load(event.address.toHex());
  if (vault !== null) {
    transaction.round = vault.round;
  } else {
    transaction.round = BigInt.fromI32(0);
  }

  transaction.save();
}
