import React, { useState, useEffect } from 'react';

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// API Anahtarları
const API_KEYS = {
  newsAPI: 'a718dfaf6e8c47958db169495cd5b0a1',
  gnews: 'YOUR_GNEWS_API_KEY', // GNews API anahtarınızı buraya ekleyin
  mediaStack: 'YOUR_MEDIASTACK_API_KEY', // MediaStack API anahtarınızı buraya ekleyin
  // Ücretsiz alternatif API'ler
  newsData: 'pub_1234567890abcdef', // NewsData.io ücretsiz anahtar - https://newsdata.io/register
  currentNews: 'demo', // Current News API demo anahtarı - https://currentsapi.services/
  // Yeni ücretsiz API'ler
  bingNews: 'demo', // Bing News Search (ücretsiz)
  newsCatcher: 'demo' // NewsCatcher API (ücretsiz)
};

function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState('general');
  const [currentCountry, setCurrentCountry] = useState('tr');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAPI, setActiveAPI] = useState('newsAPI'); // Hangi API'nin kullanıldığını takip eder

  useEffect(() => {
    loadTopHeadlines();
  }, [currentCategory, currentCountry, activeAPI]); // eslint-disable-line react-hooks/exhaustive-deps

  // NewsAPI.org'dan haber yükleme
  const loadFromNewsAPI = async () => {
    try {
      // Önce top-headlines'i dene
      let url = `https://newsapi.org/v2/top-headlines?country=${currentCountry}&category=${currentCategory}&apiKey=${API_KEYS.newsAPI}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NewsAPI HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      // Eğer top-headlines'den veri gelmezse, everything endpoint'ini dene
      if (!data.articles || data.articles.length === 0) {
        console.log('Top headlines boş, everything endpoint deneniyor...');
        
        const countryNames = {
          'tr': 'Turkey',
          'us': 'United States',
          'fr': 'France',
          'gb': 'United Kingdom'
        };
        
        const everythingUrl = `https://newsapi.org/v2/everything?q=${countryNames[currentCountry]} ${currentCategory}&language=tr,en&sortBy=publishedAt&pageSize=10&apiKey=${API_KEYS.newsAPI}`;
        
        const everythingResponse = await fetch(everythingUrl);
        
        if (everythingResponse.ok) {
          const everythingData = await everythingResponse.json();
          
          if (everythingData.status !== 'error' && everythingData.articles) {
            return everythingData.articles;
          }
        }
        
        // Eğer hala veri yoksa, sadece ülke adıyla ara
        const countryOnlyUrl = `https://newsapi.org/v2/everything?q=${countryNames[currentCountry]}&language=tr,en&sortBy=publishedAt&pageSize=10&apiKey=${API_KEYS.newsAPI}`;
        
        const countryOnlyResponse = await fetch(countryOnlyUrl);
        
        if (countryOnlyResponse.ok) {
          const countryOnlyData = await countryOnlyResponse.json();
          
          if (countryOnlyData.status !== 'error' && countryOnlyData.articles) {
            return countryOnlyData.articles;
          }
        }
        
        // Birleşik Krallık için özel arama terimleri
        if (currentCountry === 'gb') {
          const ukTerms = ['UK', 'Britain', 'British', 'England', 'London', 'Manchester', 'Liverpool'];
          
          for (const term of ukTerms) {
            const ukUrl = `https://newsapi.org/v2/everything?q=${term}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${API_KEYS.newsAPI}`;
            
            const ukResponse = await fetch(ukUrl);
            
            if (ukResponse.ok) {
              const ukData = await ukResponse.json();
              
              if (ukData.status !== 'error' && ukData.articles && ukData.articles.length > 0) {
                return ukData.articles;
              }
            }
          }
        }
      }
      
      return data.articles || [];
    } catch (err) {
      console.error('NewsAPI Error:', err);
      return [];
    }
  };

  // RSS Feed'lerden haber yükleme (ücretsiz)
  const loadFromRSSFeeds = async () => {
    try {
      // Ülke bazlı RSS feed'ler
      const rssFeeds = {
        'tr': [
          'https://www.hurriyet.com.tr/rss/anasayfa',
          'https://www.milliyet.com.tr/rss/rssNew/gundemRss.xml',
          'https://www.sozcu.com.tr/rss/tum-haberler.xml'
        ],
        'us': [
          'https://rss.cnn.com/rss/edition.rss',
          'https://feeds.bbci.co.uk/news/rss.xml',
          'https://www.reuters.com/rssfeed/world'
        ],
        'fr': [
          'https://www.lemonde.fr/rss/une.xml',
          'https://www.lefigaro.fr/rss/figaro_actualites.xml',
          'https://www.liberation.fr/rss/'
        ],
        'gb': [
          'https://feeds.bbci.co.uk/news/uk/rss.xml',
          'https://www.theguardian.com/uk/rss',
          'https://www.independent.co.uk/news/uk/rss',
          'https://www.telegraph.co.uk/rss.xml',
          'https://www.dailymail.co.uk/news/index.rss',
          'https://www.mirror.co.uk/news/rss.xml'
        ]
      };
      
      const feeds = rssFeeds[currentCountry] || [];
      let allArticles: NewsArticle[] = [];
      
      // RSS feed'leri paralel olarak yükle
      const feedPromises = feeds.map(async (feedUrl) => {
        try {
          // CORS sorunu nedeniyle proxy kullan
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
          const response = await fetch(proxyUrl);
          
          if (response.ok) {
            const xmlText = await response.text();
            
            // Basit XML parsing (gerçek uygulamada DOMParser kullanılabilir)
            const articles = parseRSSFeed(xmlText);
            return articles;
          }
        } catch (err) {
          console.error(`RSS Feed Error for ${feedUrl}:`, err);
        }
        return [];
      });
      
      const results = await Promise.allSettled(feedPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          allArticles = [...allArticles, ...result.value];
        }
      });
      
      return allArticles;
    } catch (err) {
      console.error('RSS Feeds Error:', err);
      return [];
    }
  };

  // RSS XML'ini parse et
  const parseRSSFeed = (xmlText: string): NewsArticle[] => {
    try {
      const articles: NewsArticle[] = [];
      
      // Farklı RSS formatları için regex'ler
      const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
      const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi; // Atom formatı için
      
      const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
      const descriptionRegex = /<description[^>]*>([^<]+)<\/description>/i;
      const summaryRegex = /<summary[^>]*>([^<]+)<\/summary>/i; // Atom formatı için
      const linkRegex = /<link[^>]*>([^<]+)<\/link>/i;
      const linkHrefRegex = /<link[^>]*href="([^"]+)"[^>]*>/i; // Atom formatı için
      const pubDateRegex = /<pubDate[^>]*>([^<]+)<\/pubDate>/i;
      const updatedRegex = /<updated[^>]*>([^<]+)<\/updated>/i; // Atom formatı için
      
      // Önce RSS formatını dene
      let match;
      while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemContent = match[1];
        
        const titleMatch = itemContent.match(titleRegex);
        const descriptionMatch = itemContent.match(descriptionRegex);
        const linkMatch = itemContent.match(linkRegex);
        const pubDateMatch = itemContent.match(pubDateRegex);
        
        if (titleMatch && linkMatch) {
          articles.push({
            source: { id: null, name: 'RSS Feed' },
            author: null,
            title: titleMatch[1].trim(),
            description: descriptionMatch ? descriptionMatch[1].trim() : null,
            url: linkMatch[1].trim(),
            urlToImage: null,
            publishedAt: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
            content: descriptionMatch ? descriptionMatch[1].trim() : null
          });
        }
      }
      
      // Eğer RSS formatında veri yoksa Atom formatını dene
      if (articles.length === 0) {
        while ((match = entryRegex.exec(xmlText)) !== null) {
          const entryContent = match[1];
          
          const titleMatch = entryContent.match(titleRegex);
          const summaryMatch = entryContent.match(summaryRegex);
          const linkHrefMatch = entryContent.match(linkHrefRegex);
          const updatedMatch = entryContent.match(updatedRegex);
          
          if (titleMatch && linkHrefMatch) {
            articles.push({
              source: { id: null, name: 'RSS Feed' },
              author: null,
              title: titleMatch[1].trim(),
              description: summaryMatch ? summaryMatch[1].trim() : null,
              url: linkHrefMatch[1].trim(),
              urlToImage: null,
              publishedAt: updatedMatch ? updatedMatch[1].trim() : new Date().toISOString(),
              content: summaryMatch ? summaryMatch[1].trim() : null
            });
          }
        }
      }
      
      return articles.slice(0, 10); // İlk 10 haberi al
    } catch (err) {
      console.error('RSS Parsing Error:', err);
      return [];
    }
  };

  // Ana haber yükleme fonksiyonu - birden fazla API'yi dener
  const loadTopHeadlines = async () => {
    setLoading(true);
    setError(null);
    
    let allArticles: NewsArticle[] = [];
    
    try {
      console.log(`${currentCountry} için ${currentCategory} kategorisinde haberler yükleniyor...`);
      
      if (activeAPI === 'newsAPI') {
        // Sadece NewsAPI.org kullan
        allArticles = await loadFromNewsAPI();
      } else if (activeAPI === 'rss') {
        // Sadece RSS feed'ler kullan
        allArticles = await loadFromRSSFeeds();
      } else if (activeAPI === 'auto') {
        // Önce NewsAPI.org'u dene
        allArticles = await loadFromNewsAPI();
        
        // Eğer NewsAPI'den veri gelmezse RSS feed'leri dene
        if (allArticles.length === 0) {
          console.log('NewsAPI\'den veri gelmedi, RSS feed\'ler deneniyor...');
          allArticles = await loadFromRSSFeeds();
        }
      }
      
      if (allArticles.length === 0) {
        setError(`${currentCountry.toUpperCase()} için ${currentCategory} kategorisinde haber bulunamadı. Lütfen farklı bir kategori veya ülke seçin.`);
        setArticles([]);
        return;
      }
      
      setArticles(allArticles);
      
    } catch (err) {
      console.error('General API Error:', err);
      setError('Haberler yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    
    let allArticles: NewsArticle[] = [];
    
    try {
      // NewsAPI search
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=tr&sortBy=publishedAt&apiKey=${API_KEYS.newsAPI}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.status !== 'error' && data.articles) {
            allArticles = [...allArticles, ...data.articles];
          }
        }
      } catch (err) {
        console.error('NewsAPI Search Error:', err);
      }
      
      // GNews search
      try {
        const response = await fetch(
          `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=tr&apikey=${API_KEYS.gnews}&max=10`
        );
        
        if (response.ok) {
          const data = await response.json();
          const gnewsArticles = data.articles?.map((article: any) => ({
            source: { id: null, name: article.source?.name || 'GNews' },
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.image,
            publishedAt: article.publishedAt,
            content: article.content
          })) || [];
          allArticles = [...allArticles, ...gnewsArticles];
        }
      } catch (err) {
        console.error('GNews Search Error:', err);
      }
      
      // MediaStack search
      try {
        const response = await fetch(
          `http://api.mediastack.com/v1/news?access_key=${API_KEYS.mediaStack}&keywords=${encodeURIComponent(query)}&languages=tr&limit=10`
        );
        
        if (response.ok) {
          const data = await response.json();
          const mediaStackArticles = data.data?.map((article: any) => ({
            source: { id: null, name: article.source || 'MediaStack' },
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.image,
            publishedAt: article.published_at,
            content: article.content
          })) || [];
          allArticles = [...allArticles, ...mediaStackArticles];
        }
      } catch (err) {
        console.error('MediaStack Search Error:', err);
      }
      
      // NewsData search (ücretsiz)
      try {
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=${API_KEYS.newsData}&q=${encodeURIComponent(query)}&language=tr,en`
        );
        
        if (response.ok) {
          const data = await response.json();
          const newsDataArticles = data.results?.map((article: any) => ({
            source: { id: null, name: article.source_id || 'NewsData' },
            author: article.creator?.[0] || null,
            title: article.title,
            description: article.description,
            url: article.link,
            urlToImage: article.image_url,
            publishedAt: article.pubDate,
            content: article.content
          })) || [];
          allArticles = [...allArticles, ...newsDataArticles];
        }
      } catch (err) {
        console.error('NewsData Search Error:', err);
      }
      
      // Current News search (ücretsiz)
      try {
        const response = await fetch(
          `https://api.currentsapi.services/v1/search?apiKey=${API_KEYS.currentNews}&keywords=${encodeURIComponent(query)}&language=tr,en`
        );
        
        if (response.ok) {
          const data = await response.json();
          const currentNewsArticles = data.news?.map((article: any) => ({
            source: { id: null, name: article.author || 'Current News' },
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.image,
            publishedAt: article.published,
            content: article.content
          })) || [];
          allArticles = [...allArticles, ...currentNewsArticles];
        }
      } catch (err) {
        console.error('Current News Search Error:', err);
      }
      
      // Duplicate haberleri kaldır (aynı URL'ye sahip olanlar)
      const uniqueArticles = allArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      );
      
      if (uniqueArticles.length === 0) {
        setError(`"${query}" için arama sonucu bulunamadı. Lütfen farklı anahtar kelimeler deneyin.`);
        setArticles([]);
        return;
      }
      
      setArticles(uniqueArticles);
      
    } catch (err) {
      console.error('Search Error:', err);
      setError('Arama sonuçları alınamadı. Lütfen internet bağlantınızı kontrol edin.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setSearchQuery('');
  };

  const handleCountryChange = (country: string) => {
    setCurrentCountry(country);
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                🌍
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dünya Haberleri</h1>
                <p className="text-gray-600">Güncel haberler ve gelişmeler</p>
              </div>
            </div>
            <button
              onClick={() => searchQuery ? handleSearch(searchQuery) : loadTopHeadlines()}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <span>🔄</span>
              <span>Yenile</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <form onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (input.value.trim()) {
                  handleSearch(input.value.trim());
                }
              }} className="relative">
                <input
                  type="text"
                  placeholder="Haber ara..."
                  className="w-full px-4 py-3 pl-12 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              </form>
            </div>

            {/* API Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">🔌</span>
              <select
                value={activeAPI}
                onChange={(e) => setActiveAPI(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="newsAPI">NewsAPI.org</option>
                <option value="rss">RSS Feed'ler (Ücretsiz)</option>
                <option value="auto">Otomatik (Tümü)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">📂</span>
              <select
                value={currentCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="general">Genel</option>
              </select>
            </div>

            {/* Country Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">🌐</span>
              <select
                value={currentCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="tr">🇹🇷 Türkiye</option>
                <option value="us">🇺🇸 Amerika Birleşik Devletleri</option>
                <option value="fr">🇫🇷 Fransa</option>
                <option value="gb">🇬🇧 Birleşik Krallık</option>
              </select>
            </div>
          </div>
        </div>

        {/* Current View Info */}
        {searchQuery && (
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <span>📰</span>
              <span>
                <strong>"{searchQuery}"</strong> için arama sonuçları
              </span>
            </div>
          </div>
        )}

        {/* Active API Info */}
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <span>🔌</span>
            <span>
              <strong>Aktif API:</strong> {
                activeAPI === 'newsAPI' ? 'NewsAPI.org' :
                activeAPI === 'rss' ? 'RSS Feed' :
                'Otomatik (Tümü)'
              }
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Haberler yükleniyor...</p>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div key={`${article.url}-${index}`} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {article.urlToImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x200?text=Haber+Resmi';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {article.source.name}
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {article.title}
                  </h3>
                  
                  {article.description && (
                    <p className="text-gray-600 mb-4">
                      {truncateText(article.description, 150)}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    {article.author && (
                      <div className="flex items-center space-x-2">
                        <span>👤</span>
                        <span>{truncateText(article.author, 20)}</span>
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <span>Haberi Oku</span>
                    <span>🔗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-white mb-2">Haber bulunamadı</h3>
            <p className="text-white/80">
              {searchQuery 
                ? `"${searchQuery}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.`
                : 'Bu kategori için henüz haber bulunmuyor.'
              }
            </p>
          </div>
        )}

        {/* Results Count */}
        {!loading && articles.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-white/80">
              {searchQuery 
                ? `"${searchQuery}" için ${articles.length} sonuç bulundu`
                : `${articles.length} haber gösteriliyor`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 