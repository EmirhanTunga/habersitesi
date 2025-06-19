# Dünya Haberleri Uygulaması

Bu uygulama, dünya genelindeki güncel haberleri gösteren modern bir web uygulamasıdır. NewsAPI kullanarak gerçek zamanlı haber verilerini çeker.

## Özellikler

- 🌍 **Dünya Haberleri** - Farklı ülkelerden güncel haberler
- 🔍 **Gelişmiş Arama** - Anahtar kelimelerle haber arama
- 📂 **Kategori Filtreleme** - Haberleri kategorilere göre filtreleme
- 🌐 **Ülke Seçimi** - Farklı ülkelerin haberlerini görüntüleme
- 📱 **Responsive Tasarım** - Mobil ve masaüstü uyumlu
- ⚡ **Gerçek Zamanlı** - Güncel haber verileri
- 🎨 **Modern UI** - Tailwind CSS ile şık tasarım

## Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Uygulamayı başlatın:**
```bash
npm start
```

3. **Tarayıcıda açın:**
```
http://localhost:3000
```

## Kullanılan Teknolojiler

- **React 18** - Modern React hooks ve functional components
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Modern ikonlar
- **NewsAPI** - Haber verileri

## API Özellikleri

### Desteklenen Kategoriler
- Genel
- İş Dünyası
- Teknoloji
- Spor
- Eğlence
- Sağlık
- Bilim

### Desteklenen Ülkeler
- Türkiye
- Amerika Birleşik Devletleri
- Birleşik Krallık
- Almanya
- Fransa
- İtalya
- İspanya
- Rusya
- Çin
- Japonya

## Kullanım

1. **Ana Sayfa**: Varsayılan olarak Türkiye'nin genel haberleri gösterilir
2. **Kategori Değiştirme**: Üst menüden farklı kategoriler seçebilirsiniz
3. **Ülke Değiştirme**: Ülke seçici ile farklı ülkelerin haberlerini görüntüleyebilirsiniz
4. **Haber Arama**: Arama kutusuna anahtar kelimeler yazarak haber arayabilirsiniz
5. **Haber Detayı**: Haber kartlarındaki "Haberi Oku" butonuna tıklayarak orijinal kaynağa gidebilirsiniz

## Özellikler

- **Otomatik Yenileme**: Kategori veya ülke değiştirildiğinde haberler otomatik güncellenir
- **Hata Yönetimi**: API hatalarında kullanıcı dostu mesajlar
- **Loading States**: Yükleme durumları için animasyonlar
- **Responsive Grid**: Farklı ekran boyutlarına uyumlu haber grid'i
- **Image Fallback**: Haber resimleri yüklenemediğinde placeholder gösterir

## Lisans

MIT License 