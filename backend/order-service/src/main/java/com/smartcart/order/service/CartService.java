package com.smartcart.order.service;

import com.smartcart.order.entity.Cart;
import com.smartcart.order.entity.CartItem;
import com.smartcart.order.repository.CartItemRepository;
import com.smartcart.order.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;


    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }


    // =========================================================
    // GET EXISTING CART OR CREATE NEW CART
    // =========================================================

    public Cart getOrCreateCart(Long customerId) {

        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {

                    // Create a new cart for the customer.
                    Cart cart = new Cart();

                    // Store the customer who owns this cart.
                    cart.setCustomerId(customerId);


                    // Set creation timestamp.
                    //
                    // Cart entity defines created_at as NOT NULL,
                    // so we must provide a value before saving.
                    LocalDateTime now = LocalDateTime.now();

                    cart.setCreatedAt(now);


                    // Set initial update timestamp.
                    //
                    // Cart entity also defines updated_at as NOT NULL.
                    cart.setUpdatedAt(now);


                    // Save and return the newly created cart.
                    return cartRepository.save(cart);
                });
    }


    // =========================================================
    // GET CUSTOMER CART
    // =========================================================

    public Cart getCartByCustomerId(Long customerId) {

        return cartRepository.findByCustomerId(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));
    }


    // =========================================================
    // GET ALL ITEMS IN CUSTOMER'S CART
    // =========================================================

    public List<CartItem> getCartItems(Long customerId) {

        Cart cart = getCartByCustomerId(customerId);

        return cartItemRepository.findByCartCartId(
                cart.getCartId()
        );
    }


    // =========================================================
    // ADD ITEM TO CUSTOMER'S CART
    // =========================================================

    public CartItem addItem(
            Long customerId,
            CartItem cartItem) {

        // Get existing cart or create one if it doesn't exist.
        Cart cart = getOrCreateCart(customerId);


        // Check whether this product is already
        // present in the customer's cart.
        CartItem existingItem =
                cartItemRepository
                        .findByCartCartIdAndProductId(
                                cart.getCartId(),
                                cartItem.getProductId()
                        )
                        .orElse(null);


        // If product already exists,
        // increase its quantity.
        if (existingItem != null) {

            existingItem.setQuantity(
                    existingItem.getQuantity()
                            + cartItem.getQuantity()
            );


            // Update cart timestamp.
            cart.setUpdatedAt(
                    LocalDateTime.now()
            );

            cartRepository.save(cart);


            return cartItemRepository.save(
                    existingItem
            );
        }


        // Connect the new CartItem to the customer's cart.
        cartItem.setCart(cart);


        // Update cart timestamp.
        cart.setUpdatedAt(
                LocalDateTime.now()
        );

        cartRepository.save(cart);


        // Save the new cart item.
        return cartItemRepository.save(
                cartItem
        );
    }


    // =========================================================
    // UPDATE ITEM QUANTITY
    // =========================================================

    public CartItem updateItem(
            Long customerId,
            Long productId,
            Integer quantity) {

        Cart cart = getCartByCustomerId(customerId);


        CartItem cartItem =
                cartItemRepository
                        .findByCartCartIdAndProductId(
                                cart.getCartId(),
                                productId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found"
                                )
                        );


        // Update quantity.
        cartItem.setQuantity(quantity);


        // Update cart timestamp.
        cart.setUpdatedAt(
                LocalDateTime.now()
        );

        cartRepository.save(cart);


        return cartItemRepository.save(
                cartItem
        );
    }


    // =========================================================
    // REMOVE ONE ITEM
    // =========================================================

    public void removeItem(
            Long customerId,
            Long productId) {

        Cart cart = getCartByCustomerId(customerId);


        CartItem cartItem =
                cartItemRepository
                        .findByCartCartIdAndProductId(
                                cart.getCartId(),
                                productId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found"
                                )
                        );


        // Remove the item from the cart.
        cartItemRepository.delete(cartItem);


        // Update cart timestamp.
        cart.setUpdatedAt(
                LocalDateTime.now()
        );

        cartRepository.save(cart);
    }


    // =========================================================
    // CLEAR CUSTOMER'S CART
    // =========================================================

    public void clearCart(Long customerId) {

        Cart cart = getCartByCustomerId(customerId);


        List<CartItem> cartItems =
                cartItemRepository.findByCartCartId(
                        cart.getCartId()
                );


        // Delete all items from the cart.
        cartItemRepository.deleteAll(cartItems);


        // Update cart timestamp.
        cart.setUpdatedAt(
                LocalDateTime.now()
        );

        cartRepository.save(cart);
    }
}