const adsController = require('./ads.controller');
const Ad = require('./models/ads.model');

jest.mock('./models/ads.model');

describe('Ads Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAllAds', () => {
    it('deve retornar anúncios filtrados por anunciante', async () => {
      req.query.advertiser = 'Coca-Cola';
      const mockAds = [{ title: 'Summer Promo', advertiser: 'Coca-Cola' }];
      Ad.find.mockResolvedValue(mockAds);

      await adsController.getAllAds(req, res);

      expect(Ad.find).toHaveBeenCalledWith({ advertiser: 'Coca-Cola' });
      expect(res.json).toHaveBeenCalledWith(mockAds);
    });
  });

  describe('createAd', () => {
    it('deve criar um anúncio novo', async () => {
      req.body = { title: 'Ad 1', advertiser: 'BrandX', duration: 30 };
      const saveMock = jest.fn();
      Ad.mockImplementation(() => ({ save: saveMock }));

      await adsController.createAd(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteAd', () => {
    it('deve apagar um anúncio existente', async () => {
      req.params.id = '123';
      Ad.findByIdAndDelete.mockResolvedValue({ _id: '123' });

      await adsController.deleteAd(req, res);

      expect(Ad.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({ message: 'Ad removed successfully' });
    });

    it('deve retornar 404 se o anúncio não existir', async () => {
      req.params.id = '999';
      Ad.findByIdAndDelete.mockResolvedValue(null);

      await adsController.deleteAd(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});