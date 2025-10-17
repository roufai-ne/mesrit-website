// src/lib/__tests__/newsAnalyticsV2.test.js
import NewsAnalyticsServiceV2 from '../newsAnalyticsV2';
import ViewEvent from '../../models/ViewEvent';
import ShareEvent from '../../models/ShareEvent';
import DailyNewsStats from '../../models/DailyNewsStats';
import News from '../../models/News';
import { connectDB } from '../mongodb';
import mongoose from 'mongoose';

// Mock des dépendances
jest.mock('../mongodb');
jest.mock('../eventBus');
jest.mock('../logger');

describe('NewsAnalyticsServiceV2', () => {
  beforeAll(async () => {
    // Setup test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean collections before each test
    await ViewEvent.deleteMany({});
    await ShareEvent.deleteMany({});
    await DailyNewsStats.deleteMany({});
    await News.deleteMany({});
  });

  describe('trackView', () => {
    test('should create a view event successfully', async () => {
      // Arrange
      const news = new News({
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await news.save();

      const viewData = {
        sessionId: 'test-session',
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        referrer: 'https://test.com',
        readingTime: 30,
        scrollDepth: 50
      };

      // Act
      const result = await NewsAnalyticsServiceV2.trackView(news._id, viewData);

      // Assert
      expect(result).toBeDefined();
      expect(result.newsId.toString()).toBe(news._id.toString());
      expect(result.sessionId).toBe(viewData.sessionId);
      expect(result.readingTime).toBe(viewData.readingTime);
      expect(result.scrollDepth).toBe(viewData.scrollDepth);

      // Verify in database
      const viewEvent = await ViewEvent.findById(result._id);
      expect(viewEvent).toBeTruthy();
      expect(viewEvent.newsId.toString()).toBe(news._id.toString());
    });

    test('should throw error for non-existent news', async () => {
      // Arrange
      const fakeNewsId = new mongoose.Types.ObjectId();
      const viewData = {
        sessionId: 'test-session',
        ip: '127.0.0.1',
        userAgent: 'Test Browser'
      };

      // Act & Assert
      await expect(
        NewsAnalyticsServiceV2.trackView(fakeNewsId, viewData)
      ).rejects.toThrow('Impossible de tracker une vue pour un article inexistant');
    });

    test('should handle missing optional fields', async () => {
      // Arrange
      const news = new News({
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await news.save();

      const minimalViewData = {
        sessionId: 'test-session',
        ip: '127.0.0.1',
        userAgent: 'Test Browser'
      };

      // Act
      const result = await NewsAnalyticsServiceV2.trackView(news._id, minimalViewData);

      // Assert
      expect(result.readingTime).toBe(0);
      expect(result.scrollDepth).toBe(0);
      expect(result.videoWatched).toBe(false);
    });
  });

  describe('trackShare', () => {
    test('should create a share event successfully', async () => {
      // Arrange
      const news = new News({
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await news.save();

      const shareData = {
        platform: 'facebook',
        sessionId: 'test-session',
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        shareUrl: 'https://test.com/news/123',
        shareText: 'Check this out!'
      };

      // Act
      const result = await NewsAnalyticsServiceV2.trackShare(news._id, shareData);

      // Assert
      expect(result).toBeDefined();
      expect(result.newsId.toString()).toBe(news._id.toString());
      expect(result.platform).toBe(shareData.platform);
      expect(result.shareUrl).toBe(shareData.shareUrl);

      // Verify in database
      const shareEvent = await ShareEvent.findById(result._id);
      expect(shareEvent).toBeTruthy();
      expect(shareEvent.platform).toBe('facebook');
    });

    test('should validate platform enum', async () => {
      // Arrange
      const news = new News({
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await news.save();

      const shareData = {
        platform: 'invalid-platform',
        sessionId: 'test-session',
        ip: '127.0.0.1',
        userAgent: 'Test Browser'
      };

      // Act & Assert
      await expect(
        NewsAnalyticsServiceV2.trackShare(news._id, shareData)
      ).rejects.toThrow();
    });
  });

  describe('updateDailyStats', () => {
    test('should generate daily stats from events', async () => {
      // Arrange
      const news = new News({
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await news.save();

      const today = new Date();
      today.setHours(12, 0, 0, 0);

      // Create some view events
      const viewEvents = [
        new ViewEvent({
          newsId: news._id,
          timestamp: today,
          sessionId: 'session1',
          ip: '127.0.0.1',
          userAgent: 'Browser 1',
          readingTime: 30,
          scrollDepth: 80
        }),
        new ViewEvent({
          newsId: news._id,
          timestamp: today,
          sessionId: 'session2',
          ip: '127.0.0.2',
          userAgent: 'Browser 2',
          readingTime: 45,
          scrollDepth: 60
        })
      ];

      await ViewEvent.insertMany(viewEvents);

      // Act
      const result = await NewsAnalyticsServiceV2.updateDailyStats(news._id, today);

      // Assert
      expect(result).toBeDefined();
      expect(result.newsId.toString()).toBe(news._id.toString());
      expect(result.totalViews).toBe(2);
      expect(result.uniqueViews).toBe(2);
      expect(result.avgReadingTime).toBeCloseTo(37.5, 1);
      expect(result.avgScrollDepth).toBeCloseTo(70, 1);

      // Verify in database
      const dailyStats = await DailyNewsStats.findById(result._id);
      expect(dailyStats).toBeTruthy();
      expect(dailyStats.isComplete).toBe(true);
    });

    test('should handle days with no data', async () => {
      // Arrange
      const news = new News({
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await news.save();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Act
      const result = await NewsAnalyticsServiceV2.updateDailyStats(news._id, yesterday);

      // Assert
      expect(result.totalViews).toBe(0);
      expect(result.uniqueViews).toBe(0);
      expect(result.totalShares).toBe(0);
    });
  });

  describe('getNewsStats', () => {
    test('should return stats for a news article', async () => {
      // Arrange
      const news = new News({
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await news.save();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      // Create some daily stats
      const dailyStats = new DailyNewsStats({
        newsId: news._id,
        date: startDate,
        totalViews: 100,
        uniqueViews: 80,
        totalShares: 10,
        avgReadingTime: 45,
        avgScrollDepth: 70,
        isComplete: true
      });
      await dailyStats.save();

      // Act
      const result = await NewsAnalyticsServiceV2.getNewsStats(news._id, startDate, endDate);

      // Assert
      expect(result).toBeDefined();
      expect(result.newsId.toString()).toBe(news._id.toString());
      expect(result.totals.totalViews).toBe(100);
      expect(result.totals.uniqueViews).toBe(80);
      expect(result.totals.totalShares).toBe(10);
      expect(result.dailyStats).toHaveLength(1);
      expect(result.summary.daysWithData).toBe(1);
    });

    test('should throw error for non-existent news', async () => {
      // Arrange
      const fakeNewsId = new mongoose.Types.ObjectId();
      const startDate = new Date();
      const endDate = new Date();

      // Act & Assert
      await expect(
        NewsAnalyticsServiceV2.getNewsStats(fakeNewsId, startDate, endDate)
      ).rejects.toThrow('Article non trouvé');
    });
  });

  describe('getGlobalStats', () => {
    test('should return global statistics', async () => {
      // Arrange
      const news1 = new News({
        title: 'Test Article 1',
        content: 'Test content 1',
        category: 'test',
        status: 'published'
      });
      const news2 = new News({
        title: 'Test Article 2',
        content: 'Test content 2',
        category: 'test',
        status: 'published'
      });
      await News.insertMany([news1, news2]);

      const today = new Date();
      const dailyStats = [
        new DailyNewsStats({
          newsId: news1._id,
          date: today,
          totalViews: 100,
          uniqueViews: 80,
          totalShares: 5,
          avgReadingTime: 45,
          avgScrollDepth: 70,
          isComplete: true
        }),
        new DailyNewsStats({
          newsId: news2._id,
          date: today,
          totalViews: 150,
          uniqueViews: 120,
          totalShares: 8,
          avgReadingTime: 50,
          avgScrollDepth: 75,
          isComplete: true
        })
      ];
      await DailyNewsStats.insertMany(dailyStats);

      // Act
      const result = await NewsAnalyticsServiceV2.getGlobalStats(7);

      // Assert
      expect(result).toBeDefined();
      expect(result.overview.totalViews).toBe(250);
      expect(result.overview.totalUniqueViews).toBe(200);
      expect(result.overview.totalShares).toBe(13);
      expect(result.overview.activeArticles).toBe(2);
      expect(result.period.days).toBe(7);
    });

    test('should handle empty database', async () => {
      // Act
      const result = await NewsAnalyticsServiceV2.getGlobalStats(30);

      // Assert
      expect(result.overview.totalViews).toBe(0);
      expect(result.overview.totalUniqueViews).toBe(0);
      expect(result.overview.totalShares).toBe(0);
      expect(result.overview.activeArticles).toBe(0);
      expect(result.topArticles).toHaveLength(0);
    });
  });

  describe('calculateTrend', () => {
    test('should calculate growing trend', () => {
      const dailyStats = [
        { totalViews: 10 },
        { totalViews: 15 },
        { totalViews: 20 },
        { totalViews: 25 },
        { totalViews: 30 },
        { totalViews: 35 },
        { totalViews: 40 },
        // Recent 7 days
        { totalViews: 45 },
        { totalViews: 50 },
        { totalViews: 55 },
        { totalViews: 60 },
        { totalViews: 65 },
        { totalViews: 70 },
        { totalViews: 75 }
      ];

      const trend = NewsAnalyticsServiceV2.calculateTrend(dailyStats);
      expect(trend).toBe('growing');
    });

    test('should calculate declining trend', () => {
      const dailyStats = [
        { totalViews: 70 },
        { totalViews: 65 },
        { totalViews: 60 },
        { totalViews: 55 },
        { totalViews: 50 },
        { totalViews: 45 },
        { totalViews: 40 },
        // Recent 7 days (declining)
        { totalViews: 35 },
        { totalViews: 30 },
        { totalViews: 25 },
        { totalViews: 20 },
        { totalViews: 15 },
        { totalViews: 10 },
        { totalViews: 5 }
      ];

      const trend = NewsAnalyticsServiceV2.calculateTrend(dailyStats);
      expect(trend).toBe('declining');
    });

    test('should calculate stable trend', () => {
      const dailyStats = [
        { totalViews: 50 },
        { totalViews: 48 },
        { totalViews: 52 },
        { totalViews: 49 },
        { totalViews: 51 },
        { totalViews: 50 },
        { totalViews: 49 },
        // Recent 7 days (similar)
        { totalViews: 51 },
        { totalViews: 50 },
        { totalViews: 49 },
        { totalViews: 52 },
        { totalViews: 48 },
        { totalViews: 50 },
        { totalViews: 51 }
      ];

      const trend = NewsAnalyticsServiceV2.calculateTrend(dailyStats);
      expect(trend).toBe('stable');
    });
  });
});