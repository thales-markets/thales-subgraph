import { BigInt } from '@graphprotocol/graph-ts';
import {
  MarketCreated as MarketCreatedEvent,
  MarketCanceled as MarketCanceledEvent,
} from '../../generated/ExoticPositionalMarketManager/ExoticPositionalMarketManager';
import {
  NewDispute as NewDisputeEvent,
  VotedAddedForDispute as VotedAddedForDisputeEvent,
  DisputeClosed as DisputeClosedEvent,
  MarketClosedForDisputes as MarketClosedForDisputesEvent,
  MarketReopenedForDisputes as MarketReopenedForDisputesEvent,
} from '../../generated/ThalesOracleCouncil/ThalesOracleCouncil';
import { Dispute, DisputeVote, Market, MarketTransaction, Position } from '../../generated/schema';
import {
  MarketResolved as MarketResolvedEvent,
  MarketReset as MarketResetEvent,
  BackstopTimeoutPeriodChanged as BackstopTimeoutPeriodChangedEvent,
  PauseChanged as PauseChangedEvent,
  MarketDisputed as MarketDisputedEvent,
  NewPositionTaken as NewPositionTakenEvent,
  TicketWithdrawn as TicketWithdrawnEvent,
} from '../../generated/templates/ExoticPositionalMarket/ExoticPositionalMarket';
import { ExoticPositionalMarket as ExoticPositionalMarketContract } from '../../generated/templates';

export function handleMarketCreatedEvent(event: MarketCreatedEvent): void {
  ExoticPositionalMarketContract.create(event.params.marketAddress);

  let market = new Market(event.params.marketAddress.toHex());
  market.timestamp = event.block.timestamp;
  market.creator = event.params.marketOwner;
  market.creationTime = event.block.timestamp;
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
  market.marketClosedForDisputes = false;
  market.isResolved = false;
  market.isCancelled = false;
  market.winningPosition = BigInt.fromI32(0);
  market.backstopTimeout = BigInt.fromI32(0);
  market.isPaused = false;
  market.isDisputed = false;
  market.poolSize = BigInt.fromI32(0);
  market.numberOfParticipants = BigInt.fromI32(0);
  market.noWinners = false;
  market.cancelledByCreator = false;
  market.save();
}

export function handleNewDisputeEvent(event: NewDisputeEvent): void {
  let market = Market.load(event.params.market.toHex());
  if (market !== null) {
    market.numberOfDisputes = market.numberOfDisputes.plus(BigInt.fromI32(1));
    market.numberOfOpenDisputes = market.numberOfOpenDisputes.plus(BigInt.fromI32(1));
    market.save();
    let disputeNumber = market.numberOfDisputes;
    let dispute = new Dispute(event.params.market.toHex() + '-' + disputeNumber.toString());
    dispute.timestamp = event.block.timestamp;
    dispute.creationDate = event.block.timestamp;
    dispute.disputeNumber = disputeNumber;
    dispute.market = event.params.market;
    dispute.disputer = event.params.disputorAccount;
    dispute.reasonForDispute = event.params.disputeString;
    dispute.isInPositioningPhase = event.params.disputeInPositioningPhase;
    dispute.disputeCode = BigInt.fromI32(0);
    dispute.save();
  }
}

export function handleVotedAddedForDisputeEvent(event: VotedAddedForDisputeEvent): void {
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
  disputeVote.position = event.params.winningPosition;
  disputeVote.save();
}

export function handleDisputeClosedEvent(event: DisputeClosedEvent): void {
  let dispute = Dispute.load(event.params.market.toHex() + '-' + event.params.disputeIndex.toString());
  if (dispute !== null) {
    dispute.disputeCode = event.params.decidedOption;
    dispute.save();
  }

  let market = Market.load(event.params.market.toHex());
  if (market !== null) {
    market.numberOfOpenDisputes = market.numberOfOpenDisputes.minus(BigInt.fromI32(1));
    market.save();
  }
}

export function handleMarketClosedForDisputesEvent(event: MarketClosedForDisputesEvent): void {
  let market = Market.load(event.params.market.toHex());
  if (market !== null) {
    market.marketClosedForDisputes = true;
    market.save();
  }
}

export function handleMarketReopenedForDisputesEvent(event: MarketReopenedForDisputesEvent): void {
  let market = Market.load(event.params.market.toHex());
  if (market !== null) {
    market.marketClosedForDisputes = false;
    market.save();
  }
}

export function handleMarketResolvedEvent(event: MarketResolvedEvent): void {
  let market = Market.load(event.address.toHex());
  if (market !== null) {
    market.isResolved = true;
    market.isOpen = false;
    market.isCancelled = event.params.winningPosition.equals(BigInt.fromI32(0));
    market.winningPosition = event.params.winningPosition;
    market.resolver = event.params.resolverAddress;
    market.resolvedTime = event.block.timestamp;
    market.noWinners = event.params.noWinner;
    market.save();
  }
}

