import { Referrer, ReferralTransfer, ReferredTrader } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';
import { ReferrerPaid } from '../generated/SpeedMarkets/SpeedMarketsAMM';

export function handleReferrerPaid(event: ReferrerPaid): void {
  let referralTx = new ReferralTransfer(event.transaction.hash.toHexString());
  referralTx.amount = event.params.amount;
  referralTx.refferer = event.params.refferer;
  referralTx.trader = event.params.trader;
  referralTx.timestamp = event.block.timestamp;
  referralTx.volume = event.params.volume;

  referralTx.save();

  let referrer = Referrer.load(event.params.refferer.toHex());

  if (referrer == null) {
    referrer = new Referrer(event.params.refferer.toHex());
    referrer.totalVolume = event.params.volume;
    referrer.totalEarned = event.params.amount;
    referrer.trades = BigInt.fromI32(1);
    referrer.timestamp = event.block.timestamp;
  } else {
    referrer.totalVolume = referrer.totalVolume.plus(event.params.volume);
    referrer.totalEarned = referrer.totalEarned.plus(event.params.amount);
    referrer.trades = referrer.trades.plus(BigInt.fromI32(1));
  }

  referrer.save();

  let referredTrader = ReferredTrader.load(event.params.trader.toHex());

  if (referredTrader == null) {
    referredTrader = new ReferredTrader(event.params.trader.toHex());
    referredTrader.trades = BigInt.fromI32(1);
    referredTrader.totalVolume = event.params.volume;
    referredTrader.totalEarned = event.params.amount;
    referredTrader.refferer = event.params.refferer.toHex();
    referredTrader.timestamp = event.block.timestamp;
  } else {
    referredTrader.trades = referredTrader.trades.plus(BigInt.fromI32(1));
    referredTrader.totalVolume = referredTrader.totalVolume.plus(event.params.volume);
    referredTrader.totalEarned = referredTrader.totalEarned.plus(event.params.amount);
  }

  referredTrader.save();
}
