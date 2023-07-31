import {
  Position,
  SportMarket,
  PositionBalance,
  ClaimTx,
  User,
  GameIdToParentMarket,
  ParentMarketToDoubleChanceMarket,
} from '../generated/schema';
import {
  CreateSportsMarket as CreateSportsMarketEvent,
  GameOddsAdded as GameOddsAddedEvent,
  GameResolved as GameResolvedEvent,
} from '../generated/TheRundownConsumer/TheRundownConsumer';
import { GameResolved as GameResolvedUpdatedAtEvent } from '../generated/TheRundownConsumerUpdatedAt/TheRundownConsumer';
import { SportMarket as SportMarketTemplate } from '../generated/templates';
import { OptionsExercised, MarketResolved, PauseUpdated } from '../generated/SportPositionalMarketManager/SportMarket';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import {
  MarketCreated as MarketCreatedEvent,
  DatesUpdatedForMarket as DatesUpdatedForMarketEvent,
} from '../generated/SportPositionalMarketManager/SportPositionalMarketManager';
import {
  MarketCreated as MarketCreatedSpreadAndTotalEvent,
  DoubleChanceMarketCreated as DoubleChanceMarketCreatedEvent,
} from '../generated/SportPositionalMarketManagerSpreadAndTotal/SportPositionalMarketManager';
import {
  CreateChildSpreadSportsMarket as CreateChildSpreadSportsMarketEvent,
  CreateChildTotalSportsMarket as CreateChildTotalSportsMarketEvent,
  ResolveChildMarket as ResolveChildMarketEvent,
  GameOddsAdded as GameOddsAddedObtainerEvent,
  GamedOddsAddedChild as GamedOddsAddedChildEvent,
} from '../generated/GamesOddsObtainer/GamesOddsObtainer';

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let market = new SportMarket(event.params.market.toHex());

  SportMarketTemplate.create(event.params.market);

  market.timestamp = event.block.timestamp;
  market.address = event.params.market;
  market.gameId = event.params.gameId;
  market.maturityDate = event.params.maturityDate;
  market.upAddress = event.params.up;
  market.downAddress = event.params.down;
  market.drawAddress = event.params.draw;
  market.maturityDate = event.params.maturityDate;
  market.tags = [BigInt.fromI32(0)];
  market.isOpen = true;
  market.isResolved = false;
  market.isCanceled = false;
  market.isPaused = false;
  market.finalResult = BigInt.fromI32(0);
  market.poolSize = BigInt.fromI32(0);
  market.numberOfParticipants = BigInt.fromI32(0);
  market.homeTeam = '';
  market.awayTeam = '';
  market.homeOdds = BigInt.fromI32(0);
  market.awayOdds = BigInt.fromI32(0);
  market.drawOdds = BigInt.fromI32(0);
  market.save();

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

export function handleMarketCreatedSpreadAndTotal(event: MarketCreatedSpreadAndTotalEvent): void {
  let market = new SportMarket(event.params.market.toHex());

  SportMarketTemplate.create(event.params.market);

  market.timestamp = event.block.timestamp;
  market.address = event.params.market;
  market.gameId = event.params.gameId;
  market.maturityDate = event.params.maturityDate;
  market.upAddress = event.params.up;
  market.downAddress = event.params.down;
  market.drawAddress = event.params.draw;
  market.maturityDate = event.params.maturityDate;
  market.tags = [BigInt.fromI32(0)];
  market.isOpen = true;
  market.isResolved = false;
  market.isCanceled = false;
  market.isPaused = false;
  market.finalResult = BigInt.fromI32(0);
  market.poolSize = BigInt.fromI32(0);
  market.numberOfParticipants = BigInt.fromI32(0);
  market.homeTeam = '';
  market.awayTeam = '';
  market.homeOdds = BigInt.fromI32(0);
  market.awayOdds = BigInt.fromI32(0);
  market.drawOdds = BigInt.fromI32(0);
  market.save();

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

export function handleMarketResolved(event: MarketResolved): void {
  let market = SportMarket.load(event.address.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.isCanceled = event.params.result == 0;
    market.isResolved = true;
    market.isOpen = false;
    market.isPaused = false;
    market.finalResult = BigInt.fromI32(event.params.result);
    market.save();

    if (event.params.result == 1 || event.params.result == 0) {
      let position = Position.load(market.upAddress.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }
    if (event.params.result == 2 || event.params.result == 0) {
      let position = Position.load(market.downAddress.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }
    if (event.params.result == 3 || event.params.result == 0) {
      let position = Position.load(market.drawAddress.toHex());
      if (position !== null) {
        position.claimable = true;
        position.save();
      }
    }
  }
}

export function handleMarketPauseUpdated(event: PauseUpdated): void {
  let market = SportMarket.load(event.address.toHex());
  if (market !== null) {
    market.isPaused = event.params._paused;
    market.save();

    let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(market.address.toHex());
    if (parentMarketToDoubleChanceMarket !== null) {
      let doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.isPaused = market.isPaused;
        doubleChanceMarket.save();
      }
      doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.isPaused = market.isPaused;
        doubleChanceMarket.save();
      }
      doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.noDrawMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.isPaused = market.isPaused;
        doubleChanceMarket.save();
      }
    }
  }
}

