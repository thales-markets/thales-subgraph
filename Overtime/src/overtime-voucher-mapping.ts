import { store } from '@graphprotocol/graph-ts';
import { BoughtFromAmmWithVoucher, Transfer as TransferEvent } from '../generated/OvertimeVoucher/OvertimeVoucher';
import { BuyTransaction, MarketTransaction, OvertimeVoucher, PositionBalance } from '../generated/schema';

export function handleTransfer(event: TransferEvent): void {
  let overtimeVoucher = OvertimeVoucher.load(event.params.tokenId.toString());
  if (overtimeVoucher === null) {
    overtimeVoucher = new OvertimeVoucher(event.params.tokenId.toString());
  }
  overtimeVoucher.address = event.params.to;
  overtimeVoucher.save();
}

export function handleBoughtFromAmmWithVoucherEvent(event: BoughtFromAmmWithVoucher): void {
  let buyTransaction = BuyTransaction.load(event.transaction.hash.toHexString());

  if (buyTransaction !== null) {
    let marketTransaction = MarketTransaction.load(buyTransaction.marketTransactionId);
    if (marketTransaction !== null) {
      marketTransaction.account = event.params.buyer;
      marketTransaction.save();
    }
    let positionBalance = PositionBalance.load(buyTransaction.positionBalanceId);
    if (positionBalance !== null) {
      let userBalanceFrom = new PositionBalance(positionBalance.position + ' - ' + event.params.buyer.toHex());
      userBalanceFrom.firstTxHash = event.transaction.hash;
      userBalanceFrom.account = event.params.buyer;
      userBalanceFrom.amount = positionBalance.amount;
      userBalanceFrom.position = positionBalance.position;
      userBalanceFrom.save();
      store.remove('PositionBalance', buyTransaction.positionBalanceId);
    }
  }
}
