package com.smartcart.order.repository;

import com.smartcart.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByOrderStatus(String orderStatus);

    List<Order> findByPaymentStatus(String paymentStatus);
}