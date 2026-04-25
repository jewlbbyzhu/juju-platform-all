const { Favorite, Party, TicketType } = require('../models');
const logger = require('../utils/logger');

class FavoriteService {
  async addFavorite(userId, partyId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      const existingFavorite = await Favorite.findOne({
        where: {
          user_id: userId,
          party_id: partyId
        }
      });

      if (existingFavorite) {
        throw new Error('Already favorited');
      }

      await Favorite.create({
        user_id: userId,
        party_id: partyId
      });

      await Party.increment('favorite_count', {
        where: { id: partyId }
      });

      return await this.getFavoriteByUserAndParty(userId, partyId);
    } catch (error) {
      logger.error('Add favorite failed:', error);
      throw error;
    }
  }

  async removeFavorite(userId, favoriteId) {
    try {
      const favorite = await Favorite.findByPk(favoriteId);
      if (!favorite) {
        throw new Error('Favorite not found');
      }

      if (favorite.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const partyId = favorite.party_id;
      await favorite.destroy();

      await Party.decrement('favorite_count', {
        where: { id: partyId }
      });

      return { message: 'Favorite removed successfully' };
    } catch (error) {
      logger.error('Remove favorite failed:', error);
      throw error;
    }
  }

  async getFavoriteById(favoriteId) {
    try {
      const favorite = await Favorite.findByPk(favoriteId, {
        include: [
          {
            model: Party,
            as: 'party',
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'nickname', 'avatar']
              }
            ]
          },
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      if (!favorite) {
        throw new Error('Favorite not found');
      }

      return favorite;
    } catch (error) {
      logger.error('Get favorite by ID failed:', error);
      throw error;
    }
  }

  async getFavoriteByUserAndParty(userId, partyId) {
    try {
      const favorite = await Favorite.findOne({
        where: {
          user_id: userId,
          party_id: partyId
        },
        include: [
          {
            model: Party,
            as: 'party',
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'nickname', 'avatar']
              }
            ]
          }
        ]
      });

      if (!favorite) {
        throw new Error('Favorite not found');
      }

      return favorite;
    } catch (error) {
      logger.error('Get favorite by user and party failed:', error);
      throw error;
    }
  }

  async getFavoriteList(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await Favorite.findAndCountAll({
        where: { user_id: userId },
        offset,
        limit,
        include: [
          {
            model: Party,
            as: 'party',
            where: { status: 1 },
            include: [
              {
                model: TicketType,
                as: 'ticket_types',
                where: { status: 1 },
                required: false
              },
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'nickname', 'avatar']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows
      };
    } catch (error) {
      logger.error('Get favorite list failed:', error);
      throw error;
    }
  }

  async checkFavorite(userId, partyId) {
    try {
      const favorite = await Favorite.findOne({
        where: {
          user_id: userId,
          party_id: partyId
        }
      });

      return {
        is_favorited: !!favorite,
        favorite_id: favorite ? favorite.id : null
      };
    } catch (error) {
      logger.error('Check favorite failed:', error);
      throw error;
    }
  }

  async getFavoriteStats(userId) {
    try {
      const totalFavorites = await Favorite.count({
        where: { user_id: userId }
      });

      const recentFavorites = await Favorite.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 5
      });

      return {
        total: totalFavorites,
        recent: recentFavorites.map(f => f.party)
      };
    } catch (error) {
      logger.error('Get favorite stats failed:', error);
      throw error;
    }
  }
}

module.exports = new FavoriteService();
