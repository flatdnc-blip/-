export type CategoryType = 'all' | 'transit' | 'ocean' | 'community' | 'convenience';

export type ViewMode = 'sunset' | 'day' | 'penthouse' | 'amenities';

export type LabelMode = 'full' | 'compact' | 'minimal';

export interface AmenityMarker {
  id: string;
  title: string;
  category: 'transit' | 'ocean' | 'community' | 'convenience';
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  highlight?: boolean;
  distance: string;
  tag: string;
  description: string;
  details: string[];
  icon: string;
  badgeColor: string;
  image?: string;
  featureMetric?: {
    label: string;
    value: string;
  };
}

export interface ComplexInfo {
  name: string;
  subTitle: string;
  location: string;
  scale: string;
  units: string;
  parking: string;
  developer: string;
  construction: string;
  oceanViewRatio: string;
  transitTime: string;
}

export interface CustomerInquiry {
  name: string;
  phone: string;
  preferredArea: string;
  visitDate?: string;
  purpose: 'living' | 'investment' | 'both';
  wantsOceanView: boolean;
  privacyAgreed: boolean;
}
