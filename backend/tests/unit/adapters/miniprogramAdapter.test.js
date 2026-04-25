const MiniprogramAdapter = require('../../../src/utils/adapters/miniprogramAdapter');

describe('MiniprogramAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new MiniprogramAdapter();
  });

  describe('adaptUser', () => {
    test('should adapt user data for miniprogram with simplified fields', () => {
      const user = {
        id: 1,
        nickname: 'John',
        avatar: 'avatar.jpg',
        gender: 1,
        is_vip: true,
        vip_expires_at: '2024-12-31T23:59:59Z',
        created_at: '2024-01-01T00:00:00Z',
        phone: '1234567890', // 敏感字段，应被过滤
        wechat_openid: 'openid123' // 敏感字段，应被过滤
      };
      
      const result = adapter.adaptUser(user);
      
      expect(result).toMatchObject({
        id: 1,
        nickname: 'John',
        avatar: 'avatar.jpg',
        gender: 1,
        vipStatus: 1,
        createTime: expect.any(String)
      });
      
      // 敏感字段应被过滤
      expect(result.phone).toBeUndefined();
      expect(result.wechatOpenid).toBeUndefined();
    });

    test('should handle non-VIP user', () => {
      const user = {
        id: 1,
        nickname: 'John',
        is_vip: false,
        created_at: '2024-01-01T00:00:00Z'
      };
      
      const result = adapter.adaptUser(user);
      
      expect(result.vipStatus).toBe(0);
    });
  });

  describe('adaptParty', () => {
    test('should adapt party data for miniprogram with simplified fields', () => {
      const party = {
        id: 1,
        title: 'Test Party',
        description: 'A test party',
        start_time: '2024-01-15T20:00:00Z',
        end_time: '2024-01-15T23:00:00Z',
        location: 'Test Location',
        max_participants: 50,
        current_participants: 25,
        price_mode: 1,
        gender_restriction: 0,
        min_age: 18,
        max_age: 35,
        category: 0,
        status: 'ongoing',
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg'],
        tags: ['tag1', 'tag2', 'tag3', 'tag4'],
        created_at: '2024-01-01T00:00:00Z'
      };
      
      const result = adapter.adaptParty(party);
      
      expect(result).toMatchObject({
        id: 1,
        title: 'Test Party',
        description: 'A test party',
        startTime: expect.any(String),
        endTime: expect.any(String),
        location: 'Test Location',
        maxPeople: 50,
        currentPeople: 25,
        priceType: 1,
        genderLimit: 0,
        minAge: 18,
        maxAge: 35,
        theme: 0,
        status: 'ongoing',
        createTime: expect.any(String)
      });
      
      // 图片应限制为3张
      expect(result.images).toHaveLength(3);
      expect(result.images).toEqual(['img1.jpg', 'img2.jpg', 'img3.jpg']);
      
      // 标签应限制为3个
      expect(result.tags).toHaveLength(3);
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('should handle party with no images or tags', () => {
      const party = {
        id: 1,
        title: 'Test Party',
        start_time: '2024-01-15T20:00:00Z',
        images: null,
        tags: null
      };
      
      const result = adapter.adaptParty(party);
      
      expect(result.images).toEqual([]);
      expect(result.tags).toEqual([]);
    });
  });

  describe('adaptOrder', () => {
    test('should adapt order data for miniprogram', () => {
      const order = {
        id: 1,
        order_no: 'ORDER123',
        user_id: 1,
        party_id: 1,
        total_amount: 5000, // 50.00 yuan in fen
        status: 'paid',
        created_at: '2024-01-01T00:00:00Z'
      };
      
      const result = adapter.adaptOrder(order);
      
      expect(result).toMatchObject({
        id: 1,
        orderNo: 'ORDER123',
        userId: 1,
        partyId: 1,
        totalPrice: '50.00',
        status: 'paid',
        createTime: expect.any(String),
        statusText: '已支付'
      });
    });
  });

  describe('adaptTicket', () => {
    test('should adapt ticket data for miniprogram', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30天后
      
      const ticket = {
        id: 1,
        ticket_no: 'TICKET123',
        order_id: 1,
        party_id: 1,
        ticket_type_id: 1,
        status: 'valid',
        qr_code: 'qrcode123',
        created_at: '2024-01-01T00:00:00Z',
        party: {
          start_time: futureDate.toISOString() // 未来时间
        }
      };
      
      const result = adapter.adaptTicket(ticket);
      
      expect(result).toMatchObject({
        id: 1,
        ticketNo: 'TICKET123',
        orderId: 1,
        partyId: 1,
        ticketType: 1,
        status: 'valid',
        qrCode: 'qrcode123',
        createTime: expect.any(String),
        statusText: '有效',
        canRefund: true
      });
    });

    test('should not allow refund for past events', () => {
      const ticket = {
        id: 1,
        status: 'valid',
        party: {
          start_time: '2020-01-01T20:00:00Z' // 过去时间
        }
      };
      
      const result = adapter.adaptTicket(ticket);
      
      expect(result.canRefund).toBe(false);
    });
  });

  describe('adaptWallet', () => {
    test('should adapt wallet data for miniprogram', () => {
      const wallet = {
        id: 1,
        user_id: 1,
        balance: 10000, // 100.00 yuan in fen
        total_income: 50000,
        total_expense: 40000,
        updated_at: '2024-01-01T00:00:00Z'
      };
      
      const result = adapter.adaptWallet(wallet);
      
      expect(result).toMatchObject({
        id: 1,
        userId: 1,
        balance: '100.00',
        totalIncome: '500.00',
        totalExpense: '400.00',
        balanceText: '¥100.00',
        updateTime: expect.any(String)
      });
    });
  });

  describe('getOrderStatusText', () => {
    test('should return correct status text', () => {
      expect(adapter.getOrderStatusText('pending')).toBe('待支付');
      expect(adapter.getOrderStatusText('paid')).toBe('已支付');
      expect(adapter.getOrderStatusText('cancelled')).toBe('已取消');
      expect(adapter.getOrderStatusText('refunded')).toBe('已退款');
      expect(adapter.getOrderStatusText('unknown')).toBe('未知状态');
    });
  });

  describe('getTicketStatusText', () => {
    test('should return correct status text', () => {
      expect(adapter.getTicketStatusText('valid')).toBe('有效');
      expect(adapter.getTicketStatusText('used')).toBe('已使用');
      expect(adapter.getTicketStatusText('expired')).toBe('已过期');
      expect(adapter.getTicketStatusText('refunded')).toBe('已退款');
      expect(adapter.getTicketStatusText('unknown')).toBe('未知状态');
    });
  });

  describe('adaptPagination', () => {
    test('should adapt pagination for miniprogram format', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 25
      };
      
      const result = adapter.adaptPagination(data, pagination);
      
      expect(result).toMatchObject({
        list: expect.any(Array), // 小程序使用 list 而不是 items
        page: 1,
        pageSize: 10,
        total: 25,
        hasMore: true // 小程序使用 hasMore 而不是 hasNext
      });
    });
  });

  describe('adaptItem', () => {
    test('should detect and adapt different data types', () => {
      // 用户数据
      const userData = { nickname: 'John', created_at: '2024-01-01' };
      const userResult = adapter.adaptItem(userData);
      expect(userResult.createTime).toBeDefined();
      
      // 聚会数据
      const partyData = { title: 'Party', start_time: '2024-01-01' };
      const partyResult = adapter.adaptItem(partyData);
      expect(partyResult.startTime).toBeDefined();
      
      // 订单数据
      const orderData = { order_no: 'ORDER123' };
      const orderResult = adapter.adaptItem(orderData);
      expect(orderResult.orderNo).toBeDefined();
      
      // 票券数据
      const ticketData = { ticket_no: 'TICKET123' };
      const ticketResult = adapter.adaptItem(ticketData);
      expect(ticketResult.ticketNo).toBeDefined();
      
      // 钱包数据
      const walletData = { balance: 1000 };
      const walletResult = adapter.adaptItem(walletData);
      expect(walletResult.balance).toBeDefined();
    });
  });
});