package com.smartcart.order.service;

import com.smartcart.order.entity.Order;
import com.smartcart.order.entity.OrderItem;
import com.smartcart.order.repository.OrderItemRepository;
import com.smartcart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository) {

        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    public List<OrderItem> getItemsByOrderId(Long orderId) {

        return orderItemRepository.findByOrderOrderId(orderId);
    }

    public OrderItem getOrderItemById(Long orderItemId) {

        return orderItemRepository.findById(orderItemId)
                .orElseThrow(() ->
                        new RuntimeException("Order item not found"));
    }

    public OrderItem addOrderItem(
            Long orderId,
            OrderItem orderItem) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        orderItem.setOrder(order);

        return orderItemRepository.save(orderItem);
    }

    public List<OrderItem> getItemsByProductId(Long productId) {

        return orderItemRepository.findByProductId(productId);
    }

    public List<OrderItem> getItemsBySellerId(Long sellerId) {

        return orderItemRepository.findBySellerId(sellerId);
    }

    public void deleteOrderItem(Long orderItemId) {

        OrderItem orderItem = getOrderItemById(orderItemId);

        orderItemRepository.delete(orderItem);
    }
}