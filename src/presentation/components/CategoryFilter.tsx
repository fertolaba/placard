import { View } from 'react-native';
import type { CategoryFilterValue } from '../hooks/useGarments';
import { SegmentedControl } from './SegmentedControl';

/** Las categorías, en el orden en que se muestran (también es el orden al deslizar). */
export const CATEGORY_OPTIONS: { value: CategoryFilterValue; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'arriba', label: 'Arriba' },
  { value: 'abajo', label: 'Abajo' },
  { value: 'calzado', label: 'Calzado' },
];

interface Props {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <View style={{ marginHorizontal: 20 }}>
      <SegmentedControl options={CATEGORY_OPTIONS} value={value} onChange={onChange} />
    </View>
  );
}