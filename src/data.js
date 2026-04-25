// Mock course data matching original site structure
export const courses = [
  {
    id: 'cm0m24un00008yt3rb67hh3uj',
    slug: 'live-s-2k7',
    name: 'LIVE S - Khởi động - Toán 2K7 - HTT',
    price: 1000000,
    oldPrice: 2000000,
    image: '/api/assets/course/cm0m24un00008yt3rb67hh3uj',
  },
  {
    id: 'cm0m26sih000ayt3rrw4yke29',
    slug: 'live-c-2k7',
    name: 'LIVE C - Chuyên đề - Toán 2K7 - HTT',
    price: 1000000,
    oldPrice: 2000000,
    image: '/api/assets/course/cm0m26sih000ayt3rrw4yke29',
  },
  {
    id: 'cm0m2b4pv000cyt3rro70uqii',
    slug: 'live-t-2k7',
    name: 'LIVE T - Luyện đề - Toán 2K7 - HTT',
    price: 1000000,
    oldPrice: 2000000,
    image: '/api/assets/course/cm0m2b4pv000cyt3rro70uqii',
  },
  {
    id: 'cm0m2cabc000eyt3rrkgcv8zz',
    slug: 'live-g-2k7',
    name: 'LIVE G - Tổng ôn - Toán học 2K7 - HTT',
    price: 1000000,
    oldPrice: 2000000,
    image: '/api/assets/course/cm0m2cabc000eyt3rrkgcv8zz',
  },
  {
    id: 'cm0m2dyg4000gyt3r8vs2r8fx',
    slug: 'live-vip-hk1-2k8',
    name: 'LIVE VIP TOÁN LỚP 11 HỌC KỲ 1 2K8 THẦY HỒ THỨC THUẬN',
    price: 1200000,
    oldPrice: 2400000,
    image: '/api/assets/course/cm0m2dyg4000gyt3r8vs2r8fx',
  },
  {
    id: 'cm0m2fcma000iyt3r5cnoxxn3',
    slug: 'live-vip-hk2-2k8',
    name: 'LIVE VIP TOÁN LỚP 11 HỌC KỲ 2 2K8 THẦY HỒ THỨC THUẬN',
    price: 1200000,
    oldPrice: 2400000,
    image: '/api/assets/course/cm0m2fcma000iyt3r5cnoxxn3',
  },
  {
    id: 'cmjnot0110005n4ej9oid615i',
    slug: '2k8livec',
    name: 'KHÓA LIVE C CHUYÊN ĐỀ 2K8',
    price: 1990000,
    oldPrice: 3600000,
    image: '/api/assets/course/cmjnot0110005n4ej9oid615i',
  },
]

export const combos = [
  {
    id: 'cm0m2hhi6000jyt3ra143ofm9',
    name: 'COMBO LIVE VIP TOÁN 11 - Khoá 2K8 THẦY HỒ THỨC THUẬN',
    price: 1800000,
    oldPrice: 3600000,
    image: '/api/assets/combo/cm0m2hhi6000jyt3ra143ofm9',
  },
  {
    id: 'cm0m2ix9e000kyt3rec9bmop3',
    name: 'COMBO CTG TOÁN 2K7 - HTT',
    price: 2000000,
    oldPrice: 4000000,
    image: '/api/assets/combo/cm0m2ix9e000kyt3rec9bmop3',
  },
]

export const books = [
  {
    id: 'cm0m1z3mh0002yt3rd2ndvwsa',
    name: 'BỘ 20 ĐỀ ĐÁNH GIÁ NĂNG LỰC MÔN TOÁN ĐẠI HỌC QUỐC GIA HÀ NỘI',
    price: 190000,
    oldPrice: 250000,
    image: '/api/assets/book/cm0m1z3mh0002yt3rd2ndvwsa',
  },
  {
    id: 'cm0m20o7l0003yt3r89xuax8t',
    name: 'BỘ 20 ĐỀ ĐÁNH GIÁ NĂNG LỰC MÔN TOÁN ĐẠI HỌC QUỐC GIA HỒ CHÍ MINH',
    price: 190000,
    oldPrice: 250000,
    image: '/api/assets/book/cm0m20o7l0003yt3r89xuax8t',
  },
  {
    id: 'cm0m21ddp0004yt3rwqzo4186',
    name: 'BỘ 20 ĐỀ ĐÁNH GIÁ NĂNG LỰC MÔN TOÁN ĐẠI HỌC BÁCH KHOA HN',
    price: 190000,
    oldPrice: 250000,
    image: '/api/assets/book/cm0m21ddp0004yt3rwqzo4186',
  },
  {
    id: 'cm0m2202h0005yt3r2q21csw7',
    name: '26 CHUYÊN ĐỀ VDC TOÁN LỚP 12',
    price: 190000,
    oldPrice: 250000,
    image: '/api/assets/book/cm0m2202h0005yt3r2q21csw7',
  },
  {
    id: 'cm0m22ibt0006yt3r9cscr60b',
    name: '24 CHUYÊN ĐỀ VDC TOÁN LỚP 11',
    price: 190000,
    oldPrice: 250000,
    image: '/api/assets/book/cm0m22ibt0006yt3r9cscr60b',
  },
]

export const sections = [
  {
    id: 1,
    type: 'COMBOS',
    title: 'COMBO TOÁN HỌC',
    subtitle: 'XUẤT PHÁT SỚM CÙNG 2K7 - 2K8',
    items: combos,
  },
  {
    id: 3,
    type: 'COURSES',
    title: 'KHÓA HỌC 2K8',
    subtitle: 'Chinh Phục Lớp 11 Cùng 2K8',
    items: courses.filter(c => c.slug.includes('2k8')),
  },
  {
    id: 2,
    type: 'COURSES',
    title: 'KHÓA HỌC 2K7',
    subtitle: 'KHOÁ 2K7 - LUYỆN THI THPTQG 2025',
    items: courses.filter(c => c.slug.includes('2k7')),
  },
  {
    id: 4,
    type: 'BOOKS',
    title: 'SÁCH',
    subtitle: 'BỘ ĐỀ ÔN TẬP - XUẤT PHÁT SỚM',
    items: books,
  },
]

export const opinions = {
  honors: [
    'cm0m2shuz000lyt3rha324ybr',
    'cm0m2shuz000myt3reow5qaxl',
    'cm0m2shuz000nyt3rjosnr72a',
    'cm0m2shuz000oyt3re452kyom',
    'cm0m2shuz000pyt3reqcnfsck',
    'cm0m2shuz000qyt3r7gwvtfcu',
    'cm0m2shuz000ryt3r9lps1x0r',
  ],
  feedback: [
    'cm0m2wpuk000zyt3r5lcm6neb',
    'cm0m2wpuk0010yt3rajnmu1rr',
    'cm0m2wpuk0011yt3rq296meqx',
    'cm0m2wpuk0012yt3r1nm0avy5',
    'cm0m2wpuk0013yt3rz8nul2og',
    'cm0m2wpuk0014yt3r1k6thg1l',
    'cm0m2wpuk0015yt3r6wxshnkt',
  ],
}

export const categories = [
  {
    id: 1,
    name: 'Khóa luyện thi Toán 10',
    children: [{ id: 2, name: 'khóa cơ bản' }],
  },
]

export const navLinks = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Khóa học', path: '/khoa-hoc' },
  { label: 'Sách', path: '/sach' },
  { label: 'Thi thử', path: '/de-thi' },
  { label: 'Tài liệu', path: '/tai-lieu' },
  { label: 'Giới thiệu', path: '/gioi-thieu' },
]

export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price)
}
