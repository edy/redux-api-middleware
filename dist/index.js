'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = apiMiddleware;
// based on http://redux.js.org/docs/recipes/ReducingBoilerplate.html#async-action-creators

function apiMiddleware(_ref) {
	var dispatch = _ref.dispatch,
	    getState = _ref.getState;

	return function (next) {
		return function (action) {
			var types = action.types,
			    callAPI = action.callAPI,
			    onStart = action.onStart,
			    onSuccess = action.onSuccess,
			    onError = action.onError,
			    _action$shouldCallAPI = action.shouldCallAPI,
			    shouldCallAPI = _action$shouldCallAPI === undefined ? function () {
				return true;
			} : _action$shouldCallAPI,
			    _action$payload = action.payload,
			    payload = _action$payload === undefined ? {} : _action$payload;


			if (!types) {
				// Normal action: pass it on
				return next(action);
			}

			// types must contain three string types
			if (!Array.isArray(types) || types.length !== 3 || !types.every(function (type) {
				return typeof type === 'string';
			})) {
				throw new Error('Expected an array of three string types.');
			}

			if (typeof callAPI !== 'function') {
				throw new Error('Expected callAPI to be a function.');
			}

			if (!shouldCallAPI({
				getState: getState
			})) {
				return Promise.resolve();
			}

			var _types = _slicedToArray(types, 3),
			    START = _types[0],
			    SUCCESS = _types[1],
			    ERROR = _types[2];

			dispatch({
				type: START,
				payload: payload
			});

			if (typeof onStart === 'function') {
				onStart({
					dispatch: dispatch,
					getState: getState,
					payload: payload
				});
			}

			return callAPI({
				dispatch: dispatch,
				getState: getState,
				payload: payload
			}).then(function (response) {
				dispatch({
					type: SUCCESS,
					payload: payload,
					response: response
				});

				if (typeof onSuccess === 'function') {
					onSuccess({
						dispatch: dispatch,
						getState: getState,
						payload: payload,
						response: response
					});
				}

				return response;
			}).catch(function (error) {
				dispatch({
					type: ERROR,
					payload: payload,
					error: error
				});

				if (typeof onError === 'function') {
					onError({
						dispatch: dispatch,
						getState: getState,
						payload: payload,
						error: error
					});
				}

				return Promise.reject(error);
			});
		};
	};
}
