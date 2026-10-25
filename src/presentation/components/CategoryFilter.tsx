import { View } from 'react-native';
import type { Sex } from '../../domain/entities/Sex';
import { categoryOptionsFor } from '../categoryUi';
import type { CategoryFilterValue } from '../hooks/useGarments';
import { SegmentedControl } from './SegmentedControl';

/** Las categorías del perfil, en el orden en que se muestran (también es el orden al deslizar). */
export function categoryFilterOptions(sex: Sex | null): { value: CategoryFilterValue; label: string }[] {
  return [{ value: 'todo', label: 'Todo' }, ...categoryOptionsFor(sex)];
}

interface Props {
  options: { value: CategoryFilterValue; label: string }[];
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

export function CategoryFilter({ options, value, onChange }: Props) {
  return (
    <View style={{ marginHorizontal: 20 }}>
      <SegmentedControl options={options} value={value} onChange={onChange} />
    </View>
  );
}