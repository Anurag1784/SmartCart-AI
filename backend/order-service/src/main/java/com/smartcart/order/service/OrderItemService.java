package com.smartcart.order.service;

import com.smartcart.order.dto.CustomerResponse;
import com.smartcart.order.entity.Order;
import com.smartcart.order.entity.OrderItem;
import com.smartcart.order.feign.AuthClient;
import com.smartcart.order.repository.OrderItemRepository;
import com.smartcart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final AuthClient authClient;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository,
            AuthClient authClient) {

        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.authClient = authClient;
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

        List<OrderItem> orderItems =
                orderItemRepository.findBySellerIdWithOrderAndAddress(sellerId);

        /*
         * ------------------------------------------------------------
         * LOAD CUSTOMER INFORMATION
         * ------------------------------------------------------------
         *
         * Customer information belongs to Auth Service.
         *
         * We use the customerId stored in the Order and ask
         * Auth Service for the limited customer summary:
         *
         *     firstName
         *     lastName
         *     email
         *     phone
         *
         * IMPORTANT:
         *
         * We do NOT call Auth Service blindly for every OrderItem.
         *
         * Multiple OrderItems can belong to the same customer.
         *
         * Therefore we keep a small request-level cache.
         *
         * Example:
         *
         * OrderItem 31 -> Customer 5
         * OrderItem 32 -> Customer 5
         * OrderItem 33 -> Customer 5
         *
         * Auth Service is called only once for Customer 5.
         * ------------------------------------------------------------
         */

        Map<Long, CustomerResponse> customerCache =
                new HashMap<>();

        for (OrderItem orderItem : orderItems) {

            Long customerId = orderItem.getCustomerId();

            if (customerId == null) {
                continue;
            }

            CustomerResponse customer =
                    customerCache.get(customerId);

            /*
             * Customer is not already loaded for this request.
             */
            if (customer == null) {

                customer =
                        authClient.getCustomerSummary(customerId);

                customerCache.put(customerId, customer);
            }

            /*
             * Store the customer information on the OrderItem.
             *
             * OrderItem will expose this as a JSON-only property.
             */
            orderItem.setCustomer(customer);
        }

        return orderItems;
    }

    public void deleteOrderItem(Long orderItemId) {

        OrderItem orderItem = getOrderItemById(orderItemId);

        orderItemRepository.delete(orderItem);
    }
}