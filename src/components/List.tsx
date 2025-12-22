import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, FlatList, ListRenderItem } from 'react-native';

interface ListItem {
  id: string;
  [key: string]: any;
}

interface ListProps<T extends ListItem> {
  data: T[];
  renderItem: ListRenderItem<T>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  emptyText?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showSeparator?: boolean;
  keyExtractor?: (item: T, index: number) => string;
}

function List<T extends ListItem>({
  data,
  renderItem,
  variant = 'primary',
  size = 'md',
  emptyText = 'No items to display',
  style,
  contentContainerStyle,
  showSeparator = true,
  keyExtractor,
}: ListProps<T>) {
  const containerStyle = [
    styles.container,
    styles[`container_${variant}`],
    styles[`container_${size}`],
    style,
  ];

  const defaultKeyExtractor = (item: T, index: number) => item.id || index.toString();

  const itemSeparator = showSeparator ? (
    <View style={[styles.separator, styles[`separator_${variant}`]]} />
  ) : null;

  const emptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, styles[`emptyText_${variant}`]]}>{emptyText}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor || defaultKeyExtractor}
      style={containerStyle}
      contentContainerStyle={contentContainerStyle}
      ItemSeparatorComponent={() => itemSeparator}
      ListEmptyComponent={emptyComponent}
      accessibilityRole="list"
      accessibilityLabel="List"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_primary: {
    backgroundColor: '#1E293B',
  },
  container_secondary: {
    backgroundColor: '#0F172A',
  },
  container_outline: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  container_ghost: {
    backgroundColor: 'transparent',
  },
  container_danger: {
    backgroundColor: '#450A0A',
  },
  container_sm: {
    padding: 8,
  },
  container_md: {
    padding: 12,
  },
  container_lg: {
    padding: 16,
  },
  separator: {
    height: 1,
  },
  separator_primary: {
    backgroundColor: '#334155',
  },
  separator_secondary: {
    backgroundColor: '#475569',
  },
  separator_outline: {
    backgroundColor: '#334155',
  },
  separator_ghost: {
    backgroundColor: '#334155',
  },
  separator_danger: {
    backgroundColor: '#FEE2E2',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText_primary: {
    color: '#6B7280',
  },
  emptyText_secondary: {
    color: '#6B7280',
  },
  emptyText_outline: {
    color: '#6B7280',
  },
  emptyText_ghost: {
    color: '#9CA3AF',
  },
  emptyText_danger: {
    color: '#EF4444',
  },
});

export { List };
export default memo(List) as typeof List;
