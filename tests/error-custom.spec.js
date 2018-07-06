/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions, no-new */

import { expect } from 'chai';
import sinon from 'sinon';
import ErrorCustom from '../src/lib/error-custom';

describe('Error Custom', () => {
  it('Constructing the instance', () => {
    const error = new ErrorCustom('Error Message', 400, 1000);
    expect(error).to.be.instanceof(ErrorCustom);
    expect(error.message).to.equal('Error Message');
    expect(error.statusCode).to.equal(400);
    expect(error.errorCode).to.equal(1000);
    expect(error.manuallyThrown).to.be.true;
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
    }
  });

  it('invalid statusCode fails', () => {
    try {
      new ErrorCustom('message', 'lemon', 1000000);
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('Invalid value for statusCode parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
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
    }
  });

  it('invalid errorCode fails', () => {
    try {
      new ErrorCustom('message', 200, { test: 'string' });
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('Invalid value for errorCode parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
    }
  });

  it('undefined errorCode fails', () => {
    try {
      new ErrorCustom('message', 200);
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('Invalid value for errorCode parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
    }
  });

  it('compound errors', () => {
    try {
      new ErrorCustom('message');
      expect('this should not be hit').to.equal(0);
    } catch (error) {
      expect(error).to.be.instanceof(ErrorCustom);
      expect(error.message).to.equal('Invalid value for statusCode parameter, Invalid value for errorCode parameter');
      expect(error.statusCode).to.equal(500);
      expect(error.errorCode).to.equal(1000200);
      expect(error.manuallyThrown).to.be.true;
    }
  });

  it('Extend base error', () => {
    try {
      try {
        undefined.toString();
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
    }
  });
  it('Extend base error with custom logger', () => {
    const spy = sinon.spy();

    try {
      try {
        undefined.toString();
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
    }
  });
});

