import { LimitOrderFilled } from '../generated/ExchangeProxy/ExchangeProxy';
import { Trade } from '../generated/schema';

export function handleLimitOrderFilledEvent(event: LimitOrderFilled): void {
  let nativeFill = new Trade(
    event.transaction.hash.toHexString() + '-' + event.params.orderHash.toHex() + '-' + event.logIndex.toString(),
  );
  nativeFill.transactionHash = event.transaction.hash;
  nativeFill.timestamp = event.block.timestamp;
  nativeFill.orderHash = event.params.orderHash;
  nativeFill.maker = event.params.maker;
  // We need to take taker from transaction, because taker from params is filled with exchange address in case of market buy/sell
  //nativeFill.taker = event.params.taker;
  nativeFill.taker = event.transaction.from;
  nativeFill.makerToken = event.params.makerToken;
  nativeFill.takerToken = event.params.takerToken;
  nativeFill.makerAmount = event.params.makerTokenFilledAmount;
  nativeFill.takerAmount = event.params.takerTokenFilledAmount;
  nativeFill.save();
}
