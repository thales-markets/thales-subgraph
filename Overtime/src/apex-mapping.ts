import { GameIdToParentMarket, Position, Race, SportMarket } from '../generated/schema';
import {
  CreateSportsMarket as CreateSportsMarketEvent,
  GameOddsAdded as GameOddsAddedEvent,
  ResolveSportsMarket as ResolveSportsMarketEvent,
  GameResolved as GameResolvedEvent,
  CancelSportsMarket as CancelSportsMarketEvent,
  GameResultsSet as GameResultsSetEvent,
  RaceCreated as RaceCreatedEvent,
} from '../generated/ApexConsumer/ApexConsumer';
import { GameOddsAdded as GameWithPostQualifyingOddsAddedEvent } from '../generated/ApexConsumerWithPostQualifyingOdds/ApexConsumer';
import { CreateSportsMarket as CreateSportsMarketWithBetTypeEvent } from '../generated/ApexConsumerWithBetType/ApexConsumer';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleCreateSportsMarketEvent(event: CreateSportsMarketEvent): void {
  let gameIdToParentMarket = new GameIdToParentMarket(event.params._id.toHex());
  gameIdToParentMarket.parentMarket = event.params._marketAddress;
  gameIdToParentMarket.save();

  let normalizedOdds = event.params._normalizedOdds;
  let market = SportMarket.load(event.params._marketAddress.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.address = event.params._marketAddress;
    market.maturityDate = event.params._game.startTime;
    market.tags = event.params._tags;
    market.isOpen = true;
    market.isResolved = false;
    market.isCanceled = false;
    market.isPaused = false;
    market.finalResult = BigInt.fromI32(0);
    market.poolSize = BigInt.fromI32(0);
    market.numberOfParticipants = BigInt.fromI32(0);
    market.homeTeam = event.params._game.homeTeam;
    market.awayTeam = event.params._game.awayTeam;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.drawOdds = normalizedOdds[2];
    market.isApex = true;
    market.arePostQualifyingOddsFetched = false;
    market.betType = BigInt.fromI32(0);

    let race = Race.load(event.params._game.raceId);
    if (race !== null) {
      market.leagueRaceName = race.raceName;
      market.qualifyingStartTime = race.qualifyingStartTime;
    }

    market.save();
  }
}

export function handleCreateSportsMarketWithBetTypeEvent(event: CreateSportsMarketWithBetTypeEvent): void {
  let gameIdToParentMarket = new GameIdToParentMarket(event.params._id.toHex());
  gameIdToParentMarket.parentMarket = event.params._marketAddress;
  gameIdToParentMarket.save();

  let normalizedOdds = event.params._normalizedOdds;
  let market = SportMarket.load(event.params._marketAddress.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.address = event.params._marketAddress;
    market.maturityDate = event.params._game.startTime;
    market.tags = event.params._tags;
    market.isOpen = true;
    market.isResolved = false;
    market.isCanceled = false;
    market.isPaused = false;
    market.finalResult = BigInt.fromI32(0);
    market.poolSize = BigInt.fromI32(0);
    market.numberOfParticipants = BigInt.fromI32(0);
    market.homeTeam = event.params._game.homeTeam;
    market.awayTeam = event.params._game.awayTeam;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.drawOdds = normalizedOdds[2];
    market.isApex = true;
    market.arePostQualifyingOddsFetched = false;
    market.betType = event.params._game.betType;

    let race = Race.load(event.params._game.raceId);
    if (race !== null) {
      market.leagueRaceName = race.raceName;
      market.qualifyingStartTime = race.qualifyingStartTime;
    }

    market.save();
  }
}

export function handleResolveSportsMarketEvent(event: ResolveSportsMarketEvent): void {
  let market = SportMarket.load(event.params._marketAddress.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.isResolved = true;
    market.isOpen = false;
    market.finalResult = event.params._outcome;

    if (market.finalResult == BigInt.fromI32(1)) {
      let position = Position.load(market.upAddress.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }
    if (market.finalResult == BigInt.fromI32(2)) {
      let position = Position.load(market.downAddress.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }
    if (market.finalResult == BigInt.fromI32(3)) {
      let position = Position.load(market.drawAddress.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }

    market.save();
  }
}

export function handleGameResolvedEvent(event: GameResolvedEvent): void {
  let gameIdToParentMarket = GameIdToParentMarket.load(event.params._id.toHex());
  if (gameIdToParentMarket !== null) {
    let market = SportMarket.load(gameIdToParentMarket.parentMarket.toHex());
    if (market !== null) {
      market.timestamp = event.block.timestamp;
      market.homeScore = BigInt.fromI32(event.params._game.homeScore);
      market.awayScore = BigInt.fromI32(event.params._game.awayScore);
      market.save();
    }
  }
}

export function handleGameOddsAddedEvent(event: GameOddsAddedEvent): void {
  let gameIdToParentMarket = GameIdToParentMarket.load(event.params._id.toHex());
  if (gameIdToParentMarket !== null) {
    let market = SportMarket.load(gameIdToParentMarket.parentMarket.toHex());
    if (market !== null) {
      market.timestamp = event.block.timestamp;
      let normalizedOdds = event.params._normalizedOdds;
      market.homeOdds = normalizedOdds[0];
      market.awayOdds = normalizedOdds[1];
      market.drawOdds = normalizedOdds[2];
      market.save();
    }
  }
}

export function handleCancelSportsMarket(event: CancelSportsMarketEvent): void {
  let market = SportMarket.load(event.params._marketAddress.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.isCanceled = true;
    market.isOpen = false;
    market.save();

    let position = Position.load(market.upAddress.toHex());
    if (position !== null) {
      position.claimable = true;
      position.save();
    }
    let position1 = Position.load(market.downAddress.toHex());
    if (position1 !== null) {
      position1.claimable = true;
      position1.save();
    }
    let position2 = Position.load(market.drawAddress.toHex());
    if (position2 !== null) {
      position2.claimable = true;
      position2.save();
    }
  }
}

export function handleGameResultsSetEvent(event: GameResultsSetEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.resultDetails = event.params._game.resultDetails;
    market.save();
  }
}

export function handleRaceCreatedEvent(event: RaceCreatedEvent): void {
  let race = new Race(event.params._id);
  race.raceName = event.params._race.eventName;
  race.startTime = event.params._race.startTime;
  race.qualifyingStartTime = event.params._race.qualifyingStartTime;
  race.save();
}

export function handleGameWithPostQualifyingOddsAddedEvent(event: GameWithPostQualifyingOddsAddedEvent): void {
  let gameIdToParentMarket = GameIdToParentMarket.load(event.params._id.toHex());
  if (gameIdToParentMarket !== null) {
    let market = SportMarket.load(gameIdToParentMarket.parentMarket.toHex());
    if (market !== null) {
      market.timestamp = event.block.timestamp;
      let normalizedOdds = event.params._normalizedOdds;
      market.homeOdds = normalizedOdds[0];
      market.awayOdds = normalizedOdds[1];
      market.drawOdds = normalizedOdds[2];
      market.arePostQualifyingOddsFetched = event.params._game.arePostQualifyingOddsFetched;
      market.save();
    }
  }
}
