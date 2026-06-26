package com.inventario.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private long totalProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private BigDecimal totalInventoryValue;
    private Map<String, Long> productsByCategory;
}
