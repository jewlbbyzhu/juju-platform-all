import { favoriteApi } from '../../src/api/favorites';
import api from '../../src/api/index';

jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('favoriteApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should get favorites with default params', async () => {
      const mockResponse = { data: [{ id: 1, targetId: 100 }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoriteApi.getFavorites();

      expect(api.get).toHaveBeenCalledWith('/favorites', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should get favorites with custom params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await favoriteApi.getFavorites({ page: 1, type: 'party' });

      expect(api.get).toHaveBeenCalledWith('/favorites', { params: { page: 1, type: 'party' } });
    });
  });

  describe('addFavorite', () => {
    it('should add favorite with string targetId', async () => {
      const mockResponse = { data: { id: 1, success: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { targetId: 'party123', type: 'party' };
      const result = await favoriteApi.addFavorite(data);

      expect(api.post).toHaveBeenCalledWith('/favorites', data);
      expect(result).toEqual(mockResponse);
    });

    it('should add favorite with number targetId', async () => {
      const mockResponse = { data: { id: 2 } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { targetId: 456, type: 'user' };
      const result = await favoriteApi.addFavorite(data);

      expect(api.post).toHaveBeenCalledWith('/favorites', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite by string id', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoriteApi.removeFavorite('fav123');

      expect(api.delete).toHaveBeenCalledWith('/favorites/fav123');
      expect(result).toEqual(mockResponse);
    });

    it('should remove favorite by number id', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoriteApi.removeFavorite(123);

      expect(api.delete).toHaveBeenCalledWith('/favorites/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkFavorite', () => {
    it('should check favorite by string targetId', async () => {
      const mockResponse = { data: { isFavorited: true } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoriteApi.checkFavorite('party123');

      expect(api.get).toHaveBeenCalledWith('/favorites/check/party123');
      expect(result).toEqual(mockResponse);
    });

    it('should check favorite by number targetId', async () => {
      const mockResponse = { data: { isFavorited: false } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoriteApi.checkFavorite(456);

      expect(api.get).toHaveBeenCalledWith('/favorites/check/456');
      expect(result).toEqual(mockResponse);
    });
  });
});
