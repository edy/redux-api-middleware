import { expect } from 'chai';
import sinon from 'sinon';

import apiMiddleware from './index.js';

const create = () => {
	const store = {
		getState: sinon.stub().returns({}),
		dispatch: sinon.stub(),
	};
	const next = sinon.stub();

	const invoke = (action) => apiMiddleware(store)(next)(action);

	return {
		store,
		next,
		invoke,
	};
};

describe('apiMiddleware', () => {
	let shouldCallAPI, callAPI, onStart, onSuccess, onError, payload;

	beforeEach(() => {
		shouldCallAPI = sinon.stub().returns(true);
		callAPI = sinon.stub().returns(Promise.resolve('my response'));
		onStart = sinon.stub();
		onSuccess = sinon.stub();
		onError = sinon.stub();
		payload = {
			userId: 42,
		};
	});

	it(`passes through non-api action`, () => {
		const {
			next, invoke
		} = create();
		const action = {
			type: 'TEST',
		};
		invoke(action);
		expect(next.calledWith(action), 'next was not called with action').to.be.true;
	});

	it(`sould call no functions if shouldCallAPI returns false`, (done) => {
		const {
			next, invoke, store
		} = create();

		shouldCallAPI = sinon.stub().returns(false);

		const action = {
			types: ['START', 'SUCCESS', 'ERROR'],
			shouldCallAPI,
			callAPI,
			onStart,
			onSuccess,
			onError,
			payload,
		};

		invoke(action)
			.then(() => {
				expect(
					shouldCallAPI.calledWith({
						getState: store.getState,
					}),
					'shouldCallAPI was not called with...'
				).to.be.true;

				expect(callAPI.called, 'callAPI was called').to.be.false;
				expect(onStart.called, 'onStart was called').to.be.false;
				expect(onSuccess.called, 'onSuccess was called').to.be.false;
				expect(onError.called, 'onError was called').to.be.false;

				done();
			})
			.catch(done);
	});

	it(`calls success functions`, (done) => {
		const {
			next, invoke, store
		} = create();

		const action = {
			types: ['START', 'SUCCESS', 'ERROR'],
			shouldCallAPI,
			callAPI,
			onStart,
			onSuccess,
			onError,
			payload,
		};

		invoke(action)
			.then(() => {
				expect(
					shouldCallAPI.calledWith({
						getState: store.getState,
					}),
					'shouldCallAPI was not called with...'
				).to.be.true;

				expect(
					callAPI.calledWith({
						dispatch: store.dispatch,
						getState: store.getState,
						payload: action.payload,
					}),
					'callAPI was not called with...'
				).to.be.true;
				expect(
					onStart.calledWith({
						dispatch: store.dispatch,
						getState: store.getState,
						payload: action.payload,
					}),
					'onStart was not called with...'
				).to.be.true;
				expect(
					onSuccess.calledWith({
						dispatch: store.dispatch,
						getState: store.getState,
						payload: action.payload,
						response: 'my response',
					}),
					'onSuccess was not called with...'
				).to.be.true;
				expect(onError.called, 'onError was called').to.be.false;

				done();
			})
			.catch(done);
	});

	it(`calls error functions`, (done) => {
		const {
			next, invoke, store
		} = create();

		callAPI = sinon.stub().returns(Promise.reject(new Error('my rejection')));

		const action = {
			types: ['START', 'SUCCESS', 'ERROR'],
			shouldCallAPI,
			callAPI,
			onStart,
			onSuccess,
			onError,
			payload,
		};

		invoke(action)
			.then(() => {
				expect.fail(0, 1, 'then() was called');
			})
			.catch((e) => {

				expect(
					shouldCallAPI.calledWith({
						getState: store.getState,
					}),
					'shouldCallAPI was not called with...'
				).to.be.true;

				expect(
					callAPI.calledWith({
						dispatch: store.dispatch,
						getState: store.getState,
						payload: action.payload,
					}),
					'callAPI was not called with...'
				).to.be.true;

				expect(
					onStart.calledWith({
						dispatch: store.dispatch,
						getState: store.getState,
						payload: action.payload,
					}),
					'onStart was not called with...'
				).to.be.true;

				expect(onSuccess.called, 'onSuccess was called').to.be.false;

				expect(
					onError.calledWith({
						dispatch: store.dispatch,
						getState: store.getState,
						payload: action.payload,
						error: e,
					}),
					'onerror was not called with...'
				).to.be.true;

				done();
			})
			.catch(done);
	});
});