export function handleMarketResetEvent(event: MarketResetEvent): void {
  let market = Market.load(event.address.toHex());
  if (market !== null) {
    market.isResolved = false;
    market.isOpen = true;
    market.isCancelled = false;
    market.winningPosition = BigInt.fromI32(0);
    market.noWinners = false;
    market.save();
  }
}

export function handleBackstopTimeoutPeriodChangedEvent(event: BackstopTimeoutPeriodChangedEvent): void {
  let market = Market.load(event.address.toHex());
  if (market !== null) {
    market.backstopTimeout = event.params.timeoutPeriod;
    market.save();
  }
}

export function handlePauseChangedEvent(event: PauseChangedEvent): void {
  let market = Market.load(event.address.toHex());
  if (market !== null) {
    market.isPaused = event.params.isPaused;
    market.save();
  }
}

export function handleMarketDisputedEvent(event: MarketDisputedEvent): void {
  let market = Market.load(event.address.toHex());
  if (market !== null) {
    market.isDisputed = event.params.disputed;
    if (!market.isDisputed) {
      market.disputeClosedTime = event.block.timestamp;
    }
    market.save();
  }
}

export function handleNewPositionTakenEvent(event: NewPositionTakenEvent): void {
  let positionId = event.address.toHex() + '-' + event.params.account.toHex();
  let position = Position.load(positionId);

  if (position === null) {
    position = new Position(positionId);
    position.market = event.address;
    position.account = event.params.account;
    position.position = BigInt.fromI32(0);
  }

  let marketTransaction = new MarketTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  marketTransaction.hash = event.transaction.hash;
  marketTransaction.type = position.position.equals(BigInt.fromI32(0)) ? 'bid' : 'changePosition';
  marketTransaction.timestamp = event.block.timestamp;
  marketTransaction.blockNumber = event.block.number;
  marketTransaction.account = event.params.account;
  marketTransaction.market = event.address;
  marketTransaction.amount = event.params.fixedTicketAmount;
  marketTransaction.position = event.params.position;
  marketTransaction.save();

  if (position.position.equals(BigInt.fromI32(0))) {
    let market = Market.load(event.address.toHex());
    if (market !== null) {
      market.poolSize = market.poolSize.plus(market.ticketPrice);
      market.numberOfParticipants = market.numberOfParticipants.plus(BigInt.fromI32(1));
      market.save();
    }
  }
  position.timestamp = event.block.timestamp;
  position.position = event.params.position;
  position.isWithdrawn = false;
  position.isClaimed = false;
  position.save();
}

export function handleTicketWithdrawnEvent(event: TicketWithdrawnEvent): void {
  let positionId = event.address.toHex() + '-' + event.params.account.toHex();
  let position = Position.load(positionId);

  let marketTransaction = new MarketTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  marketTransaction.hash = event.transaction.hash;
  marketTransaction.type = 'withdrawal';
  marketTransaction.timestamp = event.block.timestamp;
  marketTransaction.blockNumber = event.block.number;
  marketTransaction.account = event.params.account;
  marketTransaction.market = event.address;
  marketTransaction.amount = event.params.amount;
  marketTransaction.position = position !== null ? position.position : BigInt.fromI32(0);
  marketTransaction.save();

  if (position !== null) {
    position.timestamp = event.block.timestamp;
    position.position = BigInt.fromI32(0);
    position.isWithdrawn = true;
    position.save();

    let market = Market.load(event.address.toHex());
    if (market !== null) {
      market.poolSize = market.poolSize.minus(market.ticketPrice);
      market.numberOfParticipants = market.numberOfParticipants.minus(BigInt.fromI32(1));
      market.save();
    }
  }
}

export function handleWinningTicketClaimedEvent(event: TicketWithdrawnEvent): void {
  let positionId = event.address.toHex() + '-' + event.params.account.toHex();
  let position = Position.load(positionId);

  let marketTransaction = new MarketTransaction(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  marketTransaction.hash = event.transaction.hash;
  marketTransaction.type = 'claim';
  marketTransaction.timestamp = event.block.timestamp;
  marketTransaction.blockNumber = event.block.number;
  marketTransaction.account = event.params.account;
  marketTransaction.market = event.address;
  marketTransaction.amount = event.params.amount;
  marketTransaction.position = position !== null ? position.position : BigInt.fromI32(0);
  marketTransaction.save();

  if (position !== null) {
    position.timestamp = event.block.timestamp;
    position.position = BigInt.fromI32(0);
    position.isClaimed = true;
    position.save();
  }
}

export function handleMarketCanceledEvent(event: MarketCanceledEvent): void {
  let market = Market.load(event.params.marketAddress.toHex());
  if (market !== null) {
    market.cancelledByCreator = market.creator.equals(event.transaction.from);
    market.save();
  }
}
