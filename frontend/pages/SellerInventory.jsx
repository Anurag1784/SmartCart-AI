// SellerInventory.jsx
// This page allows the seller to view and manage inventory
// in a compact professional table format.

import { useEffect, useMemo, useState } from "react";
import { Link } from 'react-router-dom'
import SellerNavLink from '../components/SellerNavLink'
import {
  ArrowLeft,
  Package,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

import { productApi, inventoryApi } from "../services/api";

import "./SellerInventory.css";


function SellerInventory() {

  // ============================================================
  // STATE
  // ============================================================

  // Stores the combined product + inventory information.
  const [inventoryItems, setInventoryItems] = useState([]);

  // Loading state while inventory is being fetched.
  const [loading, setLoading] = useState(true);

  // Error message shown if API request fails.
  const [error, setError] = useState("");

  // Stores which product is currently being updated.
  const [updatingProductId, setUpdatingProductId] = useState(null);

  // Stores quantity entered for each product.
  const [quantities, setQuantities] = useState({});

  // Search text.
  const [searchTerm, setSearchTerm] = useState("");

  // Stock status filter.
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Current pagination page.
  const [currentPage, setCurrentPage] = useState(1);

  // Number of rows displayed on one page.
  const ITEMS_PER_PAGE = 8;


  // ============================================================
  // LOAD INVENTORY
  // ============================================================

  const loadInventory = async () => {

    try {

      setLoading(true);
      setError("");

      // --------------------------------------------------------
      // STEP 1:
      // Get all products belonging to the logged-in seller.
      // --------------------------------------------------------

      const productsResponse =
        await productApi.get("/api/products/my-products");

      const products = productsResponse.data || [];


      // --------------------------------------------------------
      // STEP 2:
      // For every seller product, fetch its inventory.
      // --------------------------------------------------------

      const combinedItems = await Promise.all(

        products.map(async (product) => {

          try {

            const inventoryResponse =
              await inventoryApi.get(
                `/api/inventory/product/${product.productId}`
              );

            return {
              product,
              inventory: inventoryResponse.data,
            };

          } catch (inventoryError) {

            // If inventory does not exist yet,
            // keep the product visible instead of removing it.

            return {
              product,
              inventory: null,
            };
          }
        })
      );


      // Save combined product + inventory data.
      setInventoryItems(combinedItems);

    } catch (err) {

      console.error("Failed to load seller inventory:", err);

      setError(
        err?.response?.data?.message ||
        "Failed to load inventory. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };


  // Load inventory when page opens.
  useEffect(() => {
    loadInventory();
  }, []);


  // ============================================================
  // QUANTITY INPUT
  // ============================================================

  const handleQuantityChange = (productId, value) => {

    // Allow only positive integer digits.
    if (!/^\d*$/.test(value)) {
      return;
    }

    setQuantities((previous) => ({
      ...previous,
      [productId]: value,
    }));
  };


  // ============================================================
  // INCREASE / DECREASE STOCK
  // ============================================================

  const handleStockChange = async (productId, action) => {

    const enteredQuantity = quantities[productId];

    // Convert entered quantity into number.
    const quantity = Number(enteredQuantity);

    // Validate quantity.
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {

      alert("Please enter a valid positive quantity.");

      return;
    }


    try {

      // Show updating state for this particular product.
      setUpdatingProductId(productId);


      // --------------------------------------------------------
      // INCREASE STOCK
      // --------------------------------------------------------

      if (action === "increase") {

        await inventoryApi.patch(
          `/api/inventory/product/${productId}/increase?quantity=${quantity}`
        );
      }


      // --------------------------------------------------------
      // DECREASE STOCK
      // --------------------------------------------------------

      if (action === "decrease") {

        await inventoryApi.patch(
          `/api/inventory/product/${productId}/decrease?quantity=${quantity}`
        );
      }


      // Clear entered quantity after successful operation.
      setQuantities((previous) => ({
        ...previous,
        [productId]: "",
      }));


      // Reload inventory so latest stock is displayed.
      await loadInventory();

    } catch (err) {

      console.error("Stock update failed:", err);

      alert(
        err?.response?.data?.message ||
        "Unable to update inventory."
      );

    } finally {

      setUpdatingProductId(null);
    }
  };


  // ============================================================
  // STOCK STATUS
  // ============================================================

  const getStockStatus = (inventory) => {

    // No inventory record.
    if (!inventory) {

      return {
        label: "Unavailable",
        type: "unavailable",
      };
    }


    const availableQuantity =
      Number(inventory.availableQuantity ?? 0);

    const reorderLevel =
      Number(inventory.reorderLevel ?? 0);


    // Completely out of stock.
    if (availableQuantity === 0) {

      return {
        label: "Out of Stock",
        type: "danger",
      };
    }


    // Stock is at or below reorder level.
    if (
      reorderLevel > 0 &&
      availableQuantity <= reorderLevel
    ) {

      return {
        label: "Low Stock",
        type: "warning",
      };
    }


    // Normal stock.
    return {
      label: "In Stock",
      type: "success",
    };
  };


  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const filteredItems = useMemo(() => {

    const search = searchTerm.trim().toLowerCase();


    return inventoryItems.filter((item) => {

      const product = item.product;
      const inventory = item.inventory;

      const stockStatus = getStockStatus(inventory);


      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      const matchesSearch =

        !search ||

        String(product.productName || "")
          .toLowerCase()
          .includes(search) ||

        String(product.sku || "")
          .toLowerCase()
          .includes(search) ||

        String(product.brand || "")
          .toLowerCase()
          .includes(search) ||

        String(product.category?.categoryName || "")
          .toLowerCase()
          .includes(search);


      // --------------------------------------------------------
      // STATUS FILTER
      // --------------------------------------------------------

      const matchesStatus =

        statusFilter === "ALL" ||

        (statusFilter === "IN_STOCK" &&
          stockStatus.type === "success") ||

        (statusFilter === "LOW_STOCK" &&
          stockStatus.type === "warning") ||

        (statusFilter === "OUT_OF_STOCK" &&
          stockStatus.type === "danger") ||

        (statusFilter === "UNAVAILABLE" &&
          stockStatus.type === "unavailable");


      return matchesSearch && matchesStatus;
    });

  }, [inventoryItems, searchTerm, statusFilter]);


  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
    );


  // Keep page valid after filtering.
  useEffect(() => {

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

  }, [currentPage, totalPages]);


  // Reset pagination whenever search/filter changes.
  useEffect(() => {

    setCurrentPage(1);

  }, [searchTerm, statusFilter]);


  const paginatedItems = useMemo(() => {

    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredItems.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  }, [filteredItems, currentPage]);


  // ============================================================
  // SUMMARY COUNTS
  // ============================================================

  const summary = useMemo(() => {

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    inventoryItems.forEach((item) => {

      const status =
        getStockStatus(item.inventory);

      if (status.type === "success") {
        inStock++;
      }

      if (status.type === "warning") {
        lowStock++;
      }

      if (status.type === "danger") {
        outOfStock++;
      }
    });


    return {
      total: inventoryItems.length,
      inStock,
      lowStock,
      outOfStock,
    };

  }, [inventoryItems]);


  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {

    return (
      <div className="seller-inventory-page">

        <div className="seller-inventory-loading">

          <RefreshCw
            size={38}
            className="seller-inventory-spinner"
          />

          <h2>Loading Inventory</h2>

          <p>
            Fetching your products and stock information...
          </p>

        </div>

      </div>
    );
  }


  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div className="seller-inventory-page">

      <div className="seller-inventory-container">


        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="seller-inventory-header">

          <div>

          <SellerNavLink
            to="/seller"
            className="seller-inventory-back-button"
          >
          ← Dashboard
          </SellerNavLink>


            <div className="seller-inventory-title-row">

              <div className="seller-inventory-title-icon">

                <Boxes size={27} />

              </div>


              <div>

                <h1>Inventory</h1>

                <p>
                  Manage stock levels across your products.
                </p>

              </div>

            </div>

          </div>


          {/* HEADER ACTIONS */}

          <div className="seller-inventory-header-actions">

            <button
              type="button"
              className="seller-inventory-refresh-button"
              onClick={loadInventory}
              disabled={loading}
            >

              <RefreshCw size={16} />

              Refresh

            </button>


          <SellerNavLink
             to="/seller/add-product"
             className="seller-products-add-button"
          >
           + Add Product
          </SellerNavLink>
          </div>

        </header>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="seller-inventory-error">

            <AlertTriangle size={18} />

            {error}

          </div>

        )}


        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <div className="seller-inventory-summary">

          <div className="inventory-summary-card">

            <div className="inventory-summary-icon">
              <Package size={18} />
            </div>

            <div>
              <span>Total Products</span>
              <strong>{summary.total}</strong>
            </div>

          </div>


          <div className="inventory-summary-card">

            <div className="inventory-summary-icon inventory-summary-success">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <span>In Stock</span>
              <strong>{summary.inStock}</strong>
            </div>

          </div>


          <div className="inventory-summary-card">

            <div className="inventory-summary-icon inventory-summary-warning">
              <AlertTriangle size={18} />
            </div>

            <div>
              <span>Low Stock</span>
              <strong>{summary.lowStock}</strong>
            </div>

          </div>


          <div className="inventory-summary-card">

            <div className="inventory-summary-icon inventory-summary-danger">
              <AlertTriangle size={18} />
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{summary.outOfStock}</strong>
            </div>

          </div>

        </div>


        {/* ======================================================
            SEARCH + FILTER
        ====================================================== */}

        <div className="seller-inventory-toolbar">

          <div className="seller-inventory-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search product, SKU, brand or category..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

          </div>


          <div className="seller-inventory-filter">

            <Filter size={16} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >

              <option value="ALL">
                All Status
              </option>

              <option value="IN_STOCK">
                In Stock
              </option>

              <option value="LOW_STOCK">
                Low Stock
              </option>

              <option value="OUT_OF_STOCK">
                Out of Stock
              </option>

              <option value="UNAVAILABLE">
                Unavailable
              </option>

            </select>

          </div>

        </div>


        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {inventoryItems.length === 0 ? (

          <div className="seller-inventory-empty">

            <div className="seller-inventory-empty-icon">

              <Package size={34} />

            </div>

            <h2>No Products Found</h2>

            <p>
              You have not added any products yet.
              Add your first product to start managing inventory.
            </p>

            <Link
              to="/seller/add-product"
              className="seller-inventory-empty-button"
            >

              <PlusCircle size={17} />

              Add Product

            </Link>

          </div>

        ) : filteredItems.length === 0 ? (

          <div className="seller-inventory-empty">

            <div className="seller-inventory-empty-icon">

              <Search size={34} />

            </div>

            <h2>No Matching Products</h2>

            <p>
              Try changing your search text or stock status filter.
            </p>

          </div>

        ) : (

          <>
            {/* ==================================================
                INVENTORY TABLE
            ================================================== */}

            <div className="seller-inventory-table-wrapper">

              <table className="seller-inventory-table">

                <thead>

                  <tr>

                    <th>PRODUCT</th>

                    <th>AVAILABLE</th>

                    <th>RESERVED</th>

                    <th>REORDER</th>

                    <th>STATUS</th>

                    <th>MANAGE STOCK</th>

                  </tr>

                </thead>


                <tbody>

                  {paginatedItems.map((item) => {

                    const product = item.product;
                    const inventory = item.inventory;

                    const status =
                      getStockStatus(inventory);

                    const productId =
                      product.productId;

                    const isUpdating =
                      updatingProductId === productId;


                    return (

                      <tr key={productId}>


                        {/* PRODUCT */}

                        <td>

                          <div className="inventory-table-product">

                            <div className="inventory-table-image">

                              {product.imageUrl ? (

                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                />

                              ) : (

                                <Package size={20} />

                              )}

                            </div>


                            <div className="inventory-table-product-info">

                              <strong
                                title={product.productName}
                              >
                                {product.productName}
                              </strong>

                              <span>
                                SKU: {product.sku || "N/A"}
                              </span>

                              <small>
                                {product.category?.categoryName ||
                                  "Uncategorized"}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* AVAILABLE */}

                        <td>

                          <span className="inventory-stock-number">

                            {inventory
                              ? inventory.availableQuantity ?? 0
                              : "—"}

                          </span>

                        </td>


                        {/* RESERVED */}

                        <td>

                          <span className="inventory-stock-number inventory-reserved-number">

                            {inventory
                              ? inventory.reservedQuantity ?? 0
                              : "—"}

                          </span>

                        </td>


                        {/* REORDER */}

                        <td>

                          <span className="inventory-reorder-number">

                            {inventory
                              ? inventory.reorderLevel ?? 0
                              : "—"}

                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`seller-inventory-status seller-inventory-status-${status.type}`}
                          >

                            {status.type === "success" && (
                              <CheckCircle2 size={14} />
                            )}

                            {status.type === "warning" && (
                              <AlertTriangle size={14} />
                            )}

                            {status.type === "danger" && (
                              <AlertTriangle size={14} />
                            )}

                            {status.type === "unavailable" && (
                              <Package size={14} />
                            )}

                            {status.label}

                          </span>

                        </td>


                        {/* MANAGE STOCK */}

                        <td>

                          <div className="inventory-stock-controls">

                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="Qty"
                              value={
                                quantities[productId] || ""
                              }
                              onChange={(event) =>
                                handleQuantityChange(
                                  productId,
                                  event.target.value
                                )
                              }
                              disabled={
                                isUpdating ||
                                !inventory
                              }
                            />


                            <button
                              type="button"
                              className="seller-inventory-increase"
                              title="Increase stock"
                              onClick={() =>
                                handleStockChange(
                                  productId,
                                  "increase"
                                )
                              }
                              disabled={
                                isUpdating ||
                                !inventory
                              }
                            >

                              <PlusCircle size={15} />

                              <span>Add</span>

                            </button>


                            <button
                              type="button"
                              className="seller-inventory-decrease"
                              title="Decrease stock"
                              onClick={() =>
                                handleStockChange(
                                  productId,
                                  "decrease"
                                )
                              }
                              disabled={
                                isUpdating ||
                                !inventory
                              }
                            >

                              <MinusCircle size={15} />

                              <span>Remove</span>

                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>


            {/* ==================================================
                PAGINATION
            ================================================== */}

            <div className="seller-inventory-pagination">

              <div className="inventory-pagination-info">

                Showing{" "}

                <strong>
                  {Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredItems.length
                  )}
                </strong>

                {" "}–{" "}

                <strong>
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredItems.length
                  )}
                </strong>

                {" "}of{" "}

                <strong>
                  {filteredItems.length}
                </strong>

              </div>


              <div className="inventory-pagination-buttons">

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  disabled={currentPage === 1}
                >

                  <ChevronLeft size={16} />

                  Previous

                </button>


                <span>
                  Page {currentPage} of {totalPages}
                </span>


                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                >

                  Next

                  <ChevronRight size={16} />

                </button>

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  );
}


export default SellerInventory;