export function handleDatesUpdatedForMarket(event: DatesUpdatedForMarketEvent): void {
  let market = SportMarket.load(event.params._market.toHex());
  if (market !== null) {
    market.maturityDate = event.params._newStartTime;
    market.save();

    let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(market.address.toHex());
    if (parentMarketToDoubleChanceMarket !== null) {
      let doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.maturityDate = market.maturityDate;
        doubleChanceMarket.save();
      }
      doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.maturityDate = market.maturityDate;
        doubleChanceMarket.save();
      }
      doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.noDrawMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.maturityDate = market.maturityDate;
        doubleChanceMarket.save();
      }
    }
  }
}

export function handleOptionsExercised(event: OptionsExercised): void {
  let tx = new ClaimTx(event.transaction.hash.toHex());
  let market = SportMarket.load(event.address.toHex());
  if (market !== null) {
    tx.account = event.params.account;
    tx.amount = event.params.value;
    tx.timestamp = event.block.timestamp;
    tx.market = market.id;
    tx.caller = event.transaction.from;
    tx.save();

    let position = Position.load(market.upAddress.toHex());
    if (position !== null) {
      let userHomeBalance = PositionBalance.load(position.id + ' - ' + event.params.account.toHex());
      if (userHomeBalance !== null) {
        userHomeBalance.claimed = true;
        userHomeBalance.save();
      }
    }
    let positionDown = Position.load(market.downAddress.toHex());
    if (positionDown !== null) {
      let userAwayBalance = PositionBalance.load(positionDown.id + ' - ' + event.params.account.toHex());
      if (userAwayBalance !== null) {
        userAwayBalance.claimed = true;
        userAwayBalance.save();
      }
    }

    let positionDraw = Position.load(market.drawAddress.toHex());
    if (positionDraw !== null) {
      let userDrawBalance = PositionBalance.load(positionDraw.id + ' - ' + event.params.account.toHex());
      if (userDrawBalance !== null) {
        userDrawBalance.claimed = true;
        userDrawBalance.save();
      }
    }
  }

  let userStats = User.load(event.transaction.from.toHex());
  if (userStats === null) {
    userStats = new User(event.transaction.from.toHex());
    userStats.volume = BigInt.fromI32(0);
    userStats.pnl = BigInt.fromI32(0);
    userStats.trades = 0;
  }

  userStats.pnl = userStats.pnl.plus(event.params.value);
  userStats.save();
}

