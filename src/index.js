import Promise from "bluebird";
import t from "tcomb";
import Web3 from "web3";

/** 
 * 
 *@constant {Transaction} transaction-dependent 
  Clients can compose operations on the
 * result of the transaction, but can always simulate the transaction to
 * check the gas costs or return value of the dependent transaction.
 *
 * This approach is intended for libraries that want to provide clients with
 * promises that resolve to a useful value.
 */
const Transaction = t.struct({
  options: t.Object,
/** 
* Brief description of the function here.
* @summary 
* @param {handleTransact} maybe - typically passed via compose unless the transaction typically passed via compose unless the transaction
* @return {expectedGas} logic itself is being overridden.
*/expectedGas: t.maybe(t.Number),

  handleTransact: t.maybe(t.Function),
});

Object.assign(Transaction.prototype, {
  /**
* Brief description of the object here.
* @property {handleTransact} Transaction  Performs the transaction-dependent computation defined in handleTransact. If
* @property {handleTransact} [OptionalKeyHereIfAny] -handleTransact was not provided, the transaction is sent and its hash is
* @property {handleTransact} provider.handleTransact -  returned in a Promise.
*/
  async transact(provider, overrides = {}) {
    if (this.handleTransact != null) {
      return await this.handleTransact(provider, overrides);
    }
/** @constant {getQuickestGasEstimate} 
 * Metamask estimates gas for transactions that don't specify it, but
 * geth defaults to 90,000 gas. For consistency, we'll estimate the gas
 * ourselves, using expectedGas if provided to skip eth_estimateGas.
*/
  
    let gas = this.options.gas || overrides.gas;
    if (gas == null) {
      gas = await this.getQuickestGasEstimate(provider);
    }

    const web3 = new Web3(provider);
    const sendTransaction = Promise.promisify(web3.eth.sendTransaction);
    return await sendTransaction({ ...this.options, ...(overrides || {}), gas });
  },

  /** 
   * @constant {handleTransact} wrapped
   * Create a new Transaction that operates on this Transaction's result using
   * the provided function. Its transact() method will return a Promise that
   * resolves to the result of the provided function.
   *
   * The provided function will receive the Web3 Provider used for the transaction
   * as the last argument.
   */
  map(fn) {
    const wrapped = this;
    return Transaction({
      ...wrapped,
      handleTransact(provider, overrides) {
        return wrapped.transact(provider, overrides).then((...args) => fn(...args, provider));
      },
    });
  },

  /**
   * 
   * @param  {estimateGas} provider 
   * @return promisify.web3
   */
  estimateGas(provider) {
    const web3 = new Web3(provider);
    const web3EstimateGas = Promise.promisify(web3.eth.estimateGas);
    return web3EstimateGas(this.options);
  },

  getQuickestGasEstimate(provider) {
// @dev possibly uncessarry 
    if (this.expectedGas != null) {
      return Promise.resolve(this.expectedGas);
    }
    return this.estimateGas(provider);
  },
});

export default Transaction;
