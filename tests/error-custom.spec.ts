/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions, no-new */

import { expect } from 'chai';
import sinon from 'sinon';
import uuid from 'uuid';
import ErrorCustom from '../src/lib/error-custom';
import winston from 'winston';

const sandbox = sinon.createSandbox();

const ELASITC_LOGGING_URL = 'http://localhost:9200/';

describe('Error Custom', () => {
  beforeEach(() => {
    sandbox.restore();
  });
  it('Constructing the instance', () => {
    const error = new ErrorCustom('Error Message', 400, 1000);
    expect(error).to.be.instanceof(ErrorCustom);
    expect(error.message).to.equal('Error Message');
    expect(error.statusCode).to.equal(400);
    expect(error.errorCode).to.equal(1000);
    expect(error.manuallyThrown).to.be.true;
    expect(error.stack).to.be.not.undefined;
  });

  it('undefined message fails', () => {
    try {
      new ErrorCustom(undefined, 200, 1000000);
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('Invalid value for message parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });

  it('undefined statusCode fails', () => {
    try {
      new ErrorCustom('message', undefined, 1000000);
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('Invalid value for statusCode parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });

  it('undefined errorCode fails', () => {
    try {
      new ErrorCustom('message', 404, undefined);
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('Invalid value for errorCode parameter');
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
        throw new ErrorCustom('It blew up', 500, 101, error);
      }
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('It blew up');
      expect(error.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(101);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });
  it('Extend base error with custom logger - function', () => {
    const spy = sinon.spy();

    try {
      try {
        // tslint:disable-next-line: prefer-const
        let readyToFail;
        readyToFail.toString();
        expect('this should not be hit').to.equal(0);
      } catch (error) {
        throw new ErrorCustom('It blew up', 500, 101, error, spy);
      }
    } catch (error) {
      expect(spy.called).to.equal(true);
      const result = spy.firstCall.args[1];
      expect(result).to.be.instanceof(ErrorCustom);
      expect(result.message).to.equal('It blew up');
      expect(result.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
      expect(result.statusCode).to.equal(500);
      expect(result.errorCode).to.equal(101);
      expect(result.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });
  it('Extend base error with custom logger - ES ENV', () => {
    sandbox.stub(process, 'env').value({
      ELASITC_LOGGING_URL,
    });

    try {
      try {
        // tslint:disable-next-line: prefer-const
        let readyToFail;
        readyToFail.toString();
        expect('this should not be hit').to.equal(0);
      } catch (error) {
        throw new ErrorCustom('It blew up', 500, 101, error);
      }
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('It blew up');
      expect(error.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(101);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });
  it('Extend base error with custom logger - ES String', () => {
    try {
      try {
        // tslint:disable-next-line: prefer-const
        let readyToFail;
        readyToFail.toString();
        expect('this should not be hit').to.equal(0);
      } catch (error) {
        throw new ErrorCustom('It blew up', 500, 101, error, ELASITC_LOGGING_URL);
      }
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('It blew up');
      expect(error.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(101);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });
  it('Extend base error with custom logger - ES Malformed String', () => {
    try {
      try {
        // tslint:disable-next-line: prefer-const
        let readyToFail;
        readyToFail.toString();
        expect('this should not be hit').to.equal(0);
      } catch (error) {
        throw new ErrorCustom('It blew up', 500, 101, error, uuid());
      }
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('It blew up');
      expect(error.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(101);
      expect(error.manuallyThrown).to.be.true;
      expect(error.stack).to.be.not.undefined;
    }
  });
  it('Send to ES', async () => {
    const errorFunc = sandbox.stub(winston, 'createLogger').returns({
      'error': () => {}
    } as any);
    await (ErrorCustom as any).sendToElastic(ELASITC_LOGGING_URL)
    expect(errorFunc.callCount).to.be.gte(1);
  });
  it('Send to ES - predefined index', async () => {
    sandbox.stub(process, 'env').value({
      ELASITC_LOGGING_INDEX: uuid(),
    });
    const errorFunc = sandbox.stub(winston, 'createLogger').returns({
      'error': () => {}
    } as any);
    await (ErrorCustom as any).sendToElastic(ELASITC_LOGGING_URL)
    expect(errorFunc.callCount).to.be.gte(1);
  });
});