export function handleCreateSportsMarketEvent(event: CreateSportsMarketEvent): void {
  let gameIdToParentMarket = new GameIdToParentMarket(event.params._id.toHex());
  gameIdToParentMarket.parentMarket = event.params._marketAddress;
  gameIdToParentMarket.save();

  let normalizedOdds = event.params._normalizedOdds;
  let market = SportMarket.load(event.params._marketAddress.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.tags = event.params._tags;
    market.homeTeam = event.params._game.homeTeam;
    market.awayTeam = event.params._game.awayTeam;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.drawOdds = normalizedOdds[2];
    market.save();

    let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(event.params._marketAddress.toHex());
    if (parentMarketToDoubleChanceMarket !== null) {
      let doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.tags = market.tags;
        doubleChanceMarket.homeTeam = market.homeTeam;
        doubleChanceMarket.awayTeam = market.awayTeam;
        doubleChanceMarket.homeOdds = market.homeOdds.plus(market.drawOdds);
        doubleChanceMarket.save();
      }
      doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.tags = market.tags;
        doubleChanceMarket.homeTeam = market.homeTeam;
        doubleChanceMarket.awayTeam = market.awayTeam;
        doubleChanceMarket.homeOdds = market.awayOdds.plus(market.drawOdds);
        doubleChanceMarket.save();
      }
      doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.noDrawMarket.toHex());
      if (doubleChanceMarket !== null) {
        doubleChanceMarket.tags = market.tags;
        doubleChanceMarket.homeTeam = market.homeTeam;
        doubleChanceMarket.awayTeam = market.awayTeam;
        doubleChanceMarket.homeOdds = market.homeOdds.plus(market.awayOdds);
        doubleChanceMarket.save();
      }
    }
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

      let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(market.address.toHex());
      if (parentMarketToDoubleChanceMarket !== null) {
        let doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.timestamp = market.timestamp;
          doubleChanceMarket.homeScore = market.homeScore;
          doubleChanceMarket.awayScore = market.awayScore;
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.timestamp = market.timestamp;
          doubleChanceMarket.homeScore = market.homeScore;
          doubleChanceMarket.awayScore = market.awayScore;
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.noDrawMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.timestamp = market.timestamp;
          doubleChanceMarket.homeScore = market.homeScore;
          doubleChanceMarket.awayScore = market.awayScore;
          doubleChanceMarket.save();
        }
      }
    }
  }
}

export function handleGameResolvedUpdatedAtEvent(event: GameResolvedUpdatedAtEvent): void {
  let gameIdToParentMarket = GameIdToParentMarket.load(event.params._id.toHex());
  if (gameIdToParentMarket !== null) {
    let market = SportMarket.load(gameIdToParentMarket.parentMarket.toHex());
    if (market !== null) {
      market.timestamp = event.block.timestamp;
      market.homeScore = BigInt.fromI32(event.params._game.homeScore);
      market.awayScore = BigInt.fromI32(event.params._game.awayScore);
      market.save();

      let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(market.address.toHex());
      if (parentMarketToDoubleChanceMarket !== null) {
        let doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.timestamp = market.timestamp;
          doubleChanceMarket.homeScore = market.homeScore;
          doubleChanceMarket.awayScore = market.awayScore;
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.timestamp = market.timestamp;
          doubleChanceMarket.homeScore = market.homeScore;
          doubleChanceMarket.awayScore = market.awayScore;
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.noDrawMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.timestamp = market.timestamp;
          doubleChanceMarket.homeScore = market.homeScore;
          doubleChanceMarket.awayScore = market.awayScore;
          doubleChanceMarket.save();
        }
      }
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

      let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(market.address.toHex());
      if (parentMarketToDoubleChanceMarket !== null) {
        let doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.homeOdds = market.homeOdds.plus(market.drawOdds);
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.homeOdds = market.awayOdds.plus(market.drawOdds);
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.noDrawMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.homeOdds = market.homeOdds.plus(market.awayOdds);
          doubleChanceMarket.save();
        }
      }
    }
  }
}

export function handleCreateChildSpreadSportsMarketEvent(event: CreateChildSpreadSportsMarketEvent): void {
  let normalizedOdds = event.params._normalizedOdds;
  let market = SportMarket.load(event.params._child.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.betType = event.params._type;
    market.spread = BigInt.fromI32(event.params._spread);

    let parentMarket = SportMarket.load(event.params._main.toHex());
    if (parentMarket !== null) {
      market.tags = parentMarket.tags;
      market.homeTeam = parentMarket.homeTeam;
      market.awayTeam = parentMarket.awayTeam;
      market.parentMarket = parentMarket.address;
    }
    market.save();
  }
}

