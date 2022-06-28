import { SportMarket, SportMarketOddsHistory } from '../../generated/schema';
import {
  CreateSportsMarket as CreateSportsMarketEvent,
  GameOddsAdded as GameOddsAddedEvent,
  ResolveSportsMarket as ResolveSportsMarketEvent,
  GameResolved as GameResolvedEvent,
  CancelSportsMarket as CancelSportsMarketEvent,
} from '../../generated/TheRundownConsumer/TheRundownConsumer';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleCreateSportsMarketEvent(event: CreateSportsMarketEvent): void {
  let normalizedOdds = event.params._normalizedOdds;
  let market = new SportMarket(event.params._id.toHex());
  market.timestamp = event.block.timestamp;
  market.address = event.params._marketAddress;
  market.maturityDate = event.params._game.startTime;
  market.tags = event.params._tags;
  market.isOpen = true;
  market.isResolved = false;
  market.isCanceled = false;
  market.finalResult = BigInt.fromI32(0);
  market.poolSize = BigInt.fromI32(0);
  market.numberOfParticipants = BigInt.fromI32(0);
  market.homeTeam = event.params._game.homeTeam;
  market.awayTeam = event.params._game.awayTeam;
  market.homeOdds = normalizedOdds[0];
  market.awayOdds = normalizedOdds[1];
  market.drawOdds = normalizedOdds[2];
  market.save();

  let marketHistory = new SportMarketOddsHistory(event.params._id.toHex());
  marketHistory.timestamp = event.block.timestamp;
  marketHistory.address = event.params._marketAddress;
  marketHistory.maturityDate = event.params._game.startTime;
  marketHistory.tags = event.params._tags;
  marketHistory.isOpen = true;
  marketHistory.isResolved = false;
  marketHistory.isCanceled = false;
  marketHistory.finalResult = BigInt.fromI32(0);
  marketHistory.poolSize = BigInt.fromI32(0);
  marketHistory.numberOfParticipants = BigInt.fromI32(0);
  marketHistory.homeTeam = event.params._game.homeTeam;
  marketHistory.awayTeam = event.params._game.awayTeam;
  marketHistory.homeOdds = [normalizedOdds[0]];
  marketHistory.awayOdds = [normalizedOdds[1]];
  marketHistory.drawOdds = [normalizedOdds[2]];
  marketHistory.save();
}

export function handleResolveSportsMarketEvent(event: ResolveSportsMarketEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.isResolved = true;
    market.isOpen = false;
    market.finalResult = event.params._outcome;
    market.save();
  }
}

export function handleGameResolvedEvent(event: GameResolvedEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.homeScore = BigInt.fromI32(event.params._game.homeScore);
    market.awayScore = BigInt.fromI32(event.params._game.awayScore);
    market.save();
  }
}

export function handleGameOddsAddedEvent(event: GameOddsAddedEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    let normalizedOdds = event.params._normalizedOdds;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.drawOdds = normalizedOdds[2];
    market.save();
  }

  let marketHistory = SportMarketOddsHistory.load(event.params._id.toHex());
  if (marketHistory !== null) {
    let normalizedOdds = event.params._normalizedOdds;
    let homeOdds = marketHistory.homeOdds;
    homeOdds.push(normalizedOdds[0]);
    let awayOdds = marketHistory.awayOdds;
    awayOdds.push(normalizedOdds[1]);
    let drawOdds = marketHistory.drawOdds;
    drawOdds.push(normalizedOdds[2]);
    marketHistory.homeOdds = homeOdds;
    marketHistory.awayOdds = awayOdds;
    marketHistory.drawOdds = drawOdds;
    marketHistory.save();
  }
}

export function handleCancelSportsMarket(event: CancelSportsMarketEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.isCanceled = true;
    market.save();
  }
}
