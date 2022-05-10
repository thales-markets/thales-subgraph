import { RangedMarketCreated, BoughtFromAmm, SoldToAMM } from '../../../generated/RangedMarkets/RangedMarketsAMM';

import { Market, Trade, RangedMarket, OptionTransaction } from '../../../generated/schema';
import { RangedMarket as RangedMarketTemplate } from '../../../generated/templates';

import {
    Exercised,
    Mint,
    RangedMarket as RangedMarketContract,
    Resolved,
} from '../../../generated/RangedMarkets/RangedMarket';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleRangedMarket(event: RangedMarketCreated): void {
    let rangedMarket = new RangedMarket(event.params.market.toHex());
    RangedMarketTemplate.create(event.params.market);

    let leftMarket = Market.load(event.params.leftMarket.toHex());
    let rightMarket = Market.load(event.params.rightMarket.toHex());

    let rangedMarketContract = RangedMarketContract.bind(event.params.market);

    rangedMarket.timestamp = event.block.timestamp;
    rangedMarket.currencyKey = leftMarket.currencyKey;
    rangedMarket.maturityDate = leftMarket.maturityDate;
    rangedMarket.expiryDate = leftMarket.expiryDate;
    rangedMarket.leftPrice = leftMarket.strikePrice;
    rangedMarket.rightPrice = rightMarket.strikePrice;
    rangedMarket.inAddress = rangedMarketContract.positions().value0;
    rangedMarket.outAddress = rangedMarketContract.positions().value1;
    rangedMarket.isOpen = true;
    rangedMarket.leftMarket = leftMarket.id;
    rangedMarket.rightMarket = rightMarket.id;

    rangedMarket.save();
}

export function handleBoughtFromAmmEvent(event: BoughtFromAmm): void {
    let trade = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
    trade.transactionHash = event.transaction.hash;
    trade.timestamp = event.block.timestamp;
    trade.blockNumber = event.block.number;
    trade.orderHash = event.transaction.hash;
    trade.maker = event.address;
    trade.taker = event.params.buyer;
    trade.makerToken = event.params.asset;
    trade.takerToken = event.params.susd;
    trade.makerAmount = event.params.amount;
    trade.takerAmount = event.params.sUSDPaid;
    trade.market = event.params.market;
    trade.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'in' : 'out';
    trade.orderSide = 'buy';
    trade.save();
}

export function handleSoldToAMMEvent(event: SoldToAMM): void {
    let trade = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
    trade.transactionHash = event.transaction.hash;
    trade.timestamp = event.block.timestamp;
    trade.blockNumber = event.block.number;
    trade.orderHash = event.transaction.hash;
    trade.maker = event.address;
    trade.taker = event.params.seller;
    trade.makerToken = event.params.susd;
    trade.takerToken = event.params.asset;
    trade.makerAmount = event.params.sUSDPaid;
    trade.takerAmount = event.params.amount;
    trade.market = event.params.market;
    trade.optionSide = BigInt.fromI32(event.params.position).equals(BigInt.fromI32(0)) ? 'in' : 'out';
    trade.orderSide = 'sell';
    trade.save();
}

export function handleExercised(event: Exercised): void {
    let optionTransactionEntity = new OptionTransaction(
        event.transaction.hash.toHex() + '-' + event.logIndex.toString(),
    );

    optionTransactionEntity.type = 'exercise';
    optionTransactionEntity.timestamp = event.block.timestamp;
    optionTransactionEntity.blockNumber = event.block.number;
    optionTransactionEntity.account = event.params.exerciser;
    optionTransactionEntity.market = event.address;
    optionTransactionEntity.amount = event.params.amount;
    optionTransactionEntity.save();
}

export function handleMint(event: Mint): void {
    let optionTransactionEntity = new OptionTransaction(
        event.transaction.hash.toHex() + '-' + event.logIndex.toString(),
    );

    optionTransactionEntity.type = 'mint';
    optionTransactionEntity.timestamp = event.block.timestamp;
    optionTransactionEntity.blockNumber = event.block.number;
    optionTransactionEntity.account = event.params.minter;
    optionTransactionEntity.market = event.address;
    optionTransactionEntity.amount = event.params.amount;
    optionTransactionEntity.side = event.params._position;
    optionTransactionEntity.save();
}

export function handleMarketResolved(event: Resolved): void {
    let market = RangedMarket.load(event.address.toHex());
    market.result = event.params.winningPosition;
    market.finalPrice = event.params.finalPrice;
    market.save();
}
