const { User, Wallet, WalletTransaction, Party, Order, Payment, Ticket, Notification, TicketType, VIPMembership, Admin, Role } = require('../models');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

class TestDataSeeder {
  async seedTestData() {
    try {
      logger.info('Starting test data seeding...');

      await this.seedTestAdmins();
      await this.seedTestUsers();
      await this.seedTestParties();
      await this.seedTestTicketTypes();
      await this.seedTestVIPMemberships();
      await this.seedTestWallets();
      await this.seedTestOrders();
      await this.seedTestPayments();
      await this.seedTestTickets();
      await this.seedTestNotifications();

      logger.info('Test data seeding completed successfully');
    } catch (error) {
      logger.error('Test data seeding failed:', error);
      throw error;
    }
  }

  async seedTestAdmins() {
    const existingAdmins = await Admin.count({ where: { username: 'eros1101' } });

    if (existingAdmins === 0) {
      const existingRoles = await Role.count({ where: { id: 1 } });

      if (existingRoles === 0) {
        const role = await Role.create({
          id: 1,
          name: 'super_admin',
          display_name: '超级管理员',
          description: '拥有所有权限',
          permissions: ['*'],
          status: 1
        });
        logger.info(`Test role created: ${role.name}`);
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await Admin.create({
        id: 1,
        username: 'eros1101',
        password: hashedPassword,
        real_name: '测试管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        role_id: 1,
        status: 1,
        is_active: true
      });

      logger.info(`Test admin created: ${admin.username}`);
    }
  }

  async seedTestTicketTypes() {
    const existingTicketTypes = await TicketType.count({ where: { id: 1 } });

    if (existingTicketTypes === 0) {
      const ticketType = await TicketType.create({
        id: 1,
        party_id: 1,
        name: '普通票',
        description: '普通票型',
        type: 1,
        price: 100.00,
        original_price: 100.00,
        available_count: 100,
        sold_count: 0,
        max_per_user: 0,
        status: 1,
        sort_order: 1
      });

      logger.info(`Test ticket type created: ${ticketType.name}`);
    }
  }

  async seedTestParties() {
    const existingParties = await Party.count({ where: { id: 1 } });

    if (existingParties === 0) {
      const party = await Party.create({
        id: 1,
        user_id: 1,
        title: '[E2E] 霓虹派对-回归用例A',
        description: '这是一个测试聚会，用于回归测试',
        location: '上海市浦东新区',
        address: '上海市浦东新区张江高科技园区',
        latitude: 31.8206,
        longitude: 117.2272,
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        registration_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        min_price: 50,
        max_price: 200,
        max_participants: 50,
        min_age: 18,
        max_age: 45,
        gender_restriction: 0,
        category: 1,
        status: 1,
        audit_status: 1,
        is_featured: false,
        is_hot: false,
        view_count: 100,
        favorite_count: 10,
        current_participants: 5
      });

      logger.info(`Test party created: ${party.title}`);
    }
  }

  async seedTestUsers() {
    const testUsers = [
      {
        openid: 'smoke_openid_68713bff0761d19bdf351646',
        nickname: '测试用户',
        avatar: 'https://via.placeholder.com/150',
        phone: '13800138000',
        is_vip: false,
        status: 1
      },
      {
        openid: 'test_openid_vip_user',
        nickname: 'VIP测试用户',
        avatar: 'https://via.placeholder.com/150',
        phone: '13800138001',
        is_vip: true,
        vip_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 1
      }
    ];

    for (const userData of testUsers) {
      const [user] = await User.findOrCreate({
        where: { openid: userData.openid },
        defaults: userData
      });
      logger.info(`Test user created/updated: ${user.nickname}`);
    }
  }

  async seedTestVIPMemberships() {
    const users = await User.findAll({
      where: { openid: ['test_openid_vip_user'] }
    });

    for (const user of users) {
      const existingVIP = await VIPMembership.count({ where: { user_id: user.id } });

      if (existingVIP === 0) {
        await VIPMembership.create({
          user_id: user.id,
          membership_type: 'monthly',
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 1
        });

        logger.info(`Test VIP membership created for user: ${user.nickname}`);
      }
    }
  }

  async seedTestWallets() {
    const users = await User.findAll({
      where: { openid: ['smoke_openid_68713bff0761d19bdf351646', 'test_openid_vip_user'] }
    });

    for (const user of users) {
      const [wallet] = await Wallet.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          balance: 10000.00,
          total_income: 10000.00,
          total_expense: 0.00,
          status: 1
        }
      });

