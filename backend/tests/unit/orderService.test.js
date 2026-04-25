/* eslint-disable no-unused-vars */
const mockOrder = {
  id: 1,
  user_id: 1,
  party_id: 1,
  total_amount: 100.00,
  payment_status: 0,
  status: 0,
  get: function(options) {
    if (options && options.plain) {
      return {
        id: this.id,
        user_id: this.user_id,
        party_id: this.party_id,
        total_amount: this.total_amount,
        payment_status: this.payment_status,
        status: this.status
      };
    }
    return this;
  },
  toJSON: function() {
    return {
      id: this.id,
      user_id: this.user_id,
      party_id: this.party_id,
      total_amount: this.total_amount,
      payment_status: this.payment_status,
      status: this.status
    };
  }
};

const mockParty = {
  id: 1,
  user_id: 1,
  title: 'Test Party',
  category: 'social',
  start_time: new Date('2024-12-01'),
  end_time: new Date('2024-12-31'),
  location: 'Test Location',
  max_participants: 100,
  current_participants: 50,
  min_price: 0,
  max_price: 100,
  status: 1,
  audit_status: 1,
  view_count: 0,
  favorite_count: 0,
  is_featured: false,
  is_hot: false,
  min_age: 18,
  max_age: 60,
  gender_restriction: 0,
  get: function(key) {
    return this[key];
  }
};

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

jest.mock('../../src/config/database', () => ({
  // eslint-disable-next-line no-unused-vars
  transaction: jest.fn(async (_options) => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      LOCK: {
        UPDATE: 'UPDATE',
        SHARE: 'SHARE'
      }
    };
    return mockTransaction;
  }),
  sync: jest.fn().mockResolvedValue({}),
  close: jest.fn().mockResolvedValue(undefined),
  define: jest.fn(() => {
    return {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn()
    };
  }),
  authenticate: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue([])
}));

jest.mock('../../src/models', () => ({
  Order: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  OrderItem: {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([])
  },
  Party: {
    findByPk: jest.fn()
  },
  TicketType: {
    findOne: jest.fn(),
    increment: jest.fn().mockResolvedValue([1])
  },
  User: {
    findByPk: jest.fn()
  },
  Payment: {
    create: jest.fn()
  },
  Refund: {}
}));

