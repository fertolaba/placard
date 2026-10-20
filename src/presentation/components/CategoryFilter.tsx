import { View } from 'react-native';
import type { CategoryFilterValue } from '../hooks/useGarments';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS: { value: CategoryFilterValue; label: string }[] = [
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
      <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />
    </View>
  );
}