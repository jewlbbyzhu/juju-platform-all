import { partyApi, CreatePartyParams } from '../../src/api/party';
import api from '../../src/api/index';

// Mock api
jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    upload: jest.fn(),
  },
}));

// 数据验证工具函数
const validatePartyData = (data: any) => {
  expect(data).toBeDefined();
  expect(typeof data).toBe('object');
  if (data.id) expect(typeof data.id).toBe('number');
  if (data.title) expect(typeof data.title).toBe('string');
  if (data.description) expect(typeof data.description).toBe('string');
  if (data.category) expect(typeof data.category).toBe('string');
  if (data.theme) expect(typeof data.theme).toBe('string');
  if (data.city) expect(typeof data.city).toBe('string');
  if (data.address) expect(typeof data.address).toBe('string');
  if (data.max_participants) expect(typeof data.max_participants).toBe('number');
  if (data.status) expect(typeof data.status).toBe('number');
  if (data.ticket_types) {
    expect(Array.isArray(data.ticket_types)).toBe(true);
    data.ticket_types.forEach((ticket: any) => {
      expect(ticket).toHaveProperty('name');
      expect(ticket).toHaveProperty('type');
      expect(ticket).toHaveProperty('price');
      expect(ticket).toHaveProperty('available_count');
    });
  }
};

const validateTicketTypeData = (data: any) => {
  expect(data).toBeDefined();
  expect(typeof data).toBe('object');
  expect(data).toHaveProperty('name');
  expect(data).toHaveProperty('type');
  expect(data).toHaveProperty('price');
  expect(data).toHaveProperty('available_count');
  expect(typeof data.name).toBe('string');
  expect(typeof data.type).toBe('number');
  expect(typeof data.price).toBe('number');
  expect(typeof data.available_count).toBe('number');
};

