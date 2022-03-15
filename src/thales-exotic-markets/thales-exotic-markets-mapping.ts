import { BigInt } from '@graphprotocol/graph-ts';
import { MarketCreated as MarketCreatedEvent } from '../../generated/ExoticPositionalMarketManager/ExoticPositionalMarketManager';
import {
  NewDispute as NewDisputeEvent,
  VotedAddedForDispute as VotedAddedForDisputeEvent,
} from '../../generated/ThalesOracleCouncil/ThalesOracleCouncil';
import { Dispute, DisputeVote, Market } from '../../generated/schema';

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
  market.isTicketType = event.params.fixedTicketPrice.gt(BigInt.fromI32(0));
  market.isOpen = true;
  market.numberOfDisputes = BigInt.fromI32(0);
  market.numberOfOpenDisputes = BigInt.fromI32(0);
  market.save();
}

export function handleNewDisputeEvent(event: NewDisputeEvent): void {
  let market = Market.load(event.params.market.toHex());
  market.numberOfDisputes = market.numberOfDisputes.plus(BigInt.fromI32(1));
  market.numberOfOpenDisputes = market.numberOfOpenDisputes.plus(BigInt.fromI32(1));
  market.save();
  let disputeNumber = market.numberOfOpenDisputes;
  let dispute = new Dispute(event.params.market.toHex() + '-' + market.numberOfOpenDisputes.toString());
  dispute.timestamp = event.block.timestamp;
  dispute.creationDate = event.block.timestamp;
  dispute.disputeNumber = disputeNumber;
  dispute.market = event.params.market;
  dispute.disputer = event.params.disputorAccount;
  dispute.reasonForDispute = event.params.disputeString;
  dispute.isInPositioningPhase = event.params.disputeInPositioningPhase;
  dispute.save();
}

export function handleVotedAddedForDisputeEvent(event: VotedAddedForDisputeEvent): void {
  // let market = Market.load(event.params.market.toHex());
  // market.numberOfDisputes = market.numberOfDisputes.plus(BigInt.fromI32(1));
  // market.numberOfOpenDisputes = market.numberOfOpenDisputes.plus(BigInt.fromI32(1));
  // market.save();
  let voteId =
    event.params.market.toHex() + '-' + event.params.disputeIndex.toString() + '-' + event.transaction.from.toHex();
  let disputeVote = DisputeVote.load(voteId);
  if (disputeVote === null) {
    disputeVote = new DisputeVote(voteId);
    disputeVote.market = event.params.market;
    disputeVote.voter = event.params.voter;
    disputeVote.dispute = event.params.disputeIndex;
  }
  disputeVote.timestamp = event.block.timestamp;
  disputeVote.vote = event.params.disputeCodeVote;
  disputeVote.save();
}
