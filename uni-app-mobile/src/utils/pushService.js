import { pushApi } from '../api/push.js'

class PushService {
  constructor() {
    this.clientId = null
    this.isRegistered = false
    this.messageHandler = null
    this.clickHandler = null
  }

  async init() {
    try {
      const platform = uni.getSystemInfoSync().platform

      if (platform === 'mp-weixin') {
        await this.initWechatPush()
      } else if (platform === 'app') {
        await this.initAppPush()
      } else {
        console.log('Push not supported on this platform:', platform)
      }
    } catch (error) {
      console.error('Failed to init push service:', error)
    }
  }

  async initWechatPush() {
    try {
      const res = await uni.requestSubscribeMessage({
        tmplIds: [
          'party-reminder',
          'order-success',
          'order-cancel',
          'wallet-change',
          'vip-expire'
        ]
      })

      if (res.errMsg === 'requestSubscribeMessage:ok') {
        console.log('WeChat push subscribed successfully')
        this.isRegistered = true
      }
    } catch (error) {
      console.error('Failed to init WeChat push:', error)
    }
  }

  async initAppPush() {
    try {
      const info = await uni.getPushClientId()
      this.clientId = info.clientid

      console.log('Push client ID:', this.clientId)

      await this.registerClient()

      uni.onPushMessage(this.handlePushMessage.bind(this))
      uni.onPushClick(this.handlePushClick.bind(this))

      this.isRegistered = true
    } catch (error) {
      console.error('Failed to init App push:', error)
    }
  }

  async registerClient() {
    try {
      const systemInfo = uni.getSystemInfoSync()
      const clientInfo = {
        clientId: this.clientId,
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        model: systemInfo.model
      }

      await pushApi.registerPush(clientInfo)

      console.log('Push client registered successfully')
    } catch (error) {
      console.error('Failed to register push client:', error)
    }
  }

  async unregister() {
    try {
      if (this.isRegistered) {
        await pushApi.unregisterPush()

        this.clientId = null
        this.isRegistered = false

        console.log('Push unregistered successfully')
      }
    } catch (error) {
      console.error('Failed to unregister push:', error)
    }
  }

  handlePushMessage(message) {
    console.log('Received push message:', message)

    if (this.messageHandler) {
      this.messageHandler(message)
    }

    this.updateNotificationBadge()

    uni.$emit('pushMessage', message)
  }

  handlePushClick(message) {
    console.log('Push message clicked:', message)

    if (this.clickHandler) {
      this.clickHandler(message)
    }

    this.handleMessageNavigation(message)
  }

  handleMessageNavigation(message) {
    try {
      const { type, data } = message

      switch (type) {
        case 'party':
          uni.navigateTo({
            url: `/pages/party-detail/party-detail?id=${data.partyId}`
          })
          break
        case 'order':
          uni.navigateTo({
            url: `/pages/my-orders/my-orders?orderId=${data.orderId}`
          })
          break
        case 'ticket':
          uni.navigateTo({
            url: `/pages/my-tickets/my-tickets?ticketId=${data.ticketId}`
          })
          break
        case 'wallet':
          uni.navigateTo({
            url: '/pages/wallet/wallet'
          })
          break
        case 'vip':
          uni.navigateTo({
            url: '/pages/vip/vip'
          })
          break
        case 'system':
          uni.navigateTo({
            url: '/pages/notifications/notifications'
          })
          break
        default:
          console.log('Unknown message type:', type)
      }
    } catch (error) {
      console.error('Failed to navigate to message target:', error)
    }
  }

  async updateNotificationBadge() {
    try {
      const res = await pushApi.getNotifications({
        unreadOnly: true,
        page: 1,
        pageSize: 1
      })

      if (res.code === 0) {
        const unreadCount = res.data.total || 0
        uni.setTabBarBadge({
          index: 4,
          text: unreadCount > 0 ? String(unreadCount) : ''
        })
      }
    } catch (error) {
      console.error('Failed to update notification badge:', error)
    }
  }

  setMessageHandler(handler) {
    this.messageHandler = handler
  }

  setClickHandler(handler) {
    this.clickHandler = handler
  }

  getClientId() {
    return this.clientId
  }

  isPushEnabled() {
    return this.isRegistered
  }
}

const pushService = new PushService()

export default pushService
