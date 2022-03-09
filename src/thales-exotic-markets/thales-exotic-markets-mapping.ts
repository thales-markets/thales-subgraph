import { MarketCreated as MarketCreatedEvent } from '../../generated/ExoticPositionalMarketManager/ExoticPositionalMarketManager';
import { Market } from '../../generated/schema';

export function handleMarketCreatedEvent(event: MarketCreatedEvent): void {
  let market = new Market(event.params.marketAddress.toHex());
  market.timestamp = event.block.timestamp;
  market.creator = event.params.marketOwner;
  market.address = event.params.marketAddress;
  market.question = event.params.marketQuestion;
  market.dataSource = event.params.marketSource;
  market.endOfPositioning = event.params.endOfPositioning;
  market.ticketPrice = event.params.fixedTicketPrice;
  market.isWithdrawalAllowed = event.params.withdrawalAllowed;
  market.positions = event.params.positionPhrases;
  market.tags = event.params.tags;
  market.isOpen = true;
  market.save();
}
