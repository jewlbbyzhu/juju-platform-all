import React, { memo } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { PartyData } from '../../hooks/useTicketSelect';
import { partyInfoCardStyles as styles } from '../../styles/ticketSelect';

interface PartyInfoCardProps {
  party: PartyData;
  index?: number;
}

export const PartyInfoCard: React.FC<PartyInfoCardProps> = memo(
  ({ party, index = 0 }) => {
    const formattedDate = new Date(party.startTime).toLocaleDateString(
      'zh-CN',
      {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    return (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(300)}>
        <GlassCard style={styles.container} intensity="light">
          <Image
            source={{
              uri:
                party.coverImage ||
                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
            }}
            style={styles.image}
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {party.title}
            </Text>
            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🕐</Text>
                <Text style={styles.metaText}>{formattedDate}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {party.location?.name || '地点待定'}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    );
  },
);

PartyInfoCard.displayName = 'PartyInfoCard';
