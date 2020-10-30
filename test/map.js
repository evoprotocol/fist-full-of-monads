import Promise from "bluebird";
import { expect } from "chai";
import sinon from "sinon";
import Transaction from "../src";
import * as utils from "./_utils";

global.Promise = Promise; // Use bluebird for better error logging during development.

describe("Transaction.map", () => {
  it("calls the mapped function when transacting", async () => {
    const tx = Transaction({
      options: {
        from: "0xe8d3266f3c4f083ab8864b5e04aea7b087044e49",
        to: "0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8",
        value: "0xf4240",
      },
    });

    const resultStub = sinon.stub();
    resultStub.returns(utils.STUB_TXHASH);
    const provider = utils.stubbedProvider(resultStub);
    const sendAsync = sinon.spy(provider, "sendAsync");
    const MAP_RESULT = "MAP RESULT";

    const mappedTx = tx.map((txhash, providerArg) => {
      expect(txhash).to.be.equal(utils.STUB_TXHASH);
      expect(providerArg).to.be.equal(provider);
      return MAP_RESULT;
    });

    const result = await mappedTx.transact(provider);
    expect(result).to.be.equal(MAP_RESULT);

    // Ensure that the transaction happened normally.
    expect(sendAsync.calledOnce).to.be.true;
    const args = sendAsync.firstCall.args[0];
    expect(args.params[0]).to.deep.equal(tx.options);
    expect(args.method).to.equal("eth_sendTransaction");
  });

  it("chains calls", async () => {
    const tx = Transaction({
      options: {
        from: "0xe8d3266f3c4f083ab8864b5e04aea7b087044e49",
        to: "0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8",
        value: "0xf4240",
      },
    });

    const resultStub = sinon.stub();
    resultStub.returns(utils.STUB_TXHASH);
    const provider = utils.stubbedProvider(resultStub);
    const sendAsync = sinon.spy(provider, "sendAsync");
    const MAP_RESULT_1 = "MAP RESULT 1";
    const MAP_RESULT_2 = "MAP RESULT 2";

    const mappedTx1 = tx.map((txhash, providerArg) => {
      expect(txhash).to.be.equal(utils.STUB_TXHASH);
      expect(providerArg).to.be.equal(provider);
      return MAP_RESULT_1;
    });

    const mappedTx2 = mappedTx1.map((result, providerArg) => {
      expect(result).to.be.equal(MAP_RESULT_1);
      expect(providerArg).to.be.equal(provider);
      return MAP_RESULT_2;
    });

    const result = await mappedTx2.transact(provider);
    expect(result).to.be.equal(MAP_RESULT_2);

    // Ensure that the transaction happened normally.
    expect(sendAsync.calledOnce).to.be.true;
    const args = sendAsync.firstCall.args[0];
    expect(args.params[0]).to.deep.equal(tx.options);
    expect(args.method).to.equal("eth_sendTransaction");
  });
});
