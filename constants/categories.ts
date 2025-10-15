import { Ionicons } from '@expo/vector-icons';

export interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export const CATEGORIES: Category[] = [
  { 
    id: 'restaurant', 
    name: '음식점', 
    icon: 'restaurant',
    color: '#FF8E8E'
  },
  { 
    id: 'accommodation', 
    name: '숙박', 
    icon: 'bed',
    color: '#4ECDC4'
  },
  { 
    id: 'cafe', 
    name: '카페', 
    icon: 'cafe',
    color: '#8B4513'
  },
  { 
    id: 'convenience', 
    name: '편의점', 
    icon: 'storefront',
    color: '#45B7D1'
  },
  { 
    id: 'mart', 
    name: '마트', 
    icon: 'cart',
    color: '#96CEB4'
  },
  { 
    id: 'hospital', 
    name: '병원', 
    icon: 'medical',
    color: '#FFEAA7'
  },
  { 
    id: 'pharmacy', 
    name: '약국', 
    icon: 'medical',
    color: '#F7DC6F'
  },
  { 
    id: 'parking', 
    name: '주차장', 
    icon: 'car',
    color: '#98D8C8'
  },
  { 
    id: 'gas_station', 
    name: '주유소', 
    icon: 'car',
    color: '#DDA0DD'
  },
  { 
    id: 'beauty', 
    name: '미용실', 
    icon: 'cut',
    color: '#FFB6C1'
  },
  { 
    id: 'glasses', 
    name: '안경', 
    icon: 'eye',
    color: '#87CEEB'
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(category => category.id === id);
};

export const getCategoryIcon = (id: string): keyof typeof Ionicons.glyphMap => {
  const category = getCategoryById(id);
  return category?.icon || 'help-circle';
};
