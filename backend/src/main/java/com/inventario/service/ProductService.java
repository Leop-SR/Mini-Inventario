package com.inventario.service;

import com.inventario.dto.DashboardDTO;
import com.inventario.dto.ProductDTO;
import com.inventario.model.Product;
import com.inventario.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final DateTimeFormatter FORMATTER =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ProductDTO.PageResponse getAll(String search, String category, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchParam = (search != null && !search.isBlank()) ? search : null;
        String categoryParam = (category != null && !category.isBlank()) ? category : null;

        Page<Product> productPage = productRepository.findByFilters(searchParam, categoryParam, pageable);

        List<ProductDTO.Response> content = productPage.getContent()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());

        return ProductDTO.PageResponse.builder()
            .content(content)
            .page(productPage.getNumber())
            .size(productPage.getSize())
            .totalElements(productPage.getTotalElements())
            .totalPages(productPage.getTotalPages())
            .last(productPage.isLast())
            .build();
    }

    public ProductDTO.Response getById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
        return toResponse(product);
    }

    public ProductDTO.Response create(ProductDTO.Request request) {
        Product product = Product.builder()
            .name(request.getName())
            .description(request.getDescription())
            .category(request.getCategory())
            .price(request.getPrice())
            .stock(request.getStock())
            .sku(request.getSku())
            .build();
        return toResponse(productRepository.save(product));
    }

    public ProductDTO.Response update(Long id, ProductDTO.Request request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setSku(request.getSku());
        return toResponse(productRepository.save(product));
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con id: " + id);
        }
        productRepository.deleteById(id);
    }

    public DashboardDTO getDashboard() {
        List<Product> all = productRepository.findAll();

        long outOfStock = all.stream().filter(p -> p.getStock() == 0).count();
        long lowStock = all.stream().filter(p -> p.getStock() > 0 && p.getStock() <= LOW_STOCK_THRESHOLD).count();

        BigDecimal totalValue = all.stream()
            .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStock())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byCategory = all.stream()
            .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        return DashboardDTO.builder()
            .totalProducts(all.size())
            .lowStockProducts(lowStock)
            .outOfStockProducts(outOfStock)
            .totalInventoryValue(totalValue)
            .productsByCategory(byCategory)
            .build();
    }

    private ProductDTO.Response toResponse(Product p) {
        String stockStatus;
        if (p.getStock() == 0) stockStatus = "OUT";
        else if (p.getStock() <= LOW_STOCK_THRESHOLD) stockStatus = "LOW";
        else stockStatus = "OK";

        return ProductDTO.Response.builder()
            .id(p.getId())
            .name(p.getName())
            .description(p.getDescription())
            .category(p.getCategory())
            .price(p.getPrice())
            .stock(p.getStock())
            .sku(p.getSku())
            .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().format(FORMATTER) : null)
            .updatedAt(p.getUpdatedAt() != null ? p.getUpdatedAt().format(FORMATTER) : null)
            .stockStatus(stockStatus)
            .build();
    }
}
