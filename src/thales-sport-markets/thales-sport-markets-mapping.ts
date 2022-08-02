import { Position, SportMarket, SportMarketOddsHistory, PositionBalance } from '../../generated/schema';
import {
  CreateSportsMarket as CreateSportsMarketEvent,
  GameOddsAdded as GameOddsAddedEvent,
  ResolveSportsMarket as ResolveSportsMarketEvent,
  GameResolved as GameResolvedEvent,
  CancelSportsMarket as CancelSportsMarketEvent,
} from '../../generated/TheRundownConsumer/TheRundownConsumer';
import { Transfer as TransferEvent } from '../../generated/templates/Position/Position';
import { Position as PositionTemplate } from '../../generated/templates';
import { SportMarket as SportMarketContract } from '../../generated/templates/SportMarket/SportMarket';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { log } from '@graphprotocol/graph-ts';
import { MarketCreated as MarketCreatedEvent } from '../../generated/SportPositionalMarketManager/SportPositionalMarketManager';

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let market = new SportMarket(event.params.gameId.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.address = event.params.market.toHexString();
    market.maturityDate = event.params.maturityDate;
    market.save();
  }

  if (event.params.up.notEqual(Address.fromHexString('0x0000000000000000000000000000000000000000'))) {
    let positionHome = new Position(event.params.up.toHex());
    positionHome.market = market.id;
    positionHome.claimable = false;
    positionHome.side = 'home';
    positionHome.save();
    PositionTemplate.create(event.params.up);
  } else {
    log.info('zero adress draw: {}', [event.params.up.toHexString()]);
  }
  if (event.params.down.notEqual(Address.fromHexString('0x0000000000000000000000000000000000000000'))) {
    let positionAway = new Position(event.params.down.toHex());
    positionAway.market = market.id;
    positionAway.claimable = false;
    positionAway.side = 'away';
    positionAway.save();
    PositionTemplate.create(event.params.down);
  } else {
    log.info('zero adress draw: {}', [event.params.down.toHexString()]);
  }

  if (event.params.draw.notEqual(Address.fromHexString('0x0000000000000000000000000000000000000000'))) {
    let positionDraw = new Position(event.params.draw.toHex());
    positionDraw.market = market.id;
    positionDraw.claimable = false;
    positionDraw.side = 'draw';
    positionDraw.save();
    PositionTemplate.create(event.params.draw);
  } else {
    log.info('zero adress draw: {}', [event.params.draw.toHexString()]);
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

export function handleTransfer(event: TransferEvent): void {
  let position = Position.load(event.address.toHex());
  let userBalanceFrom = PositionBalance.load(event.address.toHex() + ' - ' + event.params.from.toHex());
  if (userBalanceFrom === null) {
    userBalanceFrom = new PositionBalance(event.address.toHex() + ' - ' + event.params.from.toHex());
    userBalanceFrom.account = event.params.from;
    userBalanceFrom.amount = BigInt.fromI32(0);
    userBalanceFrom.position = position.id;
  }
  userBalanceFrom.amount = userBalanceFrom.amount.minus(event.params.value);
  userBalanceFrom.save();

  let userBalanceTo = PositionBalance.load(event.address.toHex() + ' - ' + event.params.to.toHex());
  if (userBalanceTo === null) {
    userBalanceTo = new PositionBalance(event.address.toHex() + ' - ' + event.params.to.toHex());
    userBalanceTo.account = event.params.to;
    userBalanceTo.amount = BigInt.fromI32(0);
    userBalanceTo.position = position.id;
  }
  userBalanceTo.amount = userBalanceTo.amount.plus(event.params.value);
  userBalanceTo.save();
}

export function handleResolveSportsMarketEvent(event: ResolveSportsMarketEvent): void {
  let market = SportMarket.load(event.params._id.toHex());
  // if (event.block.number === BigInt.fromI32(33062576)) return;
  if (market !== null) {
    let marketContract = SportMarketContract.bind(event.params._marketAddress);
    market.timestamp = event.block.timestamp;
    market.isResolved = true;
    market.isOpen = false;
    market.finalResult = event.params._outcome;

    if (market.finalResult == BigInt.fromI32(1)) {
      let position = Position.load(marketContract.getOptions().value0.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }
    if (market.finalResult == BigInt.fromI32(2)) {
      let position = Position.load(marketContract.getOptions().value1.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }
    if (market.finalResult == BigInt.fromI32(3)) {
      let position = Position.load(marketContract.getOptions().value2.toHex());
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

    let marketContract = SportMarketContract.bind(event.params._marketAddress);
    let position = Position.load(marketContract.getOptions().value0.toHex());
    if (position !== null) {
      position.claimable = true;
      position.save();
    }
    let position1 = Position.load(marketContract.getOptions().value1.toHex());
    if (position1 !== null) {
      position1.claimable = true;
      position1.save();
    }
    let position2 = Position.load(marketContract.getOptions().value2.toHex());
    if (position2 !== null) {
      position2.claimable = true;
      position2.save();
    }
  }
}
