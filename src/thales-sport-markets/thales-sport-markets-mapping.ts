import { SportMarket } from '../../generated/schema';
import {
  CreateSportsMarket as CreateSportsMarketEvent,
  GameOddsAdded as GameOddsAddedEvent,
  ResolveSportsMarket as ResolveSportsMarketEvent,
  GameResolved as GameResolvedEvent,
} from '../../generated/TheRundownConsumer/TheRundownConsumer';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleCreateSportsMarketEvent(event: CreateSportsMarketEvent): void {
  let market = new SportMarket(event.params._id.toHex());
  market.timestamp = event.block.timestamp;
  market.address = event.params._marketAddress;
  market.maturityDate = event.params._game.startTime;
  market.tags = event.params._tags;
  market.isOpen = true;
  market.isResolved = false;
  market.finalResult = BigInt.fromI32(0);
  market.poolSize = BigInt.fromI32(0);
  market.numberOfParticipants = BigInt.fromI32(0);
  market.homeTeam = event.params._game.homeTeam;
  market.awayTeam = event.params._game.awayTeam;
  market.homeOdds = BigInt.fromI32(event.params._game.homeOdds);
  market.awayOdds = BigInt.fromI32(event.params._game.awayOdds);
  market.drawOdds = BigInt.fromI32(event.params._game.drawOdds);
  market.save();
}

export function handleGameOddsAddedEvent(event: GameOddsAddedEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.homeOdds = BigInt.fromI32(event.params._game.homeOdds);
    market.awayOdds = BigInt.fromI32(event.params._game.awayOdds);
    market.drawOdds = BigInt.fromI32(event.params._game.drawOdds);
    market.save();
  }
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
