import { SafeBoxTransaction } from '../generated/schema';
import { Transfer } from '../generated/sUSDContract/ProxyERC20';

const SafeBoxContractAddress = '0xE853207c30F3c32Eda9aEfFDdc67357d5332978C'.toLowerCase();
function getSafeBoxTransactionType(from: string): string {
  if (from == '0x170a5714112daEfF20E798B6e92e25B86Ea603C1'.toLowerCase()) return 'overtime';
  if (from == '0x2d356b114cbCA8DEFf2d8783EAc2a5A5324fE1dF'.toLowerCase()) return 'rangedAmm';
  if (from == '0x5ae7454827D83526261F3871C1029792644Ef1B1'.toLowerCase()) return 'positionalAmm';
  if (from == '0x160Ca569999601bca06109D42d561D85D6Bb4b57'.toLowerCase()) return 'exotic';
  return 'unknown';
}

export function handleSafeBoxTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  if (to !== null && to.toHexString().toLowerCase() == SafeBoxContractAddress) {
    const safeBoxTransaction = new SafeBoxTransaction(event.transaction.hash.toHexString());
    safeBoxTransaction.timestamp = event.block.timestamp;

    const safeBoxTransactionType = getSafeBoxTransactionType(from.toHexString().toLowerCase());

    safeBoxTransaction.type = safeBoxTransactionType;
    safeBoxTransaction.amount = event.params.value;
    safeBoxTransaction.save();
  }
}
