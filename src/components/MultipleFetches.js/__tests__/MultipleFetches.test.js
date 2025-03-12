import { render, screen, fireEvent, act } from '@testing-library/react';
import MultipleFetches from '../MultipleFetches';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('MultipleFetches Component', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });

  // Test 1: Initial State Test
  test('starts without any post', () => {
    render(<MultipleFetches />);
    expect(screen.queryByTestId('fetch-post')).not.toBeInTheDocument();
  });

  // Test 2: Loading State Test
  test('displays loading message when button is clicked', async () => {
    let resolvePost;
    const postPromise = new Promise(resolve => {
      resolvePost = resolve;
    });

    global.fetch.mockImplementationOnce(() => postPromise);
    
    render(<MultipleFetches />);
    await act(async () => {
      fireEvent.click(screen.getByText('Fetch post and comments'));
    });
    
    expect(screen.getByTestId('fetch-loading-post')).toBeInTheDocument();
  });

  // Test 3: Success State Test
  test('displays post and comments when APIs succeed', async () => {
    let resolvePost, resolveComments;
    
    const postPromise = new Promise(resolve => {
      resolvePost = resolve;
    });
    
    const commentsPromise = new Promise(resolve => {
      resolveComments = resolve;
    });

    global.fetch.mockImplementationOnce(() => postPromise)
      .mockImplementationOnce(() => commentsPromise);

    render(<MultipleFetches />);
    
    await act(async () => {
      fireEvent.click(screen.getByText('Fetch post and comments'));
    });

    await act(async () => {
      await resolvePost({
        status: 200,
        json: () => Promise.resolve({
          title: "A Really Cool Title"
        })
      });
    });

    await act(async () => {
      await resolveComments({
        status: 200,
        json: () => Promise.resolve([
          { id: 1, name: "Daaimah" },
          { id: 2, name: "John" }
        ])
      });
    });

    expect(screen.getByTestId('fetch-post')).toHaveTextContent('A Really Cool Title');
    const commentAuthors = screen.getAllByTestId('comment-author');
    expect(commentAuthors).toHaveLength(2);
    expect(commentAuthors[0]).toHaveTextContent('Daaimah');
    expect(commentAuthors[1]).toHaveTextContent('John');
    expect(screen.getByTestId('multiple-fetch-success')).toBeInTheDocument();
  });
});
