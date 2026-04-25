const { Favorite } = require('../models');
const logger = require('../utils/logger');

class FavoriteController {
  async addFavorite(req, res, next) {
    try {
      const { partyId } = req.body;
      
      const existingFavorite = await Favorite.findOne({
        where: {
          user_id: req.user.id,
          party_id: partyId
        }
      });
      
      if (existingFavorite) {
        return res.json({
          success: false,
          message: 'Already favorited'
        });
      }
      
      const favorite = await Favorite.create({
        user_id: req.user.id,
        party_id: partyId
      });
      res.json({
        success: true,
        message: 'Favorite added successfully',
        data: favorite
      });
    } catch (error) {
      logger.error('Add favorite error:', error);
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      const favorite = await Favorite.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id
        }
      });

      if (!favorite) {
        throw new Error('Favorite not found');
      }

      await favorite.destroy();
      res.json({
        success: true,
        message: 'Favorite removed successfully'
      });
    } catch (error) {
      logger.error('Remove favorite error:', error);
      next(error);
    }
  }

  async getFavorites(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * pageSize;
      const { count, rows } = await Favorite.findAndCountAll({
        where: { user_id: req.user.id },
        offset,
        limit: pageSize,
        include: [
          {
            model: require('../models').Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time', 'end_time', 'location', 'address']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const responseData = {
        total: count,
        page,
        pageSize,
        data: rows.map(favorite => ({
          id: favorite.id,
          userId: favorite.user_id,
          partyId: favorite.party_id,
          party: favorite.party ? {
            id: favorite.party.id,
            title: favorite.party.title,
            coverImage: favorite.party.cover_image,
            startTime: favorite.party.start_time,
            endTime: favorite.party.end_time,
            location: favorite.party.location,
            address: favorite.party.address
          } : null,
          createdAt: favorite.created_at
        }))
      };

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      logger.error('Get favorites error:', error);
      next(error);
    }
  }

  async checkFavorite(req, res, next) {
    try {
      const { partyId } = req.query;
      const favorite = await Favorite.findOne({
        where: {
          user_id: req.user.id,
          party_id: partyId
        }
      });

      res.json({
        success: true,
        data: {
          isFavorite: !!favorite
        }
      });
    } catch (error) {
      logger.error('Check favorite error:', error);
      next(error);
    }
  }
}

module.exports = new FavoriteController();
