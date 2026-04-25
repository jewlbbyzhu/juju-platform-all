class RecommendationEngine {
  constructor() {
    this.userPreferences = this.loadUserPreferences()
    this.userBehavior = this.loadUserBehavior()
    this.weights = {
      category: 0.3,
      location: 0.25,
      time: 0.2,
      price: 0.15,
      popularity: 0.1
    }
  }

  loadUserPreferences() {
    const prefs = uni.getStorageSync('userPreferences') || {}
    return {
      categories: prefs.categories || [],
      priceRange: prefs.priceRange || { min: 0, max: 1000 },
      preferredTime: prefs.preferredTime || [],
      location: prefs.location || null
    }
  }

  loadUserBehavior() {
    const behavior = uni.getStorageSync('userBehavior') || []
    return behavior
  }

  saveUserBehavior(behavior) {
    const current = this.loadUserBehavior()
    current.unshift(behavior)
    if (current.length > 100) {
      current.pop()
    }
    uni.setStorageSync('userBehavior', current)
    this.userBehavior = current
  }

  updateUserPreferences(prefs) {
    this.userPreferences = { ...this.userPreferences, ...prefs }
    uni.setStorageSync('userPreferences', this.userPreferences)
  }

  trackView(partyId, category) {
    this.saveUserBehavior({
      type: 'view',
      partyId,
      category,
      timestamp: Date.now()
    })
  }

  trackFavorite(partyId, category) {
    this.saveUserBehavior({
      type: 'favorite',
      partyId,
      category,
      timestamp: Date.now()
    })
  }

  trackOrder(partyId, category, price) {
    this.saveUserBehavior({
      type: 'order',
      partyId,
      category,
      price,
      timestamp: Date.now()
    })
  }

  getCategoryScores() {
    const scores = {}
    this.userBehavior.forEach(behavior => {
      const category = behavior.category
      if (!scores[category]) {
        scores[category] = 0
      }

      switch (behavior.type) {
        case 'view':
          scores[category] += 1
          break
        case 'favorite':
          scores[category] += 5
          break
        case 'order':
          scores[category] += 10
          break
      }
    })

    return scores
  }

  calculateCategoryScore(party, categoryScores) {
    const score = categoryScores[party.category] || 0
    const maxScore = Math.max(...Object.values(categoryScores), 1)
    return score / maxScore
  }

  calculateLocationScore(party, userLocation) {
    if (!userLocation || !party.latitude || !party.longitude) {
      return 0.5
    }

    const distance = this.getDistance(
      userLocation.latitude,
      userLocation.longitude,
      party.latitude,
      party.longitude
    )

    if (distance <= 5) return 1
    if (distance <= 10) return 0.8
    if (distance <= 20) return 0.6
    if (distance <= 50) return 0.4
    return 0.2
  }

  calculateTimeScore(party, preferredTimes) {
    if (!preferredTimes || preferredTimes.length === 0) {
      return 0.5
    }

    const partyTime = new Date(party.start_time)
    const partyHour = partyTime.getHours()

    const timeRanges = {
      morning: [6, 12],
      afternoon: [12, 18],
      evening: [18, 24],
      night: [0, 6]
    }

    for (const pref of preferredTimes) {
      const range = timeRanges[pref]
      if (range && partyHour >= range[0] && partyHour < range[1]) {
        return 1
      }
    }

    return 0.3
  }

  calculatePriceScore(party, priceRange) {
    if (!priceRange) {
      return 0.5
    }

    const minPrice = this.getMinPrice(party.ticket_types)
    if (minPrice >= priceRange.min && minPrice <= priceRange.max) {
      return 1
    }

    const diff = Math.min(
      Math.abs(minPrice - priceRange.min),
      Math.abs(minPrice - priceRange.max)
    )

    if (diff <= 50) return 0.8
    if (diff <= 100) return 0.6
    if (diff <= 200) return 0.4
    return 0.2
  }

  calculatePopularityScore(party) {
    const ratio = party.participant_count / party.max_participants
    return Math.min(ratio, 1)
  }

  getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRad(deg) {
    return deg * (Math.PI / 180)
  }

  getMinPrice(ticketTypes) {
    if (!ticketTypes || ticketTypes.length === 0) return 0
    const prices = ticketTypes.map(t => parseFloat(t.price))
    return Math.min(...prices)
  }

  calculateScore(party, userLocation = null) {
    const categoryScores = this.getCategoryScores()

    const categoryScore = this.calculateCategoryScore(party, categoryScores)
    const locationScore = this.calculateLocationScore(party, userLocation || this.userPreferences.location)
    const timeScore = this.calculateTimeScore(party, this.userPreferences.preferredTime)
    const priceScore = this.calculatePriceScore(party, this.userPreferences.priceRange)
    const popularityScore = this.calculatePopularityScore(party)

    const totalScore =
      categoryScore * this.weights.category +
      locationScore * this.weights.location +
      timeScore * this.weights.time +
      priceScore * this.weights.price +
      popularityScore * this.weights.popularity

    return {
      total: totalScore,
      category: categoryScore,
      location: locationScore,
      time: timeScore,
      price: priceScore,
      popularity: popularityScore
    }
  }

  recommend(parties, userLocation = null, limit = 10) {
    const scoredParties = parties.map(party => ({
      party,
      scores: this.calculateScore(party, userLocation)
    }))

    scoredParties.sort((a, b) => b.scores.total - a.scores.total)

    return scoredParties.slice(0, limit).map(item => ({
      ...item.party,
      recommendationScore: item.scores.total,
      recommendationReason: this.getRecommendationReason(item.scores)
    }))
  }

  getRecommendationReason(scores) {
    const reasons = []

    if (scores.category > 0.7) {
      reasons.push('符合您的兴趣偏好')
    }
    if (scores.location > 0.8) {
      reasons.push('距离较近')
    }
    if (scores.time > 0.8) {
      reasons.push('时间合适')
    }
    if (scores.price > 0.8) {
      reasons.push('价格合适')
    }
    if (scores.popularity > 0.8) {
      reasons.push('热门推荐')
    }

    return reasons.length > 0 ? reasons.join('，') : '为您推荐'
  }

  getSimilarParties(targetParty, allParties, limit = 5) {
    const scored = allParties
      .filter(p => p.id !== targetParty.id)
      .map(party => {
        let similarity = 0

        if (party.category === targetParty.category) {
          similarity += 0.4
        }

        const priceDiff = Math.abs(
          this.getMinPrice(party.ticket_types) - this.getMinPrice(targetParty.ticket_types)
        )
        if (priceDiff <= 50) {
          similarity += 0.3
        } else if (priceDiff <= 100) {
          similarity += 0.2
        }

        if (party.organizer_id === targetParty.organizer_id) {
          similarity += 0.3
        }

        return { party, similarity }
      })

    scored.sort((a, b) => b.similarity - a.similarity)

    return scored.slice(0, limit).map(item => item.party)
  }

  clearBehavior() {
    uni.removeStorageSync('userBehavior')
    this.userBehavior = []
  }

  clearPreferences() {
    uni.removeStorageSync('userPreferences')
    this.userPreferences = this.loadUserPreferences()
  }
}

const recommendationEngine = new RecommendationEngine()

export default recommendationEngine
