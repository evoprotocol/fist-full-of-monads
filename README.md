
# fist-full-of-monads

![nodejs](https://github.com/evoprotocol/fist-full-of-monads/workflows/nodejs/badge.svg)


## Abstract

`fist-full-of-monads` module enables transaction-dependent computation to be composed without executing the transaction or specifying the Web3 Provider until later.

The requirements for a transaction, particularly gas costs, can be checked in the client code rather than in a protocol library. This is used for benchmarking `yGwei`/`GasEVO`.

## Usage

> Support for multiple architectures 

### using ES6

```javascript
import Transaction from 'fist-full-of-monads';
import * as utils from 'fist-full-of-monads/lib/utils';
```

### using ES5

```javascript
var Transaction = require('fist-full-of-monads');
var utils = require('fist-full-of-monads');

const httpProvider = new Web3.providers.HttpProvider('http://localhost:8545');
const tx = Transaction({
  options: {
    from: '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
    to: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
    value: 1000000,
  },
});

const minedTx = tx.map((txhash, provider) => utils.waitForReceipt(txhash, provider));
const gas = await minedTx.getQuickestGasEstimate(httpProvider);

minedTx.transact(httpProvider)
  .then((receipt) => {
    ...
  })
```

### as a library
```javascript

function transferTokens(sender, to, amount) {
  const web3 = new Web3();
  const TokenContract = web3.eth.contract(Token.abi).at(Token.address);
  const data = TokenContract.transfer.getData(to, amount);
  const options = { data, from: sender, to: Token.address };
  return Transaction({ options });
}

const tx = transferTokens(
  '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
  '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
  1000000
);

const txhash = await tx.transact(provider);
```

## Citation
<pre>
@incollection{evoprotocol,
    title      = {fist-full-of-monadss},
    year       = {2020},
    booktitle  = {Transactional Benchmarking in Ethereum Virtual Machine},
    series     = {EVO Protocol},
    source      = {https://github.com/evoprotocol/fist-full-of-monads},
}
</pre>

## License

Apache-2.0
