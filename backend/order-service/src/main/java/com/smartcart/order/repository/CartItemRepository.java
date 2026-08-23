package com.smartcart.order.repository;

import com.smartcart.order.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartCartId(Long cartId);

    Optional<CartItem> findByCartCartIdAndProductId(Long cartId, Long productId);

    void deleteByCartCartIdAndProductId(Long cartId, Long productId);
}