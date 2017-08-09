# Redux API Middleware [![npm](https://img.shields.io/npm/v/@edy/redux-api-middleware.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/@edy/redux-api-middleware) [![Build Status](https://travis-ci.org/edy/redux-api-middleware.svg?branch=master)](https://travis-ci.org/edy/redux-api-middleware)

A simple middleware based on the one from the [Redux Docs](http://redux.js.org/docs/recipes/ReducingBoilerplate.html).

## Installation
```
  npm install @edy/redux-api-middleware
```

## Usage
Please see [Middleware Docs](http://redux.js.org/docs/advanced/Middleware.html) on how to add middleware to redux. This is how i use it:

```js
import { createStore, applyMiddleware } from 'redux';
import apiMiddleware from '@edy/redux-api-middleware';
import rootReducer from './reducers/index';

const store = createStore(
  rootReducer,
  applyMiddleware(apiMiddleware)
);
```

Sample Action:
```js
export function setToken (newToken) {
	return {
		types: [START, SUCCESS, ERROR],
		payload: {
			token: newToken
		},
		shouldCallAPI: (state) => {
			const { token, tokenSentToServer, tokenDidInvalidate, tokenSentToServerOn, tokenIsUpdating } = state.settings;
			const lastUpdated = new Date() - new Date(tokenSentToServerOn);

			if (token !== newToken) {
				return true;
			} else if (tokenIsUpdating) {
				return false;
			} else if (lastUpdated > 86400000) { // 86400s = 24h
				return true;
			} else if (!tokenSentToServer) {
				return true;
			}

			return tokenDidInvalidate;
		},
		callAPI: ({ dispatch, getState, payload}) => api.setToken(newToken).then((data) => newToken),
		onStart: ({ dispatch, getState, payload}) => {
			// do something before the api is called
		},
		onSuccess: ({ dispatch, getState, payload, response }) => {
			// do something after api was called
		},
		onError: ({ dispatch, getState, payload, error }) => {
			// do something after an error occured, maybe display a notification
		},
	};
};
```

Then somewhere in your code:
```js
dispatch(setToken(1234567890));
```

Reducer:
```js
switch (action.type) {
	case START:
		return {
			...state,
			tokenSentToServer: false,
			tokenIsUpdating: true
		};

	case SUCCESS:
		return {
			...state,
			token: action.payload.token,
			tokenSentToServer: true,
			tokenDidInvalidate: false,
			tokenIsUpdating: false
		};

	case ERROR:
		return {
			...state,
			tokenSentToServer: false,
			tokenIsUpdating: false
		};
	default:
		return state;
}
```
