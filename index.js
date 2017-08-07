// based on http://redux.js.org/docs/recipes/ReducingBoilerplate.html#async-action-creators

export default function apiMiddleware ({
	dispatch, getState
}) {
	return (next) => (action) => {
		const {
			types, callAPI, onStart, onSuccess, onError, shouldCallAPI = () => true, payload = {}
		} = action;

		if (!types) {
			// Normal action: pass it on
			return next(action);
		}

		// types must contain three string types
		if (!Array.isArray(types) || types.length !== 3 || !types.every((type) => typeof type === 'string')) {
			throw new Error('Expected an array of three string types.');
		}

		if (typeof callAPI !== 'function') {
			throw new Error('Expected callAPI to be a function.');
		}

		if (!shouldCallAPI({
			getState
		})) {
			return Promise.resolve();
		}

		const [START, SUCCESS, ERROR] = types;

		dispatch({
			type: START,
			payload,
		});

		if (typeof onStart === 'function') {
			onStart({
				dispatch,
				getState,
				payload,
			});
		}

		return callAPI({
			dispatch,
			getState,
			payload,
		})
			.then((response) => {
				dispatch({
					type: SUCCESS,
					payload,
					response,
				});

				if (typeof onSuccess === 'function') {
					onSuccess({
						dispatch,
						getState,
						payload,
						response,
					});
				}

				return response;
			})
			.catch((error) => {
				dispatch({
					type: ERROR,
					payload,
					error,
				});

				if (typeof onError === 'function') {
					onError({
						dispatch,
						getState,
						payload,
						error,
					});
				}

				return Promise.reject(error);
			});
	};
}