describe('partyApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getParties', () => {
    it('should get parties with default params and validate data structure', async () => {
      const mockParties = { 
        data: [
          { 
            id: 1, 
            title: 'Party 1', 
            description: 'Description 1',
            category: 'music',
            theme: 'party',
            city: '北京',
            address: '地址1',
            max_participants: 100,
            status: 1,
            ticket_types: [
              { name: '普通票', type: 1, price: 100, available_count: 50 }
            ]
          }, 
          { 
            id: 2, 
            title: 'Party 2',
            description: 'Description 2',
            category: 'sports',
            theme: 'sports',
            city: '上海',
            address: '地址2',
            max_participants: 200,
            status: 1,
            ticket_types: [
              { name: 'VIP票', type: 2, price: 200, available_count: 30 }
            ]
          }
        ] 
      };
      (api.get as jest.Mock).mockResolvedValue(mockParties);

      const result = await partyApi.getParties();

      expect(api.get).toHaveBeenCalledWith('/parties', { params: {} });
      expect(result).toEqual(mockParties);
      
      // 数据验证
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
      
      // 验证每个聚会数据结构
      result.data.forEach((party: any) => {
        validatePartyData(party);
      });
      
      // 验证具体数据值
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].title).toBe('Party 1');
      expect(result.data[0].category).toBe('music');
      expect(result.data[0].max_participants).toBe(100);
      
      // 验证票种数据
      expect(result.data[0].ticket_types).toHaveLength(1);
      validateTicketTypeData(result.data[0].ticket_types[0]);
      expect(result.data[0].ticket_types[0].name).toBe('普通票');
      expect(result.data[0].ticket_types[0].price).toBe(100);
    });

    it('should get parties with custom params', async () => {
      const mockParties = { data: [{ id: 1, title: 'Party 1' }] };
      (api.get as jest.Mock).mockResolvedValue(mockParties);

      const params = { page: 1, pageSize: 10, category: 'music' };
      await partyApi.getParties(params);

      expect(api.get).toHaveBeenCalledWith('/parties', { params });
    });

    it('should handle error', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(partyApi.getParties()).rejects.toThrow('Network Error');
    });
  });

  describe('getPartyDetail', () => {
    it('should get party detail by id (number) and validate complete data', async () => {
      const mockParty = {
        data: {
          id: 1,
          title: 'Test Party',
          description: 'Description',
          category: 'music',
          theme: 'party',
          city: '北京',
          address: '测试地址',
          max_participants: 100,
          status: 1,
          start_time: '2025-04-01T14:00:00',
          end_time: '2025-04-01T18:00:00',
          ticket_types: [
            { name: '普通票', type: 1, price: 100, available_count: 50, description: '普通票描述' },
            { name: 'VIP票', type: 2, price: 200, available_count: 20, description: 'VIP票描述' }
          ],
          images: ['image1.jpg', 'image2.jpg'],
          is_featured: true,
          requires_approval: false,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockParty);

      const result = await partyApi.getPartyDetail(1);

      expect(api.get).toHaveBeenCalledWith('/parties/1');
      expect(result).toEqual(mockParty);
      
      // 完整数据验证
      validatePartyData(result.data);
      expect(result.data.id).toBe(1);
      expect(result.data.title).toBe('Test Party');
      expect(result.data.city).toBe('北京');
      expect(result.data.max_participants).toBe(100);
      expect(result.data.is_featured).toBe(true);
      
      // 验证票种数组
      expect(result.data.ticket_types).toHaveLength(2);
      result.data.ticket_types.forEach((ticket: any) => {
        validateTicketTypeData(ticket);
      });
      
      // 验证具体票种数据
      expect(result.data.ticket_types[0].name).toBe('普通票');
      expect(result.data.ticket_types[0].price).toBe(100);
      expect(result.data.ticket_types[1].name).toBe('VIP票');
      expect(result.data.ticket_types[1].price).toBe(200);
      
      // 验证图片数组
      expect(result.data.images).toBeDefined();
      expect(Array.isArray(result.data.images)).toBe(true);
      expect(result.data.images).toHaveLength(2);
      expect(result.data.images[0]).toBe('image1.jpg');
    });

    it('should get party detail by id (string)', async () => {
      const mockParty = { data: { id: 'abc', title: 'Test Party' } };
      (api.get as jest.Mock).mockResolvedValue(mockParty);

      await partyApi.getPartyDetail('abc');

      expect(api.get).toHaveBeenCalledWith('/parties/abc');
    });

    it('should handle party not found', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: '活动不存在' } },
      });

      await expect(partyApi.getPartyDetail(999)).rejects.toBeDefined();
    });
  });

  describe('createParty', () => {
    it('should create party successfully with data validation', async () => {
      const createParams: CreatePartyParams = {
        title: 'New Party',
        category: 'music',
        theme: 'party',
        description: 'Description',
        start_time: '2025-04-01T14:00:00',
        end_time: '2025-04-01T18:00:00',
        city: '北京',
        address: '某地点',
        max_participants: 100,
        ticket_types: [
          {
            name: '普通票',
            type: 1,
            price: 100,
            available_count: 50,
          },
        ],
        images: ['image1.jpg'],
      };
      const mockResponse = { data: { id: 1, ...createParams } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await partyApi.createParty(createParams);

      expect(api.post).toHaveBeenCalledWith('/parties', createParams);
      expect(result).toEqual(mockResponse);
      
      // 验证返回数据
      validatePartyData(result.data);
      expect(result.data.id).toBe(1);
      expect(result.data.title).toBe('New Party');
      expect(result.data.ticket_types).toHaveLength(1);
      validateTicketTypeData(result.data.ticket_types[0]);
    });

    it('should create party with optional fields', async () => {
      const createParams: CreatePartyParams = {
        title: 'VIP Party',
        category: 'vip',
        theme: 'luxury',
        description: 'VIP Description',
        start_time: '2025-04-01T14:00:00',
        end_time: '2025-04-01T18:00:00',
        city: '上海',
        address: 'VIP地址',
        max_participants: 50,
        gender_limit: 1,
        min_age: 18,
        max_age: 45,
        ticket_types: [
          {
            name: 'VIP票',
            type: 2,
            price: 500,
            original_price: 600,
            available_count: 20,
            max_per_user: 2,
            description: 'VIP票描述',
          },
        ],
        images: ['vip1.jpg', 'vip2.jpg'],
        is_featured: true,
        requires_approval: true,
      };
      (api.post as jest.Mock).mockResolvedValue({ data: { id: 2 } });

      await partyApi.createParty(createParams);

      expect(api.post).toHaveBeenCalledWith('/parties', createParams);
    });
  });

  describe('updateParty', () => {
    it('should update party successfully', async () => {
      const updateData = { title: 'Updated Title', max_participants: 150 };
      const mockResponse = { data: { id: 1, ...updateData } };
      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await partyApi.updateParty(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/parties/1', updateData);
      expect(result).toEqual(mockResponse);
      
      // 验证更新后的数据
      expect(result.data.title).toBe('Updated Title');
      expect(result.data.max_participants).toBe(150);
    });

    it('should update party with string id', async () => {
      const updateData = { status: 2 };
      (api.put as jest.Mock).mockResolvedValue({ data: { id: 'abc' } });

      await partyApi.updateParty('abc', updateData);

      expect(api.put).toHaveBeenCalledWith('/parties/abc', updateData);
    });
  });

  describe('deleteParty', () => {
    it('should delete party successfully', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await partyApi.deleteParty(1);

      expect(api.delete).toHaveBeenCalledWith('/parties/1');
      expect(result).toEqual(mockResponse);
      expect(result.data.success).toBe(true);
    });
  });

  describe('getMyParties', () => {
    it('should get my parties with default params', async () => {
      const mockParties = { data: [{ id: 1, title: 'My Party' }] };
      (api.get as jest.Mock).mockResolvedValue(mockParties);

      const result = await partyApi.getMyParties();

      expect(api.get).toHaveBeenCalledWith('/parties/my', { params: {} });
      expect(result).toEqual(mockParties);
    });

    it('should get my parties with pagination', async () => {
      const mockParties = { data: [{ id: 1, title: 'My Party' }] };
      (api.get as jest.Mock).mockResolvedValue(mockParties);

      await partyApi.getMyParties({ page: 2, pageSize: 5 });

      expect(api.get).toHaveBeenCalledWith('/parties/my', { params: { page: 2, pageSize: 5 } });
    });
  });

  describe('searchParties', () => {
    it('should search parties by keyword', async () => {
      const mockParties = { data: [{ id: 1, title: 'Music Party' }] };
      (api.get as jest.Mock).mockResolvedValue(mockParties);

      const result = await partyApi.searchParties('music');

      expect(api.get).toHaveBeenCalledWith('/parties/search', { params: { keyword: 'music' } });
      expect(result).toEqual(mockParties);
    });

    it('should search parties with params', async () => {
      const mockParties = { data: [] };
      (api.get as jest.Mock).mockResolvedValue(mockParties);

      await partyApi.searchParties('party', { page: 1, category: 'sports' });

      expect(api.get).toHaveBeenCalledWith('/parties/search', {
        params: { page: 1, category: 'sports', keyword: 'party' },
      });
    });
  });

  describe('getFeaturedParties', () => {
    it('should get featured parties', async () => {
      const mockParties = { data: [{ id: 1, is_featured: true }] };
      (api.get as jest.Mock).mockResolvedValue(mockParties);

      const result = await partyApi.getFeaturedParties();

      expect(api.get).toHaveBeenCalledWith('/parties/featured');
      expect(result).toEqual(mockParties);
      expect(result.data[0].is_featured).toBe(true);
    });
  });

  describe('getCategories', () => {
    it('should get party categories', async () => {
      const mockCategories = { data: ['music', 'sports', 'art'] };
      (api.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await partyApi.getCategories();

      expect(api.get).toHaveBeenCalledWith('/parties/categories');
      expect(result).toEqual(mockCategories);
      expect(result.data).toContain('music');
      expect(result.data).toContain('sports');
      expect(result.data).toContain('art');
    });
  });

  describe('getThemes', () => {
    it('should get party themes', async () => {
      const mockThemes = { data: ['party', 'concert', 'workshop'] };
      (api.get as jest.Mock).mockResolvedValue(mockThemes);

      const result = await partyApi.getThemes();

      expect(api.get).toHaveBeenCalledWith('/parties/themes');
      expect(result).toEqual(mockThemes);
      expect(result.data).toContain('party');
      expect(result.data).toContain('concert');
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockResponse = { data: { url: 'https://example.com/uploaded.jpg' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await partyApi.uploadImage('/path/to/image.jpg');

      expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse);
      expect(result.data.url).toBe('https://example.com/uploaded.jpg');
    });

    it('should handle upload error', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await expect(partyApi.uploadImage('/invalid/path.jpg')).rejects.toThrow('Upload failed');
    });
  });
});