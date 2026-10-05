package com.smartcart.order.repository;

import com.smartcart.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderOrderId(Long orderId);

    List<OrderItem> findByProductId(Long productId);

    @Query("""
            SELECT oi
            FROM OrderItem oi
            JOIN FETCH oi.order o
            JOIN FETCH o.address a
            WHERE oi.sellerId = :sellerId
            """)
    List<OrderItem> findBySellerIdWithOrderAndAddress(
            @Param("sellerId") Long sellerId
    );

    List<OrderItem> findBySellerId(Long sellerId);

    boolean existsByOrderOrderIdAndSellerId(Long orderId, Long sellerId);
}