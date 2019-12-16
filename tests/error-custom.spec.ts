/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions, no-new */

import { expect } from 'chai';
import sinon from 'sinon';
import uuid from 'uuid';
import winston from 'winston';
import ErrorCustom from '../src/lib/error-custom';

const sandbox = sinon.createSandbox();

const ELASTIC_LOGGING_URL = 'http://localhost:9200/';

describe('Error Custom', () => {
  beforeEach(() => {
    sandbox.restore();
  });

  describe('Validation', () => {
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

  describe('General logging', () => {
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
  });

  describe('Elastic', () => {
    it('Extend base error with custom logger - ES ENV', () => {
      sandbox.stub(process, 'env').value({
        ELASTIC_LOGGING_URL,
      });
      const sendToElasticFunc = sandbox.stub((ErrorCustom as any), 'sendToElastic').resolves();
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
        expect(sendToElasticFunc.callCount).to.be.gte(1);
      }
    });

    it('Extend base error with custom logger - ES String', () => {
      const esTestsLocation = `http://${uuid()}.example.com`;
      const sendToElasticFunc = sandbox.stub((ErrorCustom as any), 'sendToElastic').resolves();
      try {
        try {
          // tslint:disable-next-line: prefer-const
          let readyToFail;
          readyToFail.toString();
          expect('this should not be hit').to.equal(0);
        } catch (error) {
          throw new ErrorCustom('It blew up', 500, 101, error, esTestsLocation);
        }
      } catch (error) {
        expect(error).to.be.instanceof(ErrorCustom);
        expect(error.message).to.equal('It blew up');
        expect(error.innerException.message).to.equal('Cannot read property \'toString\' of undefined');
        expect(error.statusCode).to.equal(500);
        expect(error.errorCode).to.equal(101);
        expect(error.manuallyThrown).to.be.true;
        expect(error.stack).to.be.not.undefined;
        expect(sendToElasticFunc.callCount).to.be.gte(1);
        expect(sendToElasticFunc.args[0][0]).to.eql(esTestsLocation);
      }
    });

    it('Extend base error with custom logger - ES Malformed String', () => {
      const sendToElasticFunc = sandbox.stub((ErrorCustom as any), 'sendToElastic').resolves();
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
        expect(sendToElasticFunc.callCount).to.be.lt(1);
      }
    });

    it('Send to ES', async () => {
      const errorFunc = sandbox.stub(winston, 'createLogger').returns({
        error: () => { },
      } as any);
      await (ErrorCustom as any).sendToElastic(ELASTIC_LOGGING_URL, uuid(), {});
      expect(errorFunc.callCount).to.be.gte(1);
    });

    it('Send to ES - predefined index', async () => {
      sandbox.stub(process, 'env').value({
        ELASTIC_LOGGING_INDEX: uuid(),
      });
      const errorFunc = sandbox.stub(winston, 'createLogger').returns({
        error: () => { },
      } as any);
      await (ErrorCustom as any).sendToElastic(ELASTIC_LOGGING_URL, uuid(), {});
      expect(errorFunc.callCount).to.be.gte(1);
    });

    describe('Environment Variables', () => {
      it('ELASTIC_PING_TIMEOUT set to number', async () => {
        sandbox.stub(process, 'env').value({
          ELASTIC_LOGGING_INDEX: uuid(),
          ELASTIC_PING_TIMEOUT: '1000',
        });
        const errorFunc = sandbox.stub(winston, 'createLogger').returns({
          error: () => { },
        } as any);
        await (ErrorCustom as any).sendToElastic(ELASTIC_LOGGING_URL, uuid(), {});
        expect(errorFunc.callCount).to.be.gte(1);
      });

      it('ELASTIC_REQUEST_TIMEOUT set to number', async () => {
        sandbox.stub(process, 'env').value({
          ELASTIC_LOGGING_INDEX: uuid(),
          ELASTIC_REQUEST_TIMEOUT: '1000',
        });
        const errorFunc = sandbox.stub(winston, 'createLogger').returns({
          error: () => { },
        } as any);
        await (ErrorCustom as any).sendToElastic(ELASTIC_LOGGING_URL, uuid(), {});
        expect(errorFunc.callCount).to.be.gte(1);
      });

      it('ELASTIC_FLUSH_INTERVAL set to number', async () => {
        sandbox.stub(process, 'env').value({
          ELASTIC_LOGGING_INDEX: uuid(),
          ELASTIC_FLUSH_INTERVAL: '1000',
        });
        const errorFunc = sandbox.stub(winston, 'createLogger').returns({
          error: () => { },
        } as any);
        await (ErrorCustom as any).sendToElastic(ELASTIC_LOGGING_URL, uuid(), {});
        expect(errorFunc.callCount).to.be.gte(1);
      });
    });
  });
});
