package com.inventario.repository;

import com.inventario.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByCategory(String category, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR p.category = :category)")
    Page<Product> findByFilters(@Param("search") String search,
                                 @Param("category") String category,
                                 Pageable pageable);

    List<Product> findByStockLessThanEqual(Integer threshold);

    Optional<Product> findBySku(String sku);

    @Query("SELECT SUM(p.stock * p.price) FROM Product p")
    java.math.BigDecimal calculateTotalInventoryValue();

    long countByCategory(String category);
}
