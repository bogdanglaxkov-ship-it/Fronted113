export interface CustomerRow {
  id: string;
  name: string;
  region: string;
  rating: number;
  volume: number;
  lots: number;
  active: number;
  avgCheck: number;
  participation: number;
  competition: number;
  successRate: number;
  deviationRate: number;
}

export const CUSTOMER_ROWS: CustomerRow[] = [
  { id: "c1", name: "ГККП ясли-сад «Бал-Ерке» ГУ «Отдел образования»", region: "Жетысуская", rating: 100, volume: 230_000, lots: 2, active: 0, avgCheck: 115_000, participation: 1.0, competition: 25, successRate: 25, deviationRate: 0 },
  { id: "c2", name: "ГККП ясли-сад №1 «Арай» ГУ «Отдел образования»", region: "Жетысуская", rating: 100, volume: 42_000, lots: 1, active: 0, avgCheck: 42_000, participation: 1.0, competition: 25, successRate: 25, deviationRate: 0 },
  { id: "c3", name: "ГККП Ясли-сад «Ер Төстік» ГУ «Отдел образования»", region: "Жетысуская", rating: 100, volume: 120_000, lots: 2, active: 0, avgCheck: 60_000, participation: 1.0, competition: 25, successRate: 25, deviationRate: 0 },
  { id: "c4", name: "ГККП детский сад «Ерке-Нұр» ГУ «Отдел образования»", region: "Жетысуская", rating: 100, volume: 360_000, lots: 2, active: 0, avgCheck: 180_000, participation: 1.0, competition: 25, successRate: 25, deviationRate: 0 },
  { id: "c5", name: "ГККП ясли-сад «Таңжарық» ГУ «Отдел образования»", region: "Жетысуская", rating: 100, volume: 246_000, lots: 2, active: 0, avgCheck: 123_000, participation: 1.0, competition: 25, successRate: 25, deviationRate: 0 },
  { id: "c6", name: "ГККП детский сад «Нұрай» ГУ «Отдел образования»", region: "Жетысуская", rating: 100, volume: 215_000, lots: 2, active: 0, avgCheck: 107_000, participation: 1.0, competition: 25, successRate: 25, deviationRate: 0 },
  { id: "c7", name: "КГУ «Управление развития дорожной инфраструктуры»", region: "Алматы", rating: 100, volume: 1_500_000, lots: 2, active: 0, avgCheck: 746_000, participation: 1.0, competition: 25, successRate: 25, deviationRate: 0 },
  { id: "c8", name: "ГУ «Отдел финансов района»", region: "Восточно-Казахстанская", rating: 99, volume: 145_500_000, lots: 22, active: 0, avgCheck: 6_600_000, participation: 1.2, competition: 25, successRate: 25, deviationRate: 1 },
  { id: "c9", name: "ГКП «Аудандық коммуналдық кәсіпорын»", region: "Актюбинская", rating: 98, volume: 263_000, lots: 2, active: 0, avgCheck: 132_000, participation: 1.5, competition: 23, successRate: 25, deviationRate: 0 },
  { id: "c10", name: "ГККП «Ясли-сад №2 «Қуаныш»", region: "Жетысуская", rating: 95, volume: 845_000, lots: 3, active: 0, avgCheck: 282_000, participation: 1.7, competition: 22, successRate: 25, deviationRate: 2 },
  { id: "c11", name: "КГКП «Жамбылский областной историко-краеведческий музей»", region: "Жамбылская", rating: 95, volume: 11_100_000, lots: 34, active: 0, avgCheck: 325_000, participation: 1.6, competition: 22, successRate: 25, deviationRate: 2 },
  { id: "c12", name: "ГУ «Аппарат акима Есильского района»", region: "Астана", rating: 92, volume: 28_400_000, lots: 41, active: 3, avgCheck: 692_000, participation: 1.9, competition: 20, successRate: 24, deviationRate: 3 },
  { id: "c13", name: "КГП на ПХВ «Центральная районная больница»", region: "Туркестанская", rating: 90, volume: 64_200_000, lots: 58, active: 4, avgCheck: 1_107_000, participation: 2.1, competition: 19, successRate: 23, deviationRate: 4 },
  { id: "c14", name: "ГУ «Управление энергетики и ЖКХ»", region: "Карагандинская", rating: 88, volume: 210_000_000, lots: 76, active: 6, avgCheck: 2_763_000, participation: 2.3, competition: 18, successRate: 22, deviationRate: 4 },
  { id: "c15", name: "КГУ «Отдел строительства акимата города»", region: "Шымкент", rating: 85, volume: 512_000_000, lots: 33, active: 5, avgCheck: 15_515_000, participation: 2.0, competition: 21, successRate: 22, deviationRate: 3 },
  { id: "c16", name: "ГККП «Költik су арнасы»", region: "Кызылординская", rating: 83, volume: 96_800_000, lots: 27, active: 2, avgCheck: 3_585_000, participation: 2.4, competition: 17, successRate: 21, deviationRate: 5 },
  { id: "c17", name: "ГУ «Отдел жилищно-коммунального хозяйства»", region: "Павлодарская", rating: 80, volume: 178_500_000, lots: 49, active: 4, avgCheck: 3_643_000, participation: 2.6, competition: 16, successRate: 20, deviationRate: 6 },
  { id: "c18", name: "КГП «Костанайские тепловые сети»", region: "Костанайская", rating: 76, volume: 340_200_000, lots: 62, active: 7, avgCheck: 5_487_000, participation: 2.8, competition: 15, successRate: 19, deviationRate: 7 },
  { id: "c19", name: "ГУ «Управление пассажирского транспорта»", region: "Мангистауская", rating: 72, volume: 89_400_000, lots: 19, active: 1, avgCheck: 4_705_000, participation: 3.0, competition: 14, successRate: 18, deviationRate: 8 },
  { id: "c20", name: "КГУ «Отдел образования, физической культуры и спорта»", region: "Атырауская", rating: 70, volume: 52_600_000, lots: 44, active: 3, avgCheck: 1_195_000, participation: 2.9, competition: 15, successRate: 17, deviationRate: 8 },
];
