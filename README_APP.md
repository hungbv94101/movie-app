# Movie App - React TypeScript Client

Ứng dụng web React để xem và quản lý phim ảnh, sử dụng API server Laravel.

## ✨ Tính năng chính

- 🎬 Xem danh sách phim từ API server
- 🔍 Tìm kiếm phim theo tiêu đề
- ❤️ Thêm/xóa phim yêu thích (localStorage)
- 📱 Responsive design cho mobile và desktop
- 🎨 UI đẹp với Mantine components
- 🚀 Fast loading với Vite
- 📖 Chi tiết phim đầy đủ

## 🛠️ Công nghệ sử dụng

- **React 19** với **TypeScript**
- **Vite** - Build tool nhanh
- **Mantine UI** - Component library
- **Zustand** - State management
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📁 Cấu trúc dự án

```
src/
├── components/         # Reusable UI components
│   ├── MovieCard.tsx  # Card hiển thị phim
│   ├── SearchBar.tsx  # Thanh tìm kiếm
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── Pagination.tsx
├── pages/             # Page components
│   ├── HomePage.tsx   # Trang chủ
│   └── MovieDetailPage.tsx # Chi tiết phim
├── services/          # API services
│   └── movieApi.ts    # Movie API calls
├── store/             # Zustand store
│   └── movieStore.ts  # Global state
├── types/             # TypeScript types
│   └── movie.ts       # Movie interfaces
├── utils/             # Utility functions
│   └── localStorage.ts # LocalStorage helpers
└── App.tsx            # Main app component
```

## 🚀 Cài đặt và chạy

### Prerequisites
- Node.js (v18+)
- npm hoặc yarn
- API Server Laravel đang chạy ở `http://localhost:8000`

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

### Build cho production
```bash
npm run build
```

## 🔧 Cấu hình API

API base URL được cấu hình trong file `src/services/movieApi.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

### API Endpoints sử dụng:
- `GET /api/movies` - Lấy danh sách phim
- `GET /api/movies/search?q={query}` - Tìm kiếm phim
- `GET /api/movies/{id}` - Chi tiết phim
- `POST /api/favorites` - Thêm yêu thích
- `DELETE /api/favorites/{id}` - Xóa yêu thích

## 📱 Responsive Design

App được thiết kế responsive với breakpoints:
- Mobile: < 768px (1 cột)
- Tablet: 768px - 1024px (2-3 cột) 
- Desktop: > 1024px (4-5 cột)

## 💾 Local Storage

Danh sách phim yêu thích được lưu trong localStorage với key:
- `movie-app-favorites`: Array các movie ID

## 🎨 Theming

Sử dụng Mantine theme mặc định với:
- Primary color: Blue
- Background gradient: Purple to Blue
- Card shadows và animations
- Custom scrollbar styling

## 🔄 State Management

Sử dụng Zustand store (`movieStore.ts`) để quản lý:
- Danh sách phim
- Kết quả tìm kiếm  
- Phim hiện tại (chi tiết)
- Danh sách yêu thích
- Loading states
- Error handling

## 📋 Todo/Cải tiến

- [ ] Infinite scroll thay vì pagination
- [ ] Dark/Light mode toggle
- [ ] Movie trailers integration
- [ ] Advanced filters (genre, year, rating)
- [ ] User authentication
- [ ] PWA support
- [ ] Unit testing

## 🐛 Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS, đảm bảo API server Laravel đã cấu hình CORS cho frontend domain.

### API không hoạt động
Kiểm tra:
1. Laravel API server đang chạy ở `localhost:8000`
2. Database đã được migrate và seed
3. Network tab trong DevTools để debug API calls

### Build errors
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Verify API server đang hoạt động
3. Check network requests trong DevTools