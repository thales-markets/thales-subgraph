import { BigInt, Address } from '@graphprotocol/graph-ts';
import { Transfer as TransferEvent } from '../generated/sUSD/sUSD';
import { ParlayPnl } from '../generated/schema';

export function handleTransfer(event: TransferEvent): void {
  if (
    event.params.to.equals(Address.fromString('0x82b3634c0518507d5d817be6dab6233ebe4d68d9')) &&
    event.params.value.ge(BigInt.fromString('5000000000000000000000'))
  ) {
    let sUSD = new ParlayPnl(
      event.transaction.hash.toHex() + '-' + event.params.from.toHex() + '-' + event.logIndex.toString(),
    );
    sUSD.hash = event.transaction.hash;
    sUSD.account = event.params.from;
    sUSD.amount = event.params.value;
    sUSD.save();
  }
}