const { Order, OrderItem, Party, TicketType, User } = require('../../src/models');
const orderService = require('../../src/services/orderService');

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const userId = 1;
      const orderData = {
        party_id: 1,
        items: [
          { ticket_type_id: 1, quantity: 2 }
        ]
      };

      const mockParty = {
        id: 1,
        user_id: 1,
        title: 'Test Party',
        category: 'social',
        start_time: new Date('2024-12-01'),
        end_time: new Date('2024-12-31'),
        location: 'Test Location',
        max_participants: 100,
        current_participants: 50,
        min_price: 0,
        max_price: 100,
        status: 1,
        audit_status: 1,
        view_count: 0,
        favorite_count: 0,
        is_featured: false,
        is_hot: false,
        min_age: 18,
        max_age: 60,
        gender_restriction: 0,
        dataValues: {
          id: 1,
          user_id: 1,
          title: 'Test Party',
          category: 'social',
          start_time: new Date('2024-12-01'),
          end_time: new Date('2024-12-31'),
          location: 'Test Location',
          max_participants: 100,
          current_participants: 50,
          min_price: 0,
          max_price: 100,
          status: 1,
          audit_status: 1,
          view_count: 0,
          favorite_count: 0,
          is_featured: false,
          is_hot: false,
          min_age: 18,
          max_age: 60,
          gender_restriction: 0
        },
        get: function(key) {
          return this[key];
        }
      };

      const mockUser = {
        id: userId,
        birthday: new Date('2000-01-01'),
        gender: 1
      };

      const mockTicketType = {
        id: 1,
        name: 'Standard Ticket',
        price: 50.00,
        quantity: 100,
        sold_quantity: 50
      };

      Party.findByPk.mockResolvedValue(mockParty);
      User.findByPk.mockResolvedValue(mockUser);
      TicketType.findOne.mockResolvedValue(mockTicketType);
      Order.findOne.mockResolvedValue(null);

      const mockOrderData = {
        id: 1,
        user_id: userId,
        party_id: 1,
        total_amount: 100.00,
        payment_status: 0,
        status: 0,
        payment_time: new Date(),
        cancel_time: null
      };

      const mockOrder = {
        ...mockOrderData,
        get: function(options) {
          if (options && options.plain) {
            return mockOrderData;
          }
          return this;
        },
        toJSON: function() {
          return mockOrderData;
        }
      };

      Order.create.mockResolvedValue(mockOrder);
      Order.findByPk.mockResolvedValue(mockOrder);
      OrderItem.create.mockResolvedValue({});

      const result = await orderService.createOrder(userId, orderData);

      expect(result).toBeDefined();
      expect(result.total_amount).toBe(100.00);
      expect(Party.findByPk).toHaveBeenCalled();
      expect(User.findByPk).toHaveBeenCalled();
      expect(Order.create).toHaveBeenCalled();
    });

    it('should throw error if party not found', async () => {
      const userId = 1;
      const orderData = {
        party_id: 999,
        items: [{ ticket_type_id: 1, quantity: 1 }]
      };

      Party.findByPk.mockResolvedValue(null);

      await expect(orderService.createOrder(userId, orderData))
        .rejects.toThrow('Party not found');
    });

    it('should throw error if party is not available', async () => {
      const userId = 1;
      const orderData = {
        party_id: 1,
        items: [{ ticket_type_id: 1, quantity: 1 }]
      };

      const mockParty = {
        id: 1,
        status: 0,
        get: function(key) {
          return this[key];
        }
      };

      Party.findByPk.mockResolvedValue(mockParty);

      await expect(orderService.createOrder(userId, orderData))
        .rejects.toThrow('Party is not available');
    });

    it('should throw error if age does not meet requirements', async () => {
      const userId = 1;
      const orderData = {
        party_id: 1,
        items: [
          { ticket_type_id: 1, quantity: 1 }
        ]
      };

      const mockParty = {
        id: 1,
        user_id: 1,
        title: 'Test Party',
        category: 'social',
        start_time: new Date('2024-12-01'),
        end_time: new Date('2024-12-31'),
        location: 'Test Location',
        max_participants: 100,
        current_participants: 50,
        min_price: 0,
        max_price: 100,
        status: 1,
        audit_status: 1,
        view_count: 0,
        favorite_count: 0,
        is_featured: false,
        is_hot: false,
        min_age: 18,
        max_age: 60,
        gender_restriction: 0,
        dataValues: {
          id: 1,
          user_id: 1,
          title: 'Test Party',
          category: 'social',
          start_time: new Date('2024-12-01'),
          end_time: new Date('2024-12-31'),
          location: 'Test Location',
          max_participants: 100,
          current_participants: 50,
          min_price: 0,
          max_price: 100,
          status: 1,
          audit_status: 1,
          view_count: 0,
          favorite_count: 0,
          is_featured: false,
          is_hot: false,
          min_age: 18,
          max_age: 60,
          gender_restriction: 0
        },
        get: function(key) {
          return this[key];
        }
      };

      const mockUser = {
        id: userId,
        birthday: new Date('2010-01-01'),
        gender: 1
      };

      Party.findByPk.mockResolvedValue(mockParty);
      User.findByPk.mockResolvedValue(mockUser);

      await expect(orderService.createOrder(userId, orderData))
        .rejects.toThrow('年龄不符合要求');
    });

    it('should throw error if user already has order for this party', async () => {
      const userId = 1;
      const orderData = {
        party_id: 1,
        items: [
          { ticket_type_id: 1, quantity: 1 }
        ]
      };

      const mockParty = {
        id: 1,
        user_id: 1,
        title: 'Test Party',
        category: 'social',
        start_time: new Date('2024-12-01'),
        end_time: new Date('2024-12-31'),
        location: 'Test Location',
        max_participants: 100,
        current_participants: 50,
        min_price: 0,
        max_price: 100,
        status: 1,
        audit_status: 1,
        view_count: 0,
        favorite_count: 0,
        is_featured: false,
        is_hot: false,
        min_age: 18,
        max_age: 60,
        gender_restriction: 0,
        dataValues: {
          id: 1,
          user_id: 1,
          title: 'Test Party',
          category: 'social',
          start_time: new Date('2024-12-01'),
          end_time: new Date('2024-12-31'),
          location: 'Test Location',
          max_participants: 100,
          current_participants: 50,
          min_price: 0,
          max_price: 100,
          status: 1,
          audit_status: 1,
          view_count: 0,
          favorite_count: 0,
          is_featured: false,
          is_hot: false,
          min_age: 18,
          max_age: 60,
          gender_restriction: 0
        }
      };

      const mockUser = {
        id: userId,
        birthday: new Date('2000-01-01'),
        gender: 1
      };

      const mockExistingOrder = {
        id: 1,
        user_id: userId,
        party_id: 1,
        status: 1
      };

      Party.findByPk.mockResolvedValue(mockParty);
      User.findByPk.mockResolvedValue(mockUser);
      Order.findOne.mockResolvedValue(mockExistingOrder);

      await expect(orderService.createOrder(userId, orderData))
        .rejects.toThrow('重复参与聚会');
    });

    it('should throw error if gender does not match requirement', async () => {
      const userId = 1;
      const orderData = {
        party_id: 1,
        items: [
          { ticket_type_id: 1, quantity: 1 }
        ]
      };

      const mockParty = {
        id: 1,
        user_id: 1,
        title: 'Test Party',
        category: 'social',
        start_time: new Date('2024-12-01'),
        end_time: new Date('2024-12-31'),
        location: 'Test Location',
        max_participants: 100,
        current_participants: 50,
        min_price: 0,
        max_price: 100,
        status: 1,
        audit_status: 1,
        view_count: 0,
        favorite_count: 0,
        is_featured: false,
        is_hot: false,
        min_age: 18,
        max_age: 60,
        gender_restriction: 1,
        dataValues: {
          id: 1,
          user_id: 1,
          title: 'Test Party',
          category: 'social',
          start_time: new Date('2024-12-01'),
          end_time: new Date('2024-12-31'),
          location: 'Test Location',
          max_participants: 100,
          current_participants: 50,
          min_price: 0,
          max_price: 100,
          status: 1,
          audit_status: 1,
          view_count: 0,
          favorite_count: 0,
          is_featured: false,
          is_hot: false,
          min_age: 18,
          max_age: 60,
          gender_restriction: 1
        },
        get: function(key) {
          return this[key];
        }
      };

      const mockUser = {
        id: userId,
        birthday: new Date('2000-01-01'),
        gender: 0
      };

      Party.findByPk.mockResolvedValue(mockParty);
      User.findByPk.mockResolvedValue(mockUser);

      await expect(orderService.createOrder(userId, orderData))
        .rejects.toThrow('性别不符合要求');
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const orderId = 1;

      const mockOrderData = {
        id: orderId,
        user_id: 1,
        party_id: 1,
        total_amount: 100.00,
        payment_time: new Date(),
        cancel_time: null
      };

      const mockOrder = {
        ...mockOrderData,
        get: function(options) {
          if (options && options.plain) {
            return mockOrderData;
          }
          return this;
        },
        toJSON: () => mockOrderData
      };

      Order.findByPk.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(orderId);

      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(Order.findByPk).toHaveBeenCalledWith(orderId, expect.any(Object));
    });

    it('should throw error if order not found', async () => {
      const orderId = 999;

      Order.findByPk.mockResolvedValue(null);

      await expect(orderService.getOrderById(orderId))
        .rejects.toThrow('Order not found');
    });
  });

  describe('getOrderByOrderNo', () => {
    it('should return order by order no', async () => {
      const orderNo = 'ORD20260116100001';

      const mockOrder = {
        id: 1,
        order_no: orderNo,
        user_id: 1,
        party_id: 1,
        total_amount: 100.00
      };

      Order.findOne.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderByOrderNo(orderNo);

      expect(result).toBeDefined();
      expect(result.order_no).toBe(orderNo);
      expect(Order.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { order_no: orderNo }
      }));
    });

    it('should throw error if order not found', async () => {
      const orderNo = 'ORD99999999999999';

      Order.findOne.mockResolvedValue(null);

      await expect(orderService.getOrderByOrderNo(orderNo))
        .rejects.toThrow('Order not found');
    });
  });

  describe('getOrderList', () => {
    it('should return orders with pagination', async () => {
      const userId = 1;

      const mockOrders = [
        { id: 1, user_id: userId, total_amount: 100.00 },
        { id: 2, user_id: userId, total_amount: 200.00 }
      ];

      Order.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockOrders
      });

      const result = await orderService.getOrderList(userId, 1, 20);

      expect(result).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(Order.findAndCountAll).toHaveBeenCalled();
    });

    it('should get order list with default pagination', async () => {
      const userId = 1;

      const mockOrders = [
        { id: 1, user_id: userId, total_amount: 100.00 }
      ];

      Order.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockOrders
      });

      const result = await orderService.getOrderList(userId);

      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should filter orders by status', async () => {
      const userId = 1;
      const filters = { status: 1 };

      const mockOrders = [
        { id: 1, user_id: userId, status: 1, total_amount: 100.00 }
      ];

      Order.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockOrders
      });

      const result = await orderService.getOrderList(userId, 1, 20, filters);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(Order.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 1
          })
        })
      );
    });

    it('should filter orders by payment status', async () => {
      const userId = 1;
      const filters = { payment_status: 1 };

      const mockOrders = [
        { id: 1, user_id: userId, payment_status: 1, total_amount: 100.00 }
      ];

      Order.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockOrders
      });

      const result = await orderService.getOrderList(userId, 1, 20, filters);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(Order.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            payment_status: 1
          })
        })
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderId = 1;
      const userId = 1;

      const mockOrderData = {
        id: orderId,
        user_id: userId,
        status: 0,
        payment_status: 0,
        total_amount: 100.00
      };

      const mockOrder = {
        ...mockOrderData,
        status: 0,
        payment_status: 0,
        save: jest.fn().mockResolvedValue(),
        get: function(options) {
          if (options && options.plain) {
            return mockOrderData;
          }
          return this;
        },
        toJSON: function() {
          return mockOrderData;
        }
      };

      Order.findByPk.mockResolvedValue(mockOrder);
      Order.update.mockResolvedValue([1]);

      const result = await orderService.cancelOrder(orderId, userId);

      expect(result).toBeDefined();
      expect(Order.findByPk).toHaveBeenCalledWith(orderId, expect.any(Object));
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      const orderId = 999;
      const userId = 1;

      Order.findByPk.mockResolvedValue(null);

      await expect(orderService.cancelOrder(orderId, userId))
        .rejects.toThrow('Order not found');
    });

    it('should throw error if user is not order owner', async () => {
      const orderId = 1;
      const userId = 2;

      const mockOrder = {
        id: orderId,
        user_id: 1,
        status: 0
      };

      Order.findByPk.mockResolvedValue(mockOrder);

      await expect(orderService.cancelOrder(orderId, userId))
        .rejects.toThrow('Unauthorized');
    });

    it('should throw error if order cannot be cancelled', async () => {
      const orderId = 1;
      const userId = 1;

      const mockOrder = {
        id: orderId,
        user_id: userId,
        status: 1,
        payment_status: 0
      };

      Order.findByPk.mockResolvedValue(mockOrder);

      await expect(orderService.cancelOrder(orderId, userId))
        .rejects.toThrow('Only pending orders can be cancelled');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = 1;
      const status = 1;

      const mockOrderData = {
        id: orderId,
        status: 0,
        payment_time: new Date(),
        cancel_time: null
      };

      const mockOrder = {
        ...mockOrderData,
        save: jest.fn().mockResolvedValue(),
        get: function(options) {
          if (options && options.plain) {
            return mockOrderData;
          }
          return this;
        },
        toJSON: function() {
          return mockOrderData;
        }
      };

      Order.findByPk.mockResolvedValue(mockOrder);
      Order.update.mockResolvedValue([1]);

      const result = await orderService.updateOrderStatus(orderId, status);

      expect(result).toBeDefined();
      expect(Order.findByPk).toHaveBeenCalledWith(orderId);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      const orderId = 999;
      const status = 1;

      Order.findByPk.mockResolvedValue(null);

      await expect(orderService.updateOrderStatus(orderId, status))
        .rejects.toThrow('Order not found');
    });
  });
});
