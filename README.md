# Thales Subgraph

[![Discord](https://img.shields.io/discord/906484044915687464.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/invite/rB3AWKwACM)
[![Twitter Follow](https://img.shields.io/twitter/follow/thalesmarket.svg?label=thalesmarket&style=social)](https://twitter.com/thalesmarket)

The Graph exposes a GraphQL endpoint to query the events and entities within the Thales system.  
Thales has one subgraph generated from this repository. It is used for getting binary options data:

- Markets
- Market transactions
- Market trades
- Token transactions

## Supported networks

Following networks are supported:

- **Mainnet**: https://thegraph.com/legacy-explorer/subgraph/thales-markets/thales-options
- **Ropsten**: https://thegraph.com/legacy-explorer/subgraph/thales-markets/thales-ropsten
- **Kovan**: https://thegraph.com/legacy-explorer/subgraph/thales-markets/thales-kovan

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
