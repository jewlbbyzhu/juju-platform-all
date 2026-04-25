import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Image,
  FlatList,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { socialApi } from '../api/social';
import {
  useTheme,
  spacing,
  BorderRadius,
  gradients,
  typography,


} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

interface SelectedImage {
  uri: string;
  type?: string;
  name?: string;
}

const MAX_IMAGES = 9;

// 2026高颜值设计 - 发布动态页 (重构版，使用设计系统替代内联样式)
export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // 模拟图片选择功能
  const handleSelectImages = useCallback(() => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('提示', `最多只能选择${MAX_IMAGES}张图片`);
      return;
    }

    // 模拟选择图片
    const mockImages: SelectedImage[] = [
      {
        uri: 'https://via.placeholder.com/200',
        type: 'image/jpeg',
        name: 'image1.jpg',
      },
      {
        uri: 'https://via.placeholder.com/200',
        type: 'image/jpeg',
        name: 'image2.jpg',
      },
    ];

    const remainingSlots = MAX_IMAGES - images.length;
    const newImages = mockImages.slice(0, remainingSlots);

    setImages(prev => [...prev, ...newImages]);
    Alert.alert('提示', '已添加图片（模拟）');
  }, [images.length]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setUploadingImages(true);
    try {
      // 模拟图片上传
      const uploadedUrls = images.map(
        (_, index) =>
          `https://example.com/uploads/image_${Date.now()}_${index}.jpg`,
      );

      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      return uploadedUrls;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('提示', '请输入内容或添加图片');
      return;
    }

    setLoading(true);
    try {
      // 先上传图片
      const imageUrls = await uploadImages();

      // 创建帖子
      const res = await socialApi.createPost({
        content: content.trim(),
        images: imageUrls,
      });

      if ((res as any).data?.code === 0) {
        Alert.alert('发布成功', '', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('发布失败', (res as any).data?.message || '请稍后重试');
      }
    } catch (e) {
      console.error('发布失败:', e);
      Alert.alert('发布失败', '网络错误，请稍后重试');
    }
    setLoading(false);
  };

  // 命名样式对象替代内联样式
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerGradientStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  };

  const cancelButtonStyle: ViewStyle = {
    padding: spacing.sm,
  };

  const cancelTextStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.inverse,
    fontWeight: typography.weight.medium,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  };

  const scrollViewStyle: ViewStyle = {
    flex: 1,
    padding: spacing.lg,
  };

  const inputCardStyle: ViewStyle = {
    marginBottom: spacing.lg,
  };

  const textInputStyle: TextStyle = {
    fontSize: typography.size.body,
    lineHeight: typography.size.body * typography.lineHeight.normal,
    minHeight: 150,
    textAlignVertical: 'top',
    color: colors.text.primary,
    padding: spacing.sm,
  };

  const charCountContainerStyle: ViewStyle = {
    alignItems: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  };

  const charCountTextStyle: TextStyle = {
    color: colors.text.tertiary,
    fontSize: typography.size.caption,
  };

  const imageListContainerStyle: ViewStyle = {
    marginTop: spacing.xl,
  };

  const imageListContentStyle: ViewStyle = {
    paddingVertical: spacing.md,
  };

  const imageItemContainerStyle: ViewStyle = {
    position: 'relative',
    marginRight: spacing.md,
  };

  const imageStyle: ImageStyle = {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.gray[700],
    borderWidth: 1,
    borderColor: colors.divider,
  };

  const removeButtonStyle: ViewStyle = {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.sm,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.secondary,
  };

  const removeButtonTextStyle: TextStyle = {
    color: colors.text.inverse,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    marginTop: -2,
  };

  const addImageButtonStyle: ViewStyle = {
    marginTop: spacing.xl,
    width: 100,
    height: 100,
    backgroundColor: colors.gray[700],
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const addImagePlusStyle: TextStyle = {
    fontSize: 32,
    color: colors.text.tertiary,
    fontWeight: typography.weight.regular,
  };


    fontSize: typography.size.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  };

  const renderImageItem = ({
    item,
    index,
  }: {
    item: SelectedImage;
    index: number;
  }) => (
    <View style={imageItemContainerStyle}>
      <Image source={{ uri: item.uri }} style={imageStyle} />
      <GlassButton
        title="×"
        onPress={() => handleRemoveImage(index)}
        variant="danger"
        size="small"
        style={removeButtonStyle}
        textStyle={removeButtonTextStyle}
      />
    </View>
  );

  return (
    <SafeAreaView style={safeAreaStyle} edges={['bottom']}>
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={headerGradientStyle}
      >
        <GlassButton
          title="取消"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="small"
          style={cancelButtonStyle}
          textStyle={cancelTextStyle}
        />
        <Text style={headerTitleStyle}>发布动态</Text>
        <GlassButton
          title={loading || uploadingImages ? '' : '发布'}
          onPress={handleSubmit}
          variant="secondary"
          size="small"
          loading={loading || uploadingImages}
          disabled={loading || uploadingImages}
        />
      </LinearGradient>

      <ScrollView style={scrollViewStyle}>
        {/* Glass Input Card */}
        <GlassCard style={inputCardStyle} intensity="light">
          <TextInput
            style={textInputStyle}
            multiline
            placeholder="分享你的精彩时刻..."
            placeholderTextColor={colors.text.tertiary}
            value={content}
            onChangeText={setContent}
            maxLength={500}
          />
          <View style={charCountContainerStyle}>
            <Text style={charCountTextStyle}>
              {content.length}/500
            </Text>
          </View>
        </GlassCard>

        {/* Images Preview */}
        {images.length > 0 && (
          <View style={imageListContainerStyle}>
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={imageListContentStyle}
            />
          </View>
        )}

        {/* Add Image Button */}
        {images.length < MAX_IMAGES && (
          <GlassButton
            title="+"
            onPress={handleSelectImages}
            variant="ghost"
            size="small"
            disabled={uploadingImages}
            style={addImageButtonStyle}
            textStyle={addImagePlusStyle}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
