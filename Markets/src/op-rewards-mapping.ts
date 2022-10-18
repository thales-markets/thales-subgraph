/* eslint-disable no-empty */

import { BoughtOptionType, BoughtWithDiscount, } from '../generated/AMM/AMM';
import {
  Trade,
} from '../generated/schema';

export function handleBoughtFromAmmEvent(event: BoughtOptionType): void {
  let trade = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  trade.timestamp = event.block.timestamp;
  trade.account = event.params.buyer;
  trade.amount = event.params.sUSDPaid;
  if(event.params.inTheMoney) {
    trade.type = 'ITM'
  } else {
    trade.type = 'OTM'
  }
  trade.save();
}

export function hangledBoughtWithDiscount(event: BoughtWithDiscount): void {
  let trade = new Trade(event.transaction.hash.toHexString() + '-' + event.logIndex.toString());
  trade.timestamp = event.block.timestamp;
  trade.account = event.params.buyer;
  trade.amount = event.params.sUSDPaid;
  trade.type = 'DSC';
  trade.save();
}
