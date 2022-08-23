import { Transfer as TransferEvent } from '../generated/OvertimeVoucher/OvertimeVoucher';
import { OvertimeVoucher } from '../generated/schema';

export function handleTransfer(event: TransferEvent): void {
  let overtimeVoucher = OvertimeVoucher.load(event.params.tokenId.toHex());
  if (overtimeVoucher === null) {
    overtimeVoucher = new OvertimeVoucher(event.params.tokenId.toHex());
  }
  overtimeVoucher.address = event.params.to;
  overtimeVoucher.save();
}
