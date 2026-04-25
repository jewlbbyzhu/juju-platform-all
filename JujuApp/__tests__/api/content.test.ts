import { contentApi } from '../../src/api/content';
import api from '../../src/api/index';

jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('contentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContents', () => {
    it('should get contents with default params', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Content 1' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await contentApi.getContents();

      expect(api.get).toHaveBeenCalledWith('/content', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should get contents with custom params', async () => {
      const mockResponse = { data: [] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = { page: 1, category: 'news' };
      await contentApi.getContents(params);

      expect(api.get).toHaveBeenCalledWith('/content', { params });
    });
  });

  describe('getContentDetail', () => {
    it('should get content detail by string id', async () => {
      const mockResponse = { data: { id: 'abc', title: 'Detail' } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await contentApi.getContentDetail('abc');

      expect(api.get).toHaveBeenCalledWith('/content/abc');
      expect(result).toEqual(mockResponse);
    });

    it('should get content detail by number id', async () => {
      const mockResponse = { data: { id: 123, title: 'Detail' } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await contentApi.getContentDetail(123);

      expect(api.get).toHaveBeenCalledWith('/content/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBanners', () => {
    it('should get banners with default position', async () => {
      const mockResponse = { data: [{ id: 1, image: 'banner1.jpg' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await contentApi.getBanners();

      expect(api.get).toHaveBeenCalledWith('/content/banners', { params: { position: 'home' } });
      expect(result).toEqual(mockResponse);
    });

    it('should get banners with custom position', async () => {
      const mockResponse = { data: [] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await contentApi.getBanners('profile');

      expect(api.get).toHaveBeenCalledWith('/content/banners', { params: { position: 'profile' } });
    });
  });

  describe('getAnnouncements', () => {
    it('should get announcements with default params', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Announcement' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await contentApi.getAnnouncements();

      expect(api.get).toHaveBeenCalledWith('/content/announcements', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should get announcements with custom params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await contentApi.getAnnouncements({ limit: 5 });

      expect(api.get).toHaveBeenCalledWith('/content/announcements', { params: { limit: 5 } });
    });
  });

  describe('getAnnouncementDetail', () => {
    it('should get announcement detail by string id', async () => {
      const mockResponse = { data: { id: 'ann1', content: 'Content' } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await contentApi.getAnnouncementDetail('ann1');

      expect(api.get).toHaveBeenCalledWith('/content/announcements/ann1');
      expect(result).toEqual(mockResponse);
    });

    it('should get announcement detail by number id', async () => {
      const mockResponse = { data: { id: 1 } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await contentApi.getAnnouncementDetail(1);

      expect(api.get).toHaveBeenCalledWith('/content/announcements/1');
      expect(result).toEqual(mockResponse);
    });
  });
});
