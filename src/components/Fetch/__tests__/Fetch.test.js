import { render, screen, fireEvent, act } from '@testing-library/react';
import Fetch from '../Fetch';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('Fetch Component', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });

  // Test 1: Initial State Test
  test('starts without any joke', () => {
    render(<Fetch />);
    expect(screen.queryByTestId('fetch-joke')).not.toBeInTheDocument();
  });

  // Test 2: Loading State Test
  test('displays loading message when button is clicked', async () => {
    let resolveFetch;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });

    global.fetch.mockImplementationOnce(() => fetchPromise);
    
    render(<Fetch />);
    await act(async () => {
      fireEvent.click(screen.getByText('Get a Chuck Norris joke'));
    });
    
    expect(screen.getByTestId('fetch-loading')).toBeInTheDocument();
  });

  // Test 3: Success State Test
  test('displays joke when API succeeds', async () => {
    let resolveFetch;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });

    global.fetch.mockImplementationOnce(() => fetchPromise);

    render(<Fetch />);
    
    await act(async () => {
      fireEvent.click(screen.getByText('Get a Chuck Norris joke'));
    });

    await act(async () => {
      await resolveFetch({
        status: 200,
        json: () => Promise.resolve({
          value: "Chuck Norris counted to infinity. Twice."
        })
      });
    });

    expect(screen.getByTestId('fetch-joke')).toHaveTextContent('Chuck Norris counted to infinity. Twice.');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe('https://api.chucknorris.io/jokes/random');
  });
});
