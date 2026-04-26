import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import Animated, { FadeInUp } from 'react-native-reanimated';
import { partyApi } from '../api/party';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton } from '../components/Skeleton';
import {
  useTheme,
  glassmorphism,
  spacing,
  typography,
  BorderRadius,
  animation,
} from '../theme';

interface Party {
  id: string;
  title: string;
  cover_image?: string;
  start_time: string;
}

export default function ReviewScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const partyId = route.params?.partyId as string | undefined;

  const { colors } = useTheme();

  const [party, setParty] = useState<Party>({
    id: '',
    title: '',
    start_time: '',
  });
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const reviewTags = [
    '氛围很棒',
    '组织有序',
    '认识新朋友',
    '物超所值',
    '场地不错',
    '活动有趣',
    '服务周到',
    '推荐参加',
  ];
  const ratingTexts = ['非常差', '差', '一般', '好', '非常好'];

  useEffect(() => {
    if (partyId) fetchPartyInfo();
  }, [partyId]);

  const fetchPartyInfo = async () => {
    try {
      const res = await partyApi.getPartyDetail(partyId);
      if ((res as any).code === 0) setParty((res as any).data);
    } catch (error) {
      console.error('获取活动信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const canSubmit = () => rating > 0 && content.trim().length >= 10;

  const submitReview = async () => {
    if (!canSubmit()) {
      Alert.alert('提示', '请评分并填写至少10个字的评价');
      return;
    }
    setSubmitting(true);
    try {
      const res = await partyApi.submitReview({
        partyId: Number(partyId) || 0,
        rating,
        content,
        tags: selectedTags,
      });
      if ((res as any).code === 0) {
        Alert.alert('评价成功', '感谢您的评价！', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      }

      Alert.alert('错误', '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const date = new Date(time);
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  };

  // 命名样式对象 - 替代 useMemo 内联样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const partyCardStyle: ViewStyle = {
    margin: spacing.lg,
    marginBottom: spacing.md,
  };

  const skeletonRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const skeletonTextStyle: ViewStyle = {
    flex: 1,
    marginLeft: spacing.md,
  };

  const partySectionStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const partyImageStyle: ImageStyle = {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: spacing.md,
  };

  const partyInfoStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
  };

  const partyTitleStyle: TextStyle = {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 24,
  };

  const partyTimeStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  };

  const ratingCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  };

  const starRatingStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  };

  const starBtnStyle: ViewStyle = {
    padding: spacing.xs,
  };

  const starStyle: TextStyle = {
    fontSize: 40,
    color: colors.gray[300],
    textShadowColor: colors.gray[900] + '1A',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  };

  const starActiveStyle: TextStyle = {
    color: colors.accent.gold,
    textShadowColor: colors.accent.gold + '80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  };

  const ratingTextStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  };

  const tagsCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const tagsListStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  };

  const tagItemBaseStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const tagItemActiveStyle: ViewStyle = {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
    ...glassmorphism.button,
  };

  const tagTextBaseStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  };

  const tagTextActiveStyle: TextStyle = {
    color: colors.text.inverse,
    fontWeight: typography.weight.semibold,
  };

  const contentCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const textareaContainerStyle: ViewStyle = {
    position: 'relative',
  };

  const reviewTextareaStyle: TextStyle = {
    height: 120,
    backgroundColor: colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: spacing.lg,
    fontSize: typography.size.body,
    color: colors.text.primary,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  };

  const wordCountStyle: TextStyle = {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
    fontWeight: typography.weight.medium,
  };

  const anonymousCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  };

  const anonymousOptionStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const checkboxBaseStyle: ViewStyle = {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: BorderRadius.sm,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  };

  const checkboxCheckedStyle: ViewStyle = {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  };

  const checkboxTextStyle: TextStyle = {
    color: colors.text.inverse,
    fontSize: typography.size.body2,
    fontWeight: typography.weight.bold,
  };

  const anonymousTextStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  };

  const submitContainerStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing['3xl'],
  };

  const renderStar = useCallback(
    (index: number) => (
      <GlassButton
        key={index}
        title="★"
        onPress={() => setRating(index)}
        variant="ghost"
        size="small"
        style={starBtnStyle}
        textStyle={[
          starStyle,
          index <= rating && starActiveStyle,
        ]}
      />
    ),
    [rating],
  );

  const renderTag = useCallback(
    (tag: string) => {
      const isActive = selectedTags.includes(tag);
      return (
        <GlassButton
          key={tag}
          title={tag}
          onPress={() => toggleTag(tag)}
          variant={isActive ? 'primary' : 'ghost'}
          size="small"
          style={[
            tagItemBaseStyle,
            isActive && tagItemActiveStyle,
          ]}
          textStyle={[
            tagTextBaseStyle,
            isActive && tagTextActiveStyle,
          ]}
        />
      );
    },
    [selectedTags],
  );

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Party Info Card */}
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(100)}
        >
          <GlassCard style={partyCardStyle}>
            {loading ? (
              <View style={skeletonRowStyle}>
                <Skeleton width={80} height={80} borderRadius={BorderRadius.md} />
                <View style={skeletonTextStyle}>
                  <Skeleton width="70%" height={20} />
                  <Skeleton width="50%" height={14} style={{ marginTop: spacing.md }} />
                </View>
              </View>
            ) : (
              <View style={partySectionStyle}>
                <Image
                  source={{ uri: party.cover_image || '' }}
                  style={partyImageStyle}
                />
                <View style={partyInfoStyle}>
                  <Text style={partyTitleStyle}>{party.title}</Text>
                  <Text style={partyTimeStyle}>
                    {formatTime(party.start_time)}
                  </Text>
                </View>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Rating Section */}
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(200)}
        >
          <GlassCard style={ratingCardStyle} intensity="medium">
            <Text style={sectionTitleStyle}>总体评价</Text>
            <View style={starRatingStyle}>
              {[1, 2, 3, 4, 5].map(renderStar)}
            </View>
            <Text style={ratingTextStyle}>{ratingTexts[rating - 1]}</Text>
          </GlassCard>
        </Animated.View>

        {/* Tags Section */}
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(300)}
        >
          <GlassCard style={tagsCardStyle} intensity="light">
            <Text style={sectionTitleStyle}>选择标签</Text>
            <View style={tagsListStyle}>
              {reviewTags.map(renderTag)}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Content Section */}
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(400)}
        >
          <GlassCard style={contentCardStyle} intensity="medium">
            <Text style={sectionTitleStyle}>评价内容</Text>
            <View style={textareaContainerStyle}>
              <TextInput
                style={reviewTextareaStyle}
                value={content}
                onChangeText={setContent}
                placeholder="分享你的聚会体验，帮助更多人了解这个活动..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                maxLength={500}
              />
              <Text style={wordCountStyle}>{content.length}/500</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Anonymous Section */}
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(500)}
        >
          <GlassCard style={anonymousCardStyle} intensity="light">
            <GlassButton
              title="匿名评价"
              onPress={() => setIsAnonymous(!isAnonymous)}
              variant="ghost"
              size="small"
              style={anonymousOptionStyle}
              icon={
                <View
                  style={[
                    checkboxBaseStyle,
                    isAnonymous && checkboxCheckedStyle,
                  ]}
                >
                  {isAnonymous && <Text style={checkboxTextStyle}>✓</Text>}
                </View>
              }
              textStyle={anonymousTextStyle}
            />
          </GlassCard>
        </Animated.View>

        {/* Submit Button */}
        <View style={submitContainerStyle}>
          <GlassButton
            title={submitting ? '提交中...' : '提交评价'}
            onPress={submitReview}
            disabled={!canSubmit() || submitting}
            variant="gradient"
            size="large"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
