import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from 'src/environments/environment';

describe('ProductService', () => {

  let service: ProductService;
  let httpMock: HttpTestingController;
  const API = `${environment.apiBaseUrl}/api/products`;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all products', () => {

    const mockProducts = [
      { id: 1, sku: 'P-100', name: 'Test Product', price: 100 }
    ];

    service.getAll().subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0].sku).toBe('P-100');
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('GET');

    req.flush(mockProducts);
  });

  it('should create product', () => {

    const newProduct = {
      sku: 'P-200',
      name: 'New Product',
      price: 200
    };

    service.create(newProduct).subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
  });

});