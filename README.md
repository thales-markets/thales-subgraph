# Thales Subgraph

[![Discord](https://img.shields.io/discord/906484044915687464.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/invite/rB3AWKwACM)
[![Twitter Follow](https://img.shields.io/twitter/follow/thalesmarket.svg?label=thalesmarket&style=social)](https://twitter.com/thalesmarket)

The Graph exposes a GraphQL endpoint to query the events and entities within the Thales system.  
Thales has multiple subgraphs generated from this repository. 



## Token Subgraph
- **Optimism**: https://thegraph.com/legacy-explorer/subgraph/thales-markets/thales-options
- **Optimism-Kovan**: https://thegraph.com/hosted-service/subgraph/thales-markets/thales-token

#### Entities: 
- TokenTransaction
- OngoingAirdropNewRoot
- Staker
- CanClaimOnBehalfItem

## Positional Markets
- **Optimism**: https://thegraph.com/hosted-service/subgraph/thales-markets/thales-markets
- **Optimism-Kovan**: https://thegraph.com/hosted-service/subgraph/thales-markets/thales-kovan-optimism
- **Polygon**: https://thegraph.com/hosted-service/subgraph/thales-markets/thales-polygon
- **Mumbai**: https://thegraph.com/hosted-service/subgraph/thales-markets/thales-mumbai

#### Entities: 
- Market
- RangedMarket
- OptionTransaction
- Trade
- AccountBuyVolume
- ReferralTransfer
- Referrer
- ReferredTrader
- Position
- PositionBalance
- RangedPosition
- RangedPositionBalance

## Sport Markets
- **Optimism**: https://thegraph.com/hosted-service/subgraph/thales-markets/sport-markets-optimism
- **Kovan**: https://thegraph.com/hosted-service/subgraph/thales-markets/sport-markets-kovan

#### Entities: 
- SportMarket
- SportMarketOddsHistory
- ClaimTx
- MarketTransaction
- Position
- PositionBalance

## Exotic Markets
- **Optimism**: https://thegraph.com/hosted-service/subgraph/thales-markets/thales-royale
- **Optimism-Kovan**: https://thegraph.com/hosted-service/subgraph/thales-markets/exotic-markets-optimism-kovan

#### Entities: 
- Market
- Dispute
- DisputeVote
- Position
- MarketTransaction



## Thales Royale
- **Optimism**: https://thegraph.com/hosted-service/subgraph/thales-markets/exotic-markets-optimism
- **Optimism-Kovan**: https://thegraph.com/hosted-service/subgraph/thales-markets/thales-royale-kovan

#### Entities: 
- ThalesRoyaleGame
- ThalesRoyaleSeason
- ThalesRoyaleRound
- ThalesRoyalePlayer
- ThalesRoyalePosition
- ThalesRoyalePass
- ThalesRoyalePassportPlayer
- ThalesRoyalePassportPosition




## To run and deploy locally

For any of the supported networks: `options` (mainnet), `options-ropsten` (ropsten), `options-kovan` (kovan) as `[subgraph]`

1. Run the `npm run codegen:[subgraph]` task to prepare the TypeScript sources for the GraphQL (generated/schema) and the ABIs (generated/[ABI]/\*)
2. [Optional] run the `npm run build:[subgraph]` task for the subgraph
3. Deploy via `npm run deploy:[subgraph]`. Note: requires env variable of `$THEGRAPH_SNX_ACCESS_TOKEN` set in bash to work.

## To query this subgraph

Please use our node & browser utility: [thales-data](https://github.com/thales-markets/thales-data).

## Or to query the subgraph without any JS library

In it's simplest version (on a modern browser assuming `async await` support and `fetch`):

```javascript
// Fetch all markets in the last 24 hours
(async () => {
  const ts = Math.floor(Date.now() / 1e3);
  const oneDayAgo = ts - 3600 * 24;
  const body = JSON.stringify({
    query: `{
      markets(
        orderBy:timestamp,
        orderDirection:desc,
        where:{timestamp_gt: ${oneDayAgo}}
      )
      {
        id
        timestamp
        creator
        currencyKey
        strikePrice
        maturityDate
        expiryDate
        isOpen
        poolSize
        longAddress
        shortAddress
        result
        customMarket
        customOracle
      }
    }`,
    variables: null,
  });

  const response = await fetch('https://api.thegraph.com/subgraphs/name/thales-markets/thales-options', {
    method: 'POST',
    body,
  });

  const json = await response.json();
  const { markets } = json.data;
  // ...
  console.log(markets);
})();
```

> Note: due to The Graph limitation, only `100` results will be returned (the maximum allowed `first` amount). The way around this is to use paging (using the `skip` operator in GraphQL). See the function `pageResults` in [thales-data](https://github.com/thales-markets/thales-data) for an example.
