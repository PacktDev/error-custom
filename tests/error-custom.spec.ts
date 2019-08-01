/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions, no-new */
// tslint:disable: no-unused-expression

import { expect } from 'chai';
import sinon from 'sinon';
import errorCustom from '../src/lib/error-custom';

describe('Error Custom', () => {
  it('Constructing the instance', () => {
    const error = new errorCustom('Error Message', 400, 1000);
    expect(error).to.be.instanceof(errorCustom);
    expect(error.message).to.equal('Error Message');
    expect(error.statusCode).to.equal(400);
    expect(error.errorCode).to.equal(1000);
    expect(error.manuallyThrown).to.be.true;
    expect(error.stack).to.be.not.undefined;
  });

  it('undefined message fails', () => {
    try {
      new errorCustom(undefined, 200, 1000000);
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(errorCustom);
      expect(error.message).to.equal('Invalid value for message parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });

  it('undefined statusCode fails', () => {
    try {
      new errorCustom('message', undefined, 1000000);
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(errorCustom);
      expect(error.message).to.equal('Invalid value for statusCode parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });

  it('Extend base error', () => {
    try {
      try {
        // tslint:disable-next-line: prefer-const
        let readyToFail;
        readyToFail.toString();
        expect('this should not be hit').to.equal(0);
      } catch (error) {
        throw new errorCustom('It blew up', 500, 101, error);
      }
    } catch (error) {
      expect(error).to.be.instanceof(errorCustom);
      expect(error.message).to.equal('It blew up');
      expect(error.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(101);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });
  it('Extend base error with custom logger', () => {
    const spy = sinon.spy();

    try {
      try {
        // tslint:disable-next-line: prefer-const
        let readyToFail;
        readyToFail.toString();
        expect('this should not be hit').to.equal(0);
      } catch (error) {
        throw new errorCustom('It blew up', 500, 101, error, spy);
      }
    } catch (error) {
      expect(spy.called).to.equal(true);
      const result = spy.firstCall.args[1];
      expect(result).to.be.instanceof(errorCustom);
      expect(result.message).to.equal('It blew up');
      expect(result.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
      expect(result.statusCode).to.equal(500);
      expect(result.errorCode).to.equal(101);
      expect(result.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });
});
