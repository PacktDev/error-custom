/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies */

import { expect } from 'chai';
import ErrorCustom from '../src/lib/error-custom';

describe('Error Custom', () => {
  it('Constructing the instance', () => {
    const error = new ErrorCustom('Error Message', 400, 1000);
    expect(error).to.be.instanceof(Object);
    expect(error.message).to.equal('Error Message');
    expect(error.statusCode).to.equal(400);
    expect(error.errorCode).to.equal(1000);
    expect(error.manuallyThrown).to.be.true;
  });
});

