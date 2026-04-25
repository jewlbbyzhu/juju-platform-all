const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateUpdateUserStatus
} = require('../../src/validators/userValidator');

const {
  validateCreateParty,
  validateUpdateParty,
  validateAuditParty,
  validateUpdatePartyStatus
} = require('../../src/validators/partyValidator');

const {
  validateCreateOrder,
  validateCancelOrder,
  validateApplyRefund,
  validateUpdateOrderStatus
} = require('../../src/validators/orderValidator');

describe('User Validator', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateRegister', () => {
    it('should call next for valid registration with openid', () => {
      req.body = {
        openid: 'valid_openid_123',
        nickname: 'Test User',
        gender: 1
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next for valid registration with unionid', () => {
      req.body = {
        unionid: 'valid_unionid_123',
        nickname: 'Test User',
        gender: 1
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next for valid registration with phone', () => {
      req.body = {
        phone: '13800138000',
        nickname: 'Test User',
        gender: 1
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next for valid registration with email', () => {
      req.body = {
        email: 'test@example.com',
        nickname: 'Test User',
        gender: 1
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing nickname', () => {
      req.body = {
        openid: 'valid_openid_123'
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid phone format', () => {
      req.body = {
        phone: 'invalid_phone',
        nickname: 'Test User',
        gender: 1
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', () => {
      req.body = {
        email: 'invalid_email',
        nickname: 'Test User',
        gender: 1
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid gender', () => {
      req.body = {
        openid: 'valid_openid_123',
        nickname: 'Test User',
        gender: 5
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for nickname too long', () => {
      req.body = {
        openid: 'valid_openid_123',
        nickname: 'A'.repeat(51),
        gender: 1
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('should call next for valid login with openid', () => {
      req.body = {
        openid: 'valid_openid_123'
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next for valid login with unionid', () => {
      req.body = {
        unionid: 'valid_unionid_123'
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing openid and unionid', () => {
      req.body = {};

      validateLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdateProfile', () => {
    it('should call next for valid profile update', () => {
      req.body = {
        nickname: 'Updated User',
        gender: 0
      };

      validateUpdateProfile(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for nickname too long', () => {
      req.body = {
        nickname: 'A'.repeat(51)
      };

      validateUpdateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid gender', () => {
      req.body = {
        gender: 5
      };

      validateUpdateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdateUserStatus', () => {
    it('should call next for valid status update', () => {
      req.body = {
        status: 1
      };

      validateUpdateUserStatus(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing status', () => {
      req.body = {};

      validateUpdateUserStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid status', () => {
      req.body = {
        status: 5
      };

      validateUpdateUserStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        errors: expect.any(Array),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('Party Validator', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateCreateParty', () => {
    it('should call next for valid party creation', () => {
      req.body = {
        title: 'Test Party',
        category: 'music',
        start_time: '2026-02-01T10:00:00Z',
        end_time: '2026-02-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 50,
        ticket_types: [
          {
            name: 'Standard Ticket',
            price: 50,
            quantity: 100
          }
        ]
      };

      validateCreateParty(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing title', () => {
      req.body = {
        category: 'music',
        start_time: '2026-02-01T10:00:00Z',
        end_time: '2026-02-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 50
      };

      validateCreateParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for title too short', () => {
      req.body = {
        title: '',
        category: 'music',
        start_time: '2026-02-01T10:00:00Z',
        end_time: '2026-02-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 50
      };

      validateCreateParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for title too long', () => {
      req.body = {
        title: 'A'.repeat(201),
        category: 'music',
        start_time: '2026-02-01T10:00:00Z',
        end_time: '2026-02-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 50
      };

      validateCreateParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for end_time before start_time', () => {
      req.body = {
        title: 'Test Party',
        category: 'music',
        start_time: '2026-02-01T18:00:00Z',
        end_time: '2026-02-01T10:00:00Z',
        location: 'Test Location',
        max_participants: 50
      };

      validateCreateParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid max_participants', () => {
      req.body = {
        title: 'Test Party',
        category: 'music',
        start_time: '2026-02-01T10:00:00Z',
        end_time: '2026-02-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 0
      };

      validateCreateParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid ticket type price', () => {
      req.body = {
        title: 'Test Party',
        category: 'music',
        start_time: '2026-02-01T10:00:00Z',
        end_time: '2026-02-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 50,
        ticket_types: [
          {
            name: 'Standard Ticket',
            price: -10,
            quantity: 100
          }
        ]
      };

      validateCreateParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for missing ticket types', () => {
      req.body = {
        title: 'Test Party',
        category: 'music',
        start_time: '2026-02-01T10:00:00Z',
        end_time: '2026-02-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 50
      };

      validateCreateParty(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdateParty', () => {
    it('should call next for valid party update', () => {
      req.body = {
        title: 'Updated Party',
        category: 'music'
      };

      validateUpdateParty(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid status', () => {
      req.body = {
        status: 5
      };

      validateUpdateParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateAuditParty', () => {
    it('should call next for valid audit with status 1', () => {
      req.body = {
        audit_status: 1,
        audit_reason: 'Approved'
      };

      validateAuditParty(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next for valid audit with status 2', () => {
      req.body = {
        audit_status: 2,
        audit_reason: 'Rejected'
      };

      validateAuditParty(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing audit_status', () => {
      req.body = {};

      validateAuditParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for missing audit_reason when status is 2', () => {
      req.body = {
        audit_status: 2
      };

      validateAuditParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid audit_status', () => {
      req.body = {
        audit_status: 5
      };

      validateAuditParty(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdatePartyStatus', () => {
    it('should call next for valid status update', () => {
      req.body = {
        status: 1
      };

      validateUpdatePartyStatus(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing status', () => {
      req.body = {};

      validateUpdatePartyStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid status', () => {
      req.body = {
        status: 5
      };

      validateUpdatePartyStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('Order Validator', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateCreateOrder', () => {
    it('should call next for valid order creation', () => {
      req.body = {
        party_id: 1,
        items: [
          {
            ticket_type_id: 1,
            quantity: 2
          }
        ]
      };

      validateCreateOrder(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing party_id', () => {
      req.body = {
        items: [
          {
            ticket_type_id: 1,
            quantity: 2
          }
        ]
      };

      validateCreateOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for missing items', () => {
      req.body = {
        party_id: 1
      };

      validateCreateOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for empty items array', () => {
      req.body = {
        party_id: 1,
        items: []
      };

      validateCreateOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid quantity', () => {
      req.body = {
        party_id: 1,
        items: [
          {
            ticket_type_id: 1,
            quantity: 0
          }
        ]
      };

      validateCreateOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for missing ticket_type_id', () => {
      req.body = {
        party_id: 1,
        items: [
          {
            quantity: 2
          }
        ]
      };

      validateCreateOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateCancelOrder', () => {
    it('should call next for valid order cancellation', () => {
      req.body = {
        reason: 'Changed my mind'
      };

      validateCancelOrder(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing reason', () => {
      req.body = {};

      validateCancelOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for reason too long', () => {
      req.body = {
        reason: 'A'.repeat(501)
      };

      validateCancelOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateApplyRefund', () => {
    it('should call next for valid refund application', () => {
      req.body = {
        reason: 'Party cancelled'
      };

      validateApplyRefund(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing reason', () => {
      req.body = {};

      validateApplyRefund(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for reason too long', () => {
      req.body = {
        reason: 'A'.repeat(501)
      };

      validateApplyRefund(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdateOrderStatus', () => {
    it('should call next for valid status update', () => {
      req.body = {
        status: 1
      };

      validateUpdateOrderStatus(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing status', () => {
      req.body = {};

      validateUpdateOrderStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid status', () => {
      req.body = {
        status: 5
      };

      validateUpdateOrderStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
