import { Transfer as TransferEvent } from '../generated/ThalesRoyalePassport/ThalesRoyalePassport';
import { ThalesRoyalePassportPlayer } from '../generated/schema';

export function handleTransfer(event: TransferEvent): void {
    let thalesRoyalePassportPlayer = ThalesRoyalePassportPlayer.load(event.params.tokenId.toHex());
    if (thalesRoyalePassportPlayer === null) {
        thalesRoyalePassportPlayer = new ThalesRoyalePassportPlayer(event.params.tokenId.toHex());
    }
    thalesRoyalePassportPlayer.owner = event.params.to;
    thalesRoyalePassportPlayer.save();
}
