// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => {
	const React = require('react');
	const Fragment = React.Fragment;

	const passThrough = ({ children }) => React.createElement(Fragment, null, children);

	return {
		__esModule: true,
		BrowserRouter: passThrough,
		Routes: passThrough,
		Route: ({ element = null, children = null }) => element || React.createElement(Fragment, null, children),
		useNavigate: () => () => {},
		useLocation: () => ({ pathname: '/' }),
		useParams: () => ({}),
		Link: ({ children }) => React.createElement(Fragment, null, children),
	};
}, { virtual: true });

jest.mock('axios', () => {
	const handlers = {
		get: jest.fn(() => Promise.resolve({ data: {} })),
		post: jest.fn(() => Promise.resolve({ data: {} })),
		put: jest.fn(() => Promise.resolve({ data: {} })),
		delete: jest.fn(() => Promise.resolve({ data: {} })),
	};

	return {
		__esModule: true,
		default: handlers,
		...handlers,
		create: () => handlers,
	};
}, { virtual: true });

jest.mock('./firebase', () => ({
	db: {},
}), { virtual: true });

jest.mock('./hooks/useAuth', () => ({
	useAuth: () => ({ user: null, loading: false }),
}), { virtual: true });

jest.mock('./hooks/useSavedRamsDocuments', () => ({
	useSavedRamsDocuments: () => ({
		documents: [],
		loading: false,
		indexWarning: false,
		deleteDocument: jest.fn(async () => {}),
	}),
}), { virtual: true });

jest.mock('firebase/firestore', () => {
	const asyncNoop = jest.fn(async () => {});
	return {
		__esModule: true,
		collection: jest.fn(() => ({})),
		doc: jest.fn(() => ({})),
		getDocs: jest.fn(async () => ({
			docs: [],
			forEach: () => {},
		})),
		setDoc: asyncNoop,
		deleteDoc: asyncNoop,
		addDoc: jest.fn(async () => ({ id: 'mock-doc-id' })),
		updateDoc: asyncNoop,
		getDoc: jest.fn(async () => ({
			exists: () => false,
			data: () => ({}),
		})),
		serverTimestamp: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })),
	};
}, { virtual: true });
