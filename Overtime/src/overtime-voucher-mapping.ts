import { Transfer as TransferEvent } from '../generated/OvertimeVoucher/OvertimeVoucher';
import { OvertimeVoucher } from '../generated/schema';

export function handleTransfer(event: TransferEvent): void {
  let overtimeVoucher = OvertimeVoucher.load(event.params.tokenId.toString());
  if (overtimeVoucher === null) {
    overtimeVoucher = new OvertimeVoucher(event.params.tokenId.toString());
  }
  overtimeVoucher.address = event.params.to;
  overtimeVoucher.save();
}
