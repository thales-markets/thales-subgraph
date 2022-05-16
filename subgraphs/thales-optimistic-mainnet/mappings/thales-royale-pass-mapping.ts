import { Transfer as TransferEvent } from '../../../generated/ThalesRoyalePass/ThalesRoyalePass';
import { ThalesRoyalePass } from '../../../generated/schema';

export function handleTransfer(event: TransferEvent): void {
  let thalesRoyalePass = ThalesRoyalePass.load(event.params.tokenId.toHex());
  if (thalesRoyalePass === null) {
    thalesRoyalePass = new ThalesRoyalePass(event.params.tokenId.toHex());
  }
  thalesRoyalePass.address = event.params.to;
  thalesRoyalePass.save();
}