export function handleCreateChildTotalSportsMarketEvent(event: CreateChildTotalSportsMarketEvent): void {
  let normalizedOdds = event.params._normalizedOdds;
  let market = SportMarket.load(event.params._child.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.betType = event.params._type;
    market.total = BigInt.fromI32(event.params._total);

    let parentMarket = SportMarket.load(event.params._main.toHex());
    if (parentMarket !== null) {
      market.tags = parentMarket.tags;
      market.homeTeam = parentMarket.homeTeam;
      market.awayTeam = parentMarket.awayTeam;
      market.parentMarket = parentMarket.address;
    }
    market.save();
  }
}

export function handleResolveChildMarketEvent(event: ResolveChildMarketEvent): void {
  let market = SportMarket.load(event.params._child.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.homeScore = BigInt.fromI32(event.params._homeScore);
    market.awayScore = BigInt.fromI32(event.params._awayScore);
    market.save();
  }
}

export function handleGameOddsAddedObtainerEvent(event: GameOddsAddedObtainerEvent): void {
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

      let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(market.address.toHex());
      if (parentMarketToDoubleChanceMarket !== null) {
        let doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.homeOdds = market.homeOdds.plus(market.drawOdds);
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.homeOdds = market.awayOdds.plus(market.drawOdds);
          doubleChanceMarket.save();
        }
        doubleChanceMarket = SportMarket.load(parentMarketToDoubleChanceMarket.noDrawMarket.toHex());
        if (doubleChanceMarket !== null) {
          doubleChanceMarket.homeOdds = market.homeOdds.plus(market.awayOdds);
          doubleChanceMarket.save();
        }
      }
    }
  }
}

export function handleGameOddsAddedChildEvent(event: GamedOddsAddedChildEvent): void {
  let market = SportMarket.load(event.params._market.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    let normalizedOdds = event.params._normalizedChildOdds;
    market.homeOdds = normalizedOdds[0];
    market.awayOdds = normalizedOdds[1];
    market.save();
  }
}

export function handleDoubleChanceMarketCreated(event: DoubleChanceMarketCreatedEvent): void {
  let market = SportMarket.load(event.params._doubleChanceMarket.toHex());
  if (market !== null) {
    market.timestamp = event.block.timestamp;
    market.betType = event.params.tag;
    market.parentMarket = event.params._parentMarket;
    market.doubleChanceMarketType = event.params.label;

    let parentMarket = SportMarket.load(event.params._parentMarket.toHex());
    if (parentMarket !== null) {
      market.homeOdds = event.params.label.startsWith('HomeTeamNotToLose')
        ? parentMarket.homeOdds.plus(parentMarket.drawOdds)
        : event.params.label.startsWith('AwayTeamNotToLose')
        ? parentMarket.awayOdds.plus(parentMarket.drawOdds)
        : parentMarket.homeOdds.plus(parentMarket.awayOdds);
    }
    market.save();

    let parentMarketToDoubleChanceMarket = ParentMarketToDoubleChanceMarket.load(event.params._parentMarket.toHex());
    if (parentMarketToDoubleChanceMarket !== null) {
      if (event.params.label.startsWith('HomeTeamNotToLose')) {
        parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket = event.params._doubleChanceMarket;
      } else if (event.params.label.startsWith('AwayTeamNotToLose')) {
        parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket = event.params._doubleChanceMarket;
      } else if (event.params.label.startsWith('NoDraw')) {
        parentMarketToDoubleChanceMarket.noDrawMarket = event.params._doubleChanceMarket;
      }
    } else {
      parentMarketToDoubleChanceMarket = new ParentMarketToDoubleChanceMarket(event.params._parentMarket.toHex());
      parentMarketToDoubleChanceMarket.homeTeamNotToLoseMarket = event.params._doubleChanceMarket;
      parentMarketToDoubleChanceMarket.awayTeamNotToLoseMarket = event.params._doubleChanceMarket;
      parentMarketToDoubleChanceMarket.noDrawMarket = event.params._doubleChanceMarket;
    }
    parentMarketToDoubleChanceMarket.save();
  }
}