      if (wallet.balance < 10000) {
        await wallet.update({ balance: 10000.00 });
      }

      logger.info(`Test wallet created/updated for user: ${user.nickname}, balance: ${wallet.balance}`);
    }
  }

  async seedTestOrders() {
    const users = await User.findAll({
      where: { openid: ['smoke_openid_68713bff0761d19bdf351646'] }
    });

    const parties = await Party.findAll({
      where: { id: 1 },
      limit: 1
    });

    for (const user of users) {
      const existingOrders = await Order.count({ where: { user_id: user.id } });

      if (existingOrders === 0 && parties.length > 0) {
        const order = await Order.create({
          user_id: user.id,
          order_no: `TEST_ORDER_${Date.now()}_${user.id}`,
          party_id: parties[0].id,
          total_amount: 100.00,
          discount_amount: 0.00,
          final_amount: 100.00,
          payment_status: 1,
          status: 1,
          remark: '测试订单'
        });

        logger.info(`Test order created for user: ${user.nickname}, order_no: ${order.order_no}`);
      }
    }
  }

  async seedTestPayments() {
    const orders = await Order.findAll({
      where: { order_no: { [require('sequelize').Op.like]: 'TEST_ORDER_%' } }
    });

    for (const order of orders) {
      const existingPayment = await Payment.findOne({
        where: { order_id: order.id }
      });

      if (!existingPayment) {
        const payment = await Payment.create({
          order_id: order.id,
          user_id: order.user_id,
          payment_no: `TEST_PAYMENT_${Date.now()}_${order.id}`,
          payment_method: 'wallet',
          amount: order.final_amount,
          status: 1,
          transaction_id: `TEST_TX_${Date.now()}`
        });

        logger.info(`Test payment created for order: ${order.order_no}, payment_no: ${payment.payment_no}`);
      }
    }
  }

  async seedTestTickets() {
    const users = await User.findAll({
      where: { openid: ['smoke_openid_68713bff0761d19bdf351646'] }
    });

    const parties = await Party.findAll({
      where: { id: 1 },
      limit: 1
    });

    const orders = await Order.findAll({
      where: { order_no: { [require('sequelize').Op.like]: 'TEST_ORDER_%' } }
    });

    for (const user of users) {
      const existingTickets = await Ticket.count({ where: { user_id: user.id } });

      if (existingTickets === 0 && parties.length > 0 && orders.length > 0) {
        const ticket = await Ticket.create({
          user_id: user.id,
          ticket_code: `TEST_TICKET_${Date.now()}_${user.id}`,
          party_id: parties[0].id,
          order_id: orders[0].id,
          ticket_type_id: 1,
          status: 1,
          used_at: null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        logger.info(`Test ticket created for user: ${user.nickname}, ticket_code: ${ticket.ticket_code}`);
      }
    }
  }

  async seedTestNotifications() {
    const users = await User.findAll({
      where: { openid: ['smoke_openid_68713bff0761d19bdf351646'] }
    });

    for (const user of users) {
      const existingNotifications = await Notification.count({ where: { user_id: user.id } });

      if (existingNotifications === 0) {
        await Notification.create({
          user_id: user.id,
          title: '测试通知',
          content: '这是一条测试通知消息',
          type: 'system',
          is_read: false
        });

        logger.info(`Test notification created for user: ${user.nickname}`);
      }
    }
  }

  async clearTestData() {
    try {
      logger.info('Clearing test data...');

      await WalletTransaction.destroy({
        where: {},
        truncate: true
      });

      await Payment.destroy({
        where: {
          payment_no: { [require('sequelize').Op.like]: 'TEST_%' }
        }
      });

      await Order.destroy({
        where: {
          order_no: { [require('sequelize').Op.like]: 'TEST_ORDER_%' }
        }
      });

      await Ticket.destroy({
        where: {
          ticket_code: { [require('sequelize').Op.like]: 'TEST_TICKET_%' }
        }
      });

      await Notification.destroy({
        where: {
          title: '测试通知'
        }
      });

      logger.info('Test data cleared successfully');
    } catch (error) {
      logger.error('Test data clearing failed:', error);
      throw error;
    }
  }
}

module.exports = new TestDataSeeder();