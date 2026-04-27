import React, { useState, useCallback, memo } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { FaqItem } from './FaqItem';
import { FAQ_LIST } from './types';
import { spacing } from '../../theme';

export const FaqSection: React.FC = memo(() => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  }, []);

  return (
    <GlassCard
      title="常见问题"
      style={{ margin: spacing.lg, marginTop: 0 }}
      intensity="light"
    >
      {FAQ_LIST.map((faq, index) => (
        <FaqItem
          key={`${faq.question}-${index}`}
          faq={faq}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
          isLast={index === FAQ_LIST.length - 1}
          animationDelay={100 + index * 50}
        />
      ))}
    </GlassCard>
  );
});

FaqSection.displayName = 'FaqSection';

export default FaqSection;
