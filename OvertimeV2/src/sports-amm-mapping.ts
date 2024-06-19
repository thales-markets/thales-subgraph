import { BigInt } from '@graphprotocol/graph-ts';
import { NewTicket, ReferrerPaid, TicketCreated } from '../generated/SportsAMM/SportsAMM';
import { Market, Ticket } from '../generated/schema';

export function handleNewTicket(event: NewTicket): void {
  let ticket = new Ticket(event.params.ticket.toHex());
  ticket.txHash = event.transaction.hash;
  ticket.timestamp = event.block.timestamp;
  const markets: string[] = [];

  let lastGameStarts: BigInt | null = null;
  for (let i = 0; i < event.params.markets.length; i++) {
    let eventMarket = event.params.markets[i];

    let market = new Market(event.params.ticket.toHex() + '-' + eventMarket.gameId.toHex() + '-' + i.toString());
    market.gameId = eventMarket.gameId;
    market.sportId = BigInt.fromI32(eventMarket.sportId);
    market.typeId = BigInt.fromI32(eventMarket.typeId);
    market.maturity = eventMarket.maturity;
    market.status = BigInt.fromI32(eventMarket.status);
    market.line = BigInt.fromI32(eventMarket.line);
    market.playerId = BigInt.fromI32(eventMarket.playerId);
    market.position = BigInt.fromI32(eventMarket.position);
    market.odd = eventMarket.odd;
    market.save();

    markets.push(market.id);

    if (i == 0) lastGameStarts = eventMarket.maturity;
    if (lastGameStarts !== null && lastGameStarts.lt(eventMarket.maturity)) {
      lastGameStarts = eventMarket.maturity;
    }
  }

  ticket.markets = markets;
  ticket.lastGameStarts = lastGameStarts !== null ? lastGameStarts : BigInt.fromString('0');
  ticket.owner = event.transaction.from;
  ticket.buyInAmount = event.params.buyInAmount;
  ticket.payout = event.params.payout;
  ticket.isLive = event.params.isLive;
  ticket.save();
}

export function handleTicketCreated(event: TicketCreated): void {
  let ticket = Ticket.load(event.params.ticket.toHex());
  if (ticket !== null) {
    ticket.owner = event.params.recipient;
    ticket.totalQuote = event.params.totalQuote;
    ticket.fees = event.params.fees;
    ticket.collateral = event.params.collateral;
    ticket.save();
  }
}

export function handleReferralTransaction(event: ReferrerPaid): void {
  // let referrer = Referrer.load(event.params.refferer.toHex());
  // let trader = ReferredTrader.load(event.params.trader.toHex());
  // if (referrer == null) {
  //   referrer = new Referrer(event.params.refferer.toHex());
  //   referrer.trades = BigInt.fromI32(1);
  //   referrer.totalEarned = event.params.amount;
  //   referrer.totalVolume = event.params.volume;
  //   referrer.timestamp = event.block.timestamp;
  //   referrer.save();
  // } else {
  //   referrer.trades = referrer.trades.plus(BigInt.fromI32(1));
  //   referrer.totalEarned = referrer.totalEarned.plus(event.params.amount);
  //   referrer.totalVolume = referrer.totalVolume.plus(event.params.volume);
  //   referrer.save();
  // }
  // if (trader == null) {
  //   trader = new ReferredTrader(event.params.trader.toHex());
  //   trader.trades = BigInt.fromI32(1);
  //   trader.totalAmount = event.params.amount;
  //   trader.totalVolume = event.params.volume;
  //   trader.referrer = referrer.id;
  //   trader.timestamp = event.block.timestamp;
  //   trader.save();
  // } else {
  //   trader.trades = trader.trades.plus(BigInt.fromI32(1));
  //   trader.totalAmount = trader.totalAmount.plus(event.params.amount);
  //   trader.totalVolume = trader.totalVolume.plus(event.params.volume);
  //   trader.save();
  // }
  // let referralTransaction = new ReferralTransaction(event.transaction.hash.toHex());
  // referralTransaction.referrer = referrer.id;
  // referralTransaction.trader = trader.id;
  // referralTransaction.amount = event.params.amount;
  // referralTransaction.volume = event.params.volume;
  // referralTransaction.ammType = 'parlay';
  // referralTransaction.timestamp = event.block.timestamp;
  // referralTransaction.save();
}
