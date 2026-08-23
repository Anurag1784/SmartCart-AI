package com.smartcart.order.repository;

import com.smartcart.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderOrderId(Long orderId);

    List<OrderItem> findByProductId(Long productId);

    List<OrderItem> findBySellerId(Long sellerId);
}