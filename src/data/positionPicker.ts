export interface PositionPickerCategory {
  id: string;
  label: string;
  options: string[];
}

export interface PositionPickerSelection {
  categoryId: string;
  option: string | null;
}

export const POSITION_PICKER_CATEGORIES: PositionPickerCategory[] = [
  {
    id: 'popular',
    label: '热门职位',
    options: ['司机', '保安', '普工', '客服', '项目经理'],
  },
  {
    id: 'general-worker',
    label: '普工',
    options: ['操作工', '包装工', '分拣员', '装卸工', '搬运工'],
  },
  {
    id: 'skilled-worker',
    label: '技工',
    options: ['电工', '焊工', '木工', '水电工', '维修工'],
  },
  {
    id: 'machining',
    label: '机械加工',
    options: ['车工', '钳工', '铣工', '模具工', '机修工'],
  },
  {
    id: 'auto-service',
    label: '汽车服务',
    options: ['洗车工', '汽修工', '代驾司机', '商务司机', '跟车员'],
  },
  {
    id: 'driver',
    label: '司机',
    options: ['滴滴司机', '叉车司机', '卡车司机', '飞机司机', '船司机'],
  },
  {
    id: 'security',
    label: '保安',
    options: ['保安', '门卫', '保安员', '巡逻岗', '监控岗'],
  },
  {
    id: 'safety',
    label: '安全员',
    options: ['安全员', '施工安全员', '安全巡检员', '消防中控员', '安检员'],
  },
  {
    id: 'project-manager',
    label: '项目经理',
    options: ['项目经理', '项目主管', '工程项目经理', '交付经理', '招商主管'],
  },
  {
    id: 'customer-service',
    label: '客服',
    options: ['客服', '电话客服', '在线客服', '售后客服', '前台客服'],
  },
];

export const DEFAULT_POSITION_PICKER_CATEGORY_ID = 'popular';

export function findPositionPickerSelection(position: string): PositionPickerSelection | null {
  const normalized = position.trim();
  if (!normalized) {
    return null;
  }

  for (const category of POSITION_PICKER_CATEGORIES) {
    const match = category.options.find((option) => option === normalized);
    if (match) {
      return {
        categoryId: category.id,
        option: match,
      };
    }
  }

  const driverCategory = POSITION_PICKER_CATEGORIES.find((category) => category.id === 'driver');
  if (normalized.includes('司机') && driverCategory) {
    return {
      categoryId: driverCategory.id,
      option: null,
    };
  }

  return null;
}

export function getPositionPickerCategory(categoryId: string) {
  return (
    POSITION_PICKER_CATEGORIES.find((category) => category.id === categoryId) ??
    POSITION_PICKER_CATEGORIES[0]
  );
}
