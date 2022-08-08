import { Position, SportMarket, SportMarketOddsHistory, PositionBalance, ClaimTx } from '../generated/schema';
import {
  CreateSportsMarket as CreateSportsMarketEvent,
  GameOddsAdded as GameOddsAddedEvent,
  ResolveSportsMarket as ResolveSportsMarketEvent,
  GameResolved as GameResolvedEvent,
  CancelSportsMarket as CancelSportsMarketEvent,
} from '../generated/TheRundownConsumer/TheRundownConsumer';
import { SportMarket as SportMarketTemplate } from '../generated/templates';
import {
  OptionsExercised,
  SportMarket as SportMarketContract,
} from '../generated/SportPositionalMarketManager/SportMarket';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { log } from '@graphprotocol/graph-ts';
import { MarketCreated as MarketCreatedEvent } from '../generated/SportPositionalMarketManager/SportPositionalMarketManager';

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let market = new SportMarket(event.params.gameId.toHex());
  SportMarketTemplate.create(event.params.market);
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.address = event.params.market.toHexString();
    market.maturityDate = event.params.maturityDate;
    market.upAddress = event.params.up;
    market.downAddress = event.params.down;
    market.drawAddress = event.params.draw;
    market.save();
  }

  if (event.params.up.notEqual(Address.fromHexString('0x0000000000000000000000000000000000000000'))) {
    let positionHome = new Position(event.params.up.toHex());
    positionHome.market = market.id;
    positionHome.claimable = false;
    positionHome.side = 'home';
    positionHome.save();
  }

  if (event.params.down.notEqual(Address.fromHexString('0x0000000000000000000000000000000000000000'))) {
    let positionAway = new Position(event.params.down.toHex());
    positionAway.market = market.id;
    positionAway.claimable = false;
    positionAway.side = 'away';
    positionAway.save();
  }

  if (event.params.draw.notEqual(Address.fromHexString('0x0000000000000000000000000000000000000000'))) {
    let positionDraw = new Position(event.params.draw.toHex());
    positionDraw.market = market.id;
    positionDraw.claimable = false;
    positionDraw.side = 'draw';
    positionDraw.save();
  }
}

export function handleOptionsExercised(event: OptionsExercised): void {
  let tx = new ClaimTx(event.transaction.hash.toHex());
  let market = SportMarket.load(event.address.toHex());
  if (market) {
    tx.account = event.params.account;
    tx.amount = event.params.value;
    tx.timestamp = event.block.timestamp;
    tx.market = market.id;
    tx.save();

    let position = Position.load(market.upAddress.toHex());
    if (position !== null) {
      let userHomeBalance = PositionBalance.load(position.id + ' - ' + event.params.account.toHex());
      if (userHomeBalance !== null) {
        userHomeBalance.amount = BigInt.fromI32(0);
        userHomeBalance.save();
      }
    }
    position = Position.load(market.downAddress.toHex());
    if (position !== null) {
      let userAwayBalance = PositionBalance.load(position.id + ' - ' + event.params.account.toHex());
      if (userAwayBalance !== null) {
        userAwayBalance.amount = BigInt.fromI32(0);
        userAwayBalance.save();
      }
    }

    position = Position.load(market.drawAddress.toHex());
    if (position !== null) {
      let userDrawBalance = PositionBalance.load(position.id + ' - ' + event.params.account.toHex());
      if (userDrawBalance !== null) {
        userDrawBalance.amount = BigInt.fromI32(0);
        userDrawBalance.save();
      }
    }
  }
}

export function handleCreateSportsMarketEvent(event: CreateSportsMarketEvent): void {
  let normalizedOdds = event.params._normalizedOdds;
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.address = event.params._marketAddress.toHexString();
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
  }

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
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.homeScore = BigInt.fromI32(event.params._game.homeScore);
    market.awayScore = BigInt.fromI32(event.params._game.awayScore);
    market.save();
  }
}

export function handleGameOddsAddedEvent(event: GameOddsAddedEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    let normalizedOdds = event.params._normalizedOdds;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.drawOdds = normalizedOdds[2];
    market.save();
  }

  let marketHistory = SportMarketOddsHistory.load(event.params._id.toHex());
  if (marketHistory !== null) {
    marketHistory.timestamp = event.block.timestamp;
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
