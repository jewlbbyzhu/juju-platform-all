import { socialApi } from '../../src/api/social';
import api from '../../src/api/index';

jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('socialApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should get feed without params', async () => {
      const mockResponse = { data: [{ id: 1, content: 'Post 1' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await socialApi.getFeed();

      expect(api.get).toHaveBeenCalledWith('/social/feed', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get feed with params', async () => {
      const mockResponse = { data: [] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = { page: 1, limit: 10 };
      await socialApi.getFeed(params);

      expect(api.get).toHaveBeenCalledWith('/social/feed', { params });
    });
  });

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const mockResponse = { data: { id: 'post123', success: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { content: 'Hello World', images: ['img1.jpg'] };
      const result = await socialApi.createPost(data);

      expect(api.post).toHaveBeenCalledWith('/social/posts', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('likePost', () => {
    it('should like post successfully', async () => {
      const mockResponse = { data: { success: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await socialApi.likePost('post123');

      expect(api.post).toHaveBeenCalledWith('/social/posts/post123/like');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('unlikePost', () => {
    it('should unlike post successfully', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await socialApi.unlikePost('post123');

      expect(api.delete).toHaveBeenCalledWith('/social/posts/post123/like');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('commentPost', () => {
    it('should comment on post successfully', async () => {
      const mockResponse = { data: { id: 'comment1' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { content: 'Nice post!' };
      const result = await socialApi.commentPost('post123', data);

      expect(api.post).toHaveBeenCalledWith('/social/posts/post123/comments', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getComments', () => {
    it('should get comments without params', async () => {
      const mockResponse = { data: [{ id: 1, content: 'Comment 1' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await socialApi.getComments('post123');

      expect(api.get).toHaveBeenCalledWith('/social/posts/post123/comments', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get comments with params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await socialApi.getComments('post123', { page: 2 });

      expect(api.get).toHaveBeenCalledWith('/social/posts/post123/comments', { params: { page: 2 } });
    });
  });

  describe('sharePost', () => {
    it('should share post successfully', async () => {
      const mockResponse = { data: { shareCount: 10 } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await socialApi.sharePost('post123');

      expect(api.post).toHaveBeenCalledWith('/social/posts/post123/share');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserPosts', () => {
    it('should get user posts without params', async () => {
      const mockResponse = { data: [{ id: 1 }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await socialApi.getUserPosts('user123');

      expect(api.get).toHaveBeenCalledWith('/social/users/user123/posts', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get user posts with params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await socialApi.getUserPosts('user123', { page: 1, limit: 5 });

      expect(api.get).toHaveBeenCalledWith('/social/users/user123/posts', { params: { page: 1, limit: 5 } });
    });
  });
});
