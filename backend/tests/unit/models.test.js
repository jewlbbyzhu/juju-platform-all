const { User, Wallet, Party, TicketType, Order, Payment, VIPMembership, Admin, Role } = require('../../src/models');

describe('Models', () => {
  describe('User Model', () => {
    it('should create a user', async () => {
      const user = await User.create({
        openid: 'test_openid_001',
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        status: 1,
        is_vip: false
      });
      
      expect(user).toBeDefined();
      expect(user.openid).toBe('test_openid_001');
      expect(user.nickname).toBe('Test User');
      expect(user.status).toBe(1);
      expect(user.is_vip).toBe(false);
      
      await user.destroy();
    });

    it('should not create a user without openid', async () => {
      const user = await User.create({
        nickname: 'Test User'
      });
      
      expect(user).toBeDefined();
      expect(user.openid).toBeUndefined();
      
      await user.destroy();
    });

    it('should find a user by openid', async () => {
      const user = await User.create({
        openid: 'test_openid_002',
        nickname: 'Test User 2',
        status: 1
      });
      
      const foundUser = await User.findOne({ where: { openid: 'test_openid_002' } });
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
      
      await user.destroy();
    });
  });

  describe('Wallet Model', () => {
    it('should create a wallet for a user', async () => {
      const user = await User.create({
        openid: 'test_openid_wallet',
        nickname: 'Test User Wallet',
        status: 1
      });
      
      const wallet = await Wallet.create({
        user_id: user.id,
        balance: 100.00,
        frozen_balance: 0.00,
        total_income: 100.00,
        total_expense: 0.00,
        status: 1
      });
      
      expect(wallet).toBeDefined();
      expect(wallet.user_id).toBe(user.id);
      expect(Number(wallet.balance)).toBe(100);
      expect(wallet.status).toBe(1);
      
      await wallet.destroy();
      await user.destroy();
    });

    it('should have a relationship with user', async () => {
      const user = await User.create({
        openid: 'test_openid_wallet2',
        nickname: 'Test User Wallet 2',
        status: 1
      });
      
      const wallet = await Wallet.create({
        user_id: user.id,
        balance: 50.00,
        status: 1
      });
      
      const walletWithUser = await Wallet.findByPk(wallet.id, {
        include: [{ model: User, as: 'user' }]
      });
      
      expect(walletWithUser.user).toBeDefined();
      expect(walletWithUser.user.id).toBe(user.id);
      
      await wallet.destroy();
      await user.destroy();
    });
  });

  describe('Party Model', () => {
    it('should create a party', async () => {
      const user = await User.create({
        openid: 'test_openid_party',
        nickname: 'Test User Party',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party',
        description: 'This is a test party',
        category: 'music',
        start_time: new Date('2026-02-01 10:00:00'),
        end_time: new Date('2026-02-01 18:00:00'),
        registration_deadline: new Date('2026-01-31 23:59:59'),
        location: 'Test Location',
        max_participants: 50,
        current_participants: 0,
        min_price: 50.00,
        max_price: 100.00,
        status: 0,
        audit_status: 0
      });
      
      expect(party).toBeDefined();
      expect(party.title).toBe('Test Party');
      expect(party.user_id).toBe(user.id);
      expect(party.status).toBe(0);
      
      await party.destroy();
      await user.destroy();
    });

    it('should have a relationship with user', async () => {
      const user = await User.create({
        openid: 'test_openid_party2',
        nickname: 'Test User Party 2',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party 2',
        category: 'music',
        start_time: new Date('2026-02-02 10:00:00'),
        end_time: new Date('2026-02-02 18:00:00'),
        registration_deadline: new Date('2026-02-01 23:59:59'),
        location: 'Test Location 2',
        max_participants: 30,
        current_participants: 0,
        min_price: 30.00,
        max_price: 60.00,
        status: 0
      });
      
      const partyWithUser = await Party.findByPk(party.id, {
        include: [{ model: User, as: 'user' }]
      });
      
      expect(partyWithUser.user).toBeDefined();
      expect(partyWithUser.user.id).toBe(user.id);
      
      await party.destroy();
      await user.destroy();
    });
  });

  describe('Order Model', () => {
    it('should create an order', async () => {
      const user = await User.create({
        openid: 'test_openid_order',
        nickname: 'Test User Order',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party Order',
        category: 'music',
        start_time: new Date('2026-02-03 10:00:00'),
        end_time: new Date('2026-02-03 18:00:00'),
        registration_deadline: new Date('2026-02-02 23:59:59'),
        location: 'Test Location Order',
        max_participants: 50,
        current_participants: 0,
        min_price: 50.00,
        max_price: 100.00,
        status: 1
      });
      
      const order = await Order.create({
        order_no: 'ORD20260116100001',
        user_id: user.id,
        party_id: party.id,
        total_amount: 100.00,
        discount_amount: 0.00,
        final_amount: 100.00,
        payment_method: 'wechat',
        payment_status: 0,
        status: 0
      });
      
      expect(order).toBeDefined();
      expect(order.order_no).toBe('ORD20260116100001');
      expect(order.user_id).toBe(user.id);
      expect(order.party_id).toBe(party.id);
      expect(Number(order.final_amount)).toBe(100);
      
      await order.destroy();
      await party.destroy();
      await user.destroy();
    });

    it('should have relationships with user and party', async () => {
      const user = await User.create({
        openid: 'test_openid_order2',
        nickname: 'Test User Order 2',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party Order 2',
        category: 'music',
        start_time: new Date('2026-02-04 10:00:00'),
        end_time: new Date('2026-02-04 18:00:00'),
        registration_deadline: new Date('2026-02-03 23:59:59'),
        location: 'Test Location Order 2',
        max_participants: 50,
        current_participants: 0,
        min_price: 50.00,
        max_price: 100.00,
        status: 1
      });
      
      const order = await Order.create({
        order_no: 'ORD20260116100002',
        user_id: user.id,
        party_id: party.id,
        total_amount: 80.00,
        discount_amount: 0.00,
        final_amount: 80.00,
        payment_method: 'alipay',
        payment_status: 0,
        status: 0
      });
      
      const orderWithRelations = await Order.findByPk(order.id, {
        include: [
          { model: User, as: 'user' },
          { model: Party, as: 'party' }
        ]
      });
      
      expect(orderWithRelations.user).toBeDefined();
      expect(orderWithRelations.party).toBeDefined();
      expect(orderWithRelations.user.id).toBe(user.id);
      expect(orderWithRelations.party.id).toBe(party.id);
      
      await order.destroy();
      await party.destroy();
      await user.destroy();
    });
  });

  describe('VIPMembership Model', () => {
    it('should create a VIP membership', async () => {
      const user = await User.create({
        openid: 'test_openid_vip',
        nickname: 'Test User VIP',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party VIP',
        category: 'music',
        start_time: new Date('2026-02-06 10:00:00'),
        end_time: new Date('2026-02-06 18:00:00'),
        registration_deadline: new Date('2026-02-05 23:59:59'),
        location: 'Test Location VIP',
        max_participants: 50,
        current_participants: 0,
        min_price: 50.00,
        max_price: 100.00,
        status: 1
      });
      
      const order = await Order.create({
        order_no: 'ORD20260116100004',
        user_id: user.id,
        party_id: party.id,
        total_amount: 100.00,
        discount_amount: 0.00,
        final_amount: 100.00,
        payment_method: 'wechat',
        payment_status: 1,
        status: 1
      });
      
      const payment = await Payment.create({
        order_id: order.id,
        user_id: user.id,
        payment_no: 'PAY20260116100001',
        payment_method: 'wechat',
        amount: 88.00,
        status: 1
      });
      
      const membership = await VIPMembership.create({
        user_id: user.id,
        membership_type: 'monthly',
        start_date: new Date('2026-01-16'),
        end_date: new Date('2026-02-16'),
        status: 1,
        payment_id: payment.id
      });
      
      expect(membership).toBeDefined();
      expect(membership.user_id).toBe(user.id);
      expect(membership.membership_type).toBe('monthly');
      expect(membership.status).toBe(1);
      
      await membership.destroy();
      await payment.destroy();
      await order.destroy();
      await party.destroy();
      await user.destroy();
    });

    it('should have a relationship with user', async () => {
      const user = await User.create({
        openid: 'test_openid_vip2',
        nickname: 'Test User VIP 2',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party VIP 2',
        category: 'music',
        start_time: new Date('2026-02-07 10:00:00'),
        end_time: new Date('2026-02-07 18:00:00'),
        registration_deadline: new Date('2026-02-06 23:59:59'),
        location: 'Test Location VIP 2',
        max_participants: 50,
        current_participants: 0,
        min_price: 50.00,
        max_price: 100.00,
        status: 1
      });
      
      const order = await Order.create({
        order_no: 'ORD20260116100005',
        user_id: user.id,
        party_id: party.id,
        total_amount: 100.00,
        discount_amount: 0.00,
        final_amount: 100.00,
        payment_method: 'wechat',
        payment_status: 1,
        status: 1
      });
      
      const payment = await Payment.create({
        order_id: order.id,
        user_id: user.id,
        payment_no: 'PAY20260116100002',
        payment_method: 'wechat',
        amount: 88.00,
        status: 1
      });
      
      const membership = await VIPMembership.create({
        user_id: user.id,
        membership_type: 'quarterly',
        start_date: new Date('2026-01-16'),
        end_date: new Date('2026-04-16'),
        status: 1,
        payment_id: payment.id
      });
      
      const membershipWithUser = await VIPMembership.findByPk(membership.id, {
        include: [{ model: User, as: 'user' }]
      });
      
      expect(membershipWithUser.user).toBeDefined();
      expect(membershipWithUser.user.id).toBe(user.id);
      
      await membership.destroy();
      await payment.destroy();
      await order.destroy();
      await party.destroy();
      await user.destroy();
    });
  });

  describe('Admin Model', () => {
    it('should create an admin', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const role = await Role.create({
        name: 'Test Role',
        code: 'test_role',
        description: 'Test role description',
        permissions: JSON.stringify([]),
        status: 1
      });
      
      const admin = await Admin.create({
        username: 'test_admin',
        password: hashedPassword,
        real_name: 'Test Admin',
        email: 'test@example.com',
        phone: '13800138000',
        role_id: role.id,
        status: 1
      });
      
      expect(admin).toBeDefined();
      expect(admin.username).toBe('test_admin');
      expect(admin.email).toBe('test@example.com');
      expect(admin.role_id).toBe(role.id);
      
      await admin.destroy();
      await role.destroy();
    });

    it('should have a relationship with role', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const role = await Role.create({
        name: 'Test Role 2',
        code: 'test_role2',
        description: 'Test role description 2',
        permissions: JSON.stringify([]),
        status: 1
      });
      
      const admin = await Admin.create({
        username: 'test_admin2',
        password: hashedPassword,
        real_name: 'Test Admin 2',
        email: 'test2@example.com',
        phone: '13800138001',
        role_id: role.id,
        status: 1
      });
      
      const adminWithRole = await Admin.findByPk(admin.id, {
        include: [{ model: Role, as: 'role' }]
      });
      
      expect(adminWithRole.role).toBeDefined();
      expect(adminWithRole.role.id).toBe(role.id);
      
      await admin.destroy();
      await role.destroy();
    });
  });

  describe('TicketType Model', () => {
    it('should create a ticket type', async () => {
      const user = await User.create({
        openid: 'test_openid_ticket',
        nickname: 'Test User Ticket',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party Ticket',
        category: 'music',
        start_time: new Date('2026-02-04 10:00:00'),
        end_time: new Date('2026-02-04 18:00:00'),
        registration_deadline: new Date('2026-02-03 23:59:59'),
        location: 'Test Location Ticket',
        max_participants: 50,
        current_participants: 0,
        min_price: 50.00,
        max_price: 100.00,
        status: 1
      });
      
      const ticketType = await TicketType.create({
        party_id: party.id,
        name: 'VIP Ticket',
        description: 'VIP ticket description',
        price: 88.00,
        max_quantity: 50,
        status: 1
      });
      
      expect(ticketType).toBeDefined();
      expect(ticketType.name).toBe('VIP Ticket');
      expect(Number(ticketType.price)).toBe(88);
      expect(ticketType.status).toBe(1);
      
      await ticketType.destroy();
      await party.destroy();
      await user.destroy();
    });
  });

  describe('Payment Model', () => {
    it('should create a payment', async () => {
      const user = await User.create({
        openid: 'test_openid_payment',
        nickname: 'Test User Payment',
        status: 1
      });
      
      const party = await Party.create({
        user_id: user.id,
        title: 'Test Party Payment',
        category: 'music',
        start_time: new Date('2026-02-05 10:00:00'),
        end_time: new Date('2026-02-05 18:00:00'),
        registration_deadline: new Date('2026-02-04 23:59:59'),
        location: 'Test Location Payment',
        max_participants: 50,
        current_participants: 0,
        min_price: 50.00,
        max_price: 100.00,
        status: 1
      });
      
      const order = await Order.create({
        order_no: 'ORD20260116100003',
        user_id: user.id,
        party_id: party.id,
        total_amount: 100.00,
        discount_amount: 0.00,
        final_amount: 100.00,
        payment_method: 'wechat',
        payment_status: 0,
        status: 1
      });
      
      const payment = await Payment.create({
        order_id: order.id,
        user_id: user.id,
        payment_no: 'PAY20260116100003',
        payment_method: 'wechat',
        amount: 88.00,
        status: 1
      });
      
      expect(payment).toBeDefined();
      expect(payment.payment_no).toBe('PAY20260116100003');
      expect(Number(payment.amount)).toBe(88);
      expect(payment.status).toBe(1);
      
      await payment.destroy();
      await order.destroy();
      await party.destroy();
      await user.destroy();
    });
  });
});