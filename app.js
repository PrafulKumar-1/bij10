(() => {
  "use strict";

  const STORAGE_KEY = "prafulExportsCatalogV1";
  const MAX_PRODUCTS = 500;
  const MAX_UPLOAD_IMAGES = 12;
  const FALLBACK_IMAGE = "assets/images/product-1.jpg";
  const CATEGORIES = ["Spices", "Textiles", "Electronics", "Custom"];
  const REGIONS = ["EU", "US", "Asia"];

  const defaultProducts = [
    {
      id: "p-1",
      title: "Premium Whole Spices Collection",
      description: "Curated spice lots with export-ready packaging and origin traceability.",
      category: "Spices",
      region: "EU",
      hsCode: "0904.11",
      moq: "500 kg",
      priceRange: "USD 3.5 - 5.2 / kg",
      notes: "Steam sterilization available on request.",
      image: "assets/images/product-1.jpg",
      gallery: ["assets/images/product-1.jpg"],
      createdAt: Date.now() - 600000
    },
    {
      id: "p-2",
      title: "Custom Textile Rolls",
      description: "Buyer-defined GSM, weave, and finish options for garment and furnishing buyers.",
      category: "Textiles",
      region: "US",
      hsCode: "5208.39",
      moq: "1000 meters",
      priceRange: "USD 1.2 - 4.8 / meter",
      notes: "Private labeling and inspection services included.",
      image: "assets/images/product-2.jpg",
      gallery: ["assets/images/product-2.jpg"],
      createdAt: Date.now() - 500000
    },
    {
      id: "p-3",
      title: "Industrial Electronics Modules",
      description: "Merchant-export support for compliant electronics and quality-tested components.",
      category: "Electronics",
      region: "Asia",
      hsCode: "8537.10",
      moq: "250 units",
      priceRange: "USD 18 - 75 / unit",
      notes: "CE/RoHS coordination as per buyer mandate.",
      image: "assets/images/product-3.jpg",
      gallery: ["assets/images/product-3.jpg"],
      createdAt: Date.now() - 400000
    },
    {
      id: "p-4",
      title: "Tea & Beverage Inputs",
      description: "Assorted tea-grade and beverage ingredients sourced to buyer formulation specs.",
      category: "Custom",
      region: "EU",
      hsCode: "0902.30",
      moq: "300 kg",
      priceRange: "USD 4 - 9 / kg",
      notes: "Custom blend sampling in 5 working days.",
      image: "assets/images/product-4.jpg",
      gallery: ["assets/images/product-4.jpg"],
      createdAt: Date.now() - 300000
    },
    {
      id: "p-5",
      title: "Engineering Hardware Mix",
      description: "Sourced hardware assemblies with flexible packaging for global merchant export.",
      category: "Custom",
      region: "US",
      hsCode: "7318.15",
      moq: "100 cartons",
      priceRange: "USD 220 - 490 / carton",
      notes: "Third-party pre-shipment checks available.",
      image: "assets/images/product-5.jpg",
      gallery: ["assets/images/product-5.jpg"],
      createdAt: Date.now() - 200000
    },
    {
      id: "p-6",
      title: "Artisanal Handicraft Portfolio",
      description: "Premium handicraft selection tailored for retail importers and boutique distributors.",
      category: "Custom",
      region: "Asia",
      hsCode: "9703.00",
      moq: "150 sets",
      priceRange: "USD 35 - 140 / set",
      notes: "Seasonal catalog customization available.",
      image: "assets/images/product-6.jpg",
      gallery: ["assets/images/product-6.jpg"],
      createdAt: Date.now() - 100000
    }
  ];

  const elements = {
    scrollProgress: document.getElementById("scrollProgress"),
    siteHeader: document.getElementById("siteHeader"),
    mobileMenuToggle: document.getElementById("mobileMenuToggle"),
    primaryMenu: document.getElementById("primaryMenu"),
    heroParallax: document.getElementById("heroParallax"),
    heroTypewriter: document.getElementById("heroTypewriter"),
    particleCanvas: document.getElementById("particleCanvas"),
    searchInput: document.getElementById("searchInput"),
    categoryFilter: document.getElementById("categoryFilter"),
    regionFilter: document.getElementById("regionFilter"),
    sortFilter: document.getElementById("sortFilter"),
    resetFilters: document.getElementById("resetFilters"),
    addBlankProduct: document.getElementById("addBlankProduct"),
    productsGrid: document.getElementById("productsGrid"),
    productCount: document.getElementById("productCount"),
    uploadForm: document.getElementById("uploadForm"),
    mainDropzone: document.getElementById("mainDropzone"),
    mainImages: document.getElementById("mainImages"),
    mainPreviewGrid: document.getElementById("mainPreviewGrid"),
    previewBtn: document.getElementById("previewBtn"),
    previewModal: document.getElementById("previewModal"),
    closePreviewModal: document.getElementById("closePreviewModal"),
    previewBody: document.getElementById("previewBody"),
    statListings: document.getElementById("statListings"),
    statCategories: document.getElementById("statCategories"),
    statRegions: document.getElementById("statRegions"),
    contactForm: document.getElementById("contactForm"),
    newsletterForm: document.getElementById("newsletterForm")
  };

  let products = [];
  let uploadImages = [];
  let lastAddedId = null;
  let revealObserver;
  let activeToastTimer;

  function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`;
  }

  function normalizeText(value) {
    return (value ?? "").toString().replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return (value ?? "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parsePrice(priceText) {
    const match = (priceText || "").replace(/,/g, "").match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : Number.NaN;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function loadProducts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        products = [...defaultProducts];
        saveProducts();
        return;
      }

      const parsed = JSON.parse(stored);
      products = Array.isArray(parsed) ? parsed.slice(0, MAX_PRODUCTS) : [...defaultProducts];
    } catch (error) {
      products = [...defaultProducts];
      saveProducts();
    }
  }

  function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products.slice(0, MAX_PRODUCTS)));
  }

  function getFilteredProducts() {
    const searchTerm = normalizeText(elements.searchInput.value).toLowerCase();
    const selectedCategory = elements.categoryFilter.value;
    const selectedRegion = elements.regionFilter.value;

    return products.filter((product) => {
      const title = normalizeText(product.title).toLowerCase();
      const description = normalizeText(product.description).toLowerCase();
      const notes = normalizeText(product.notes).toLowerCase();
      const matchSearch =
        searchTerm.length === 0 ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        notes.includes(searchTerm);
      const matchCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchRegion = selectedRegion === "all" || product.region === selectedRegion;
      return matchSearch && matchCategory && matchRegion;
    });
  }

  function sortProducts(list) {
    const sorted = [...list];
    const sortBy = elements.sortFilter.value;

    sorted.sort((a, b) => {
      if (sortBy === "name-asc") return normalizeText(a.title).localeCompare(normalizeText(b.title));
      if (sortBy === "name-desc") return normalizeText(b.title).localeCompare(normalizeText(a.title));
      if (sortBy === "price-asc") {
        return (parsePrice(a.priceRange) || Number.POSITIVE_INFINITY) - (parsePrice(b.priceRange) || Number.POSITIVE_INFINITY);
      }
      if (sortBy === "price-desc") {
        return (parsePrice(b.priceRange) || -1) - (parsePrice(a.priceRange) || -1);
      }
      return Number(b.createdAt || 0) - Number(a.createdAt || 0);
    });

    return sorted;
  }

  function renderProducts() {
    const filtered = sortProducts(getFilteredProducts());

    if (!filtered.length) {
      elements.productsGrid.innerHTML = `
        <div class="empty-state reveal">
          <p>No matching products found. Adjust filters or add a new product.</p>
        </div>
      `;
      elements.productCount.textContent = "0 products shown";
      observeReveals();
      updateCatalogStats();
      setupInteractiveMotion();
      return;
    }

    elements.productsGrid.innerHTML = filtered
      .map((product) => {
        const isNew = product.id === lastAddedId ? "new-card" : "";
        return `
          <article class="product-card reveal ${isNew}" data-id="${escapeHtml(product.id)}">
            <div class="product-media">
              <img src="${escapeHtml(product.image || FALLBACK_IMAGE)}" alt="${escapeHtml(product.title || "Export product image")}" loading="lazy" width="1200" height="800" />
              <div class="inline-dropzone" data-action="pick-image" tabindex="0" role="button" aria-label="Upload image for ${escapeHtml(product.title || "product")}">
                Drag/Drop or Click to change image
                <input class="image-input" type="file" accept="image/*" hidden />
              </div>
            </div>

            <div class="product-fields">
              <label>
                Product Title
                <input class="field-title" type="text" maxlength="80" value="${escapeHtml(product.title)}" />
              </label>

              <label>
                Description
                <textarea class="field-description" maxlength="360">${escapeHtml(product.description)}</textarea>
              </label>

              <div class="spec-grid">
                <label>
                  Price
                  <input class="field-price" type="text" maxlength="40" value="${escapeHtml(product.priceRange)}" />
                </label>
                <label>
                  HS Code
                  <input class="field-hs" type="text" maxlength="20" value="${escapeHtml(product.hsCode)}" />
                </label>
                <label>
                  MOQ
                  <input class="field-moq" type="text" maxlength="40" value="${escapeHtml(product.moq)}" />
                </label>
              </div>

              <div class="spec-grid">
                <label>
                  Category
                  <select class="field-category">
                    ${renderSelectOptions(CATEGORIES, product.category)}
                  </select>
                </label>
                <label>
                  Region
                  <select class="field-region">
                    ${renderSelectOptions(REGIONS, product.region)}
                  </select>
                </label>
                <label>
                  Notes
                  <input class="field-notes" type="text" maxlength="120" value="${escapeHtml(product.notes || "")}" />
                </label>
              </div>

              <div class="card-actions">
                <button class="btn btn-primary" data-action="save" type="button">Save Product</button>
                <button class="btn btn-secondary" data-action="delete" type="button">Delete</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    elements.productCount.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"} shown`;
    observeReveals();
    updateCatalogStats();
    setupInteractiveMotion();

    if (lastAddedId) {
      const card = elements.productsGrid.querySelector(`[data-id="${CSS.escape(lastAddedId)}"]`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      lastAddedId = null;
    }
  }

  function renderSelectOptions(options, selected) {
    return options
      .map((option) => {
        const selectedAttr = option === selected ? "selected" : "";
        return `<option value="${escapeHtml(option)}" ${selectedAttr}>${escapeHtml(option)}</option>`;
      })
      .join("");
  }

  function getCardData(cardElement) {
    return {
      title: normalizeText(cardElement.querySelector(".field-title")?.value),
      description: normalizeText(cardElement.querySelector(".field-description")?.value),
      priceRange: normalizeText(cardElement.querySelector(".field-price")?.value),
      hsCode: normalizeText(cardElement.querySelector(".field-hs")?.value),
      moq: normalizeText(cardElement.querySelector(".field-moq")?.value),
      category: normalizeText(cardElement.querySelector(".field-category")?.value),
      region: normalizeText(cardElement.querySelector(".field-region")?.value),
      notes: normalizeText(cardElement.querySelector(".field-notes")?.value)
    };
  }

  function validateProductData(data) {
    if (!data.title || !data.description || !data.priceRange || !data.hsCode || !data.moq) {
      return "Please fill product title, description, price, HS code, and MOQ.";
    }
    if (!CATEGORIES.includes(data.category)) {
      return "Please select a valid category.";
    }
    if (!REGIONS.includes(data.region)) {
      return "Please select a valid region.";
    }
    return "";
  }

  function saveProductFromCard(cardElement) {
    const id = cardElement.dataset.id;
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return;

    const cardData = getCardData(cardElement);
    const validationError = validateProductData(cardData);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    products[index] = {
      ...products[index],
      ...cardData,
      updatedAt: Date.now()
    };

    saveProducts();
    renderProducts();
    showToast("Product saved successfully.", "success");
  }

  function deleteProduct(id) {
    const next = products.filter((product) => product.id !== id);
    if (next.length === products.length) return;
    products = next;
    saveProducts();
    renderProducts();
    showToast("Product deleted.", "success");
  }

  function addBlankProduct() {
    if (products.length >= MAX_PRODUCTS) {
      showToast(`Catalog limit reached (${MAX_PRODUCTS} products).`, "error");
      return;
    }

    const newProduct = {
      id: createId(),
      title: "New Product",
      description: "Add detailed export description for this product.",
      category: "Custom",
      region: "Asia",
      hsCode: "0000.00",
      moq: "Specify MOQ",
      priceRange: "USD 0 - 0 / unit",
      notes: "Add buyer notes",
      image: FALLBACK_IMAGE,
      gallery: [FALLBACK_IMAGE],
      createdAt: Date.now()
    };

    products.unshift(newProduct);
    lastAddedId = newProduct.id;
    saveProducts();
    renderProducts();
    showToast("Blank product added. Update and save details.", "success");
  }

  async function handleCardImageUpload(input, id, fileList) {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Only image files are supported.", "error");
      return;
    }

    try {
      const compressed = await compressImage(file, 1280, 0.82);
      const index = products.findIndex((product) => product.id === id);
      if (index === -1) return;

      products[index].image = compressed;
      products[index].gallery = Array.isArray(products[index].gallery)
        ? [compressed, ...products[index].gallery.filter((img) => img !== compressed)].slice(0, 6)
        : [compressed];
      products[index].updatedAt = Date.now();

      saveProducts();
      renderProducts();
      showToast("Product image updated.", "success");
    } catch (error) {
      showToast("Unable to process image. Try a different file.", "error");
    } finally {
      if (input) input.value = "";
    }
  }

  function updateCatalogStats() {
    const categories = new Set(products.map((product) => product.category).filter(Boolean));
    const regions = new Set(products.map((product) => product.region).filter(Boolean));

    setCounterValue(elements.statListings, products.length);
    setCounterValue(elements.statCategories, categories.size || 0);
    setCounterValue(elements.statRegions, regions.size || 0);
  }

  function setCounterValue(element, targetValue) {
    if (!element) return;
    const parsedTarget = Math.max(0, Number(targetValue) || 0);
    const currentValue = Number(element.dataset.countCurrent ?? element.textContent) || 0;

    if (currentValue === parsedTarget) {
      element.textContent = String(parsedTarget);
      element.dataset.countCurrent = String(parsedTarget);
      element.dataset.countTo = String(parsedTarget);
      return;
    }

    element.dataset.countTo = String(parsedTarget);
    animateCount(element, currentValue, parsedTarget, 740);
  }

  function animateCount(element, startValue, endValue, durationMs) {
    const startTime = performance.now();
    const delta = endValue - startValue;

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startValue + delta * eased);
      element.textContent = String(value);
      element.dataset.countCurrent = String(value);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  function setupProductEvents() {
    elements.productsGrid.addEventListener("click", (event) => {
      const saveButton = event.target.closest('[data-action="save"]');
      if (saveButton) {
        const card = saveButton.closest(".product-card");
        if (card) saveProductFromCard(card);
        return;
      }

      const deleteButton = event.target.closest('[data-action="delete"]');
      if (deleteButton) {
        const card = deleteButton.closest(".product-card");
        if (!card) return;
        const id = card.dataset.id;
        if (window.confirm("Delete this product from catalog?")) {
          deleteProduct(id);
        }
        return;
      }

      const pickImage = event.target.closest('[data-action="pick-image"]');
      if (pickImage) {
        const input = pickImage.querySelector(".image-input");
        if (input) input.click();
      }
    });

    elements.productsGrid.addEventListener("keydown", (event) => {
      const pickImage = event.target.closest('[data-action="pick-image"]');
      if (!pickImage) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const input = pickImage.querySelector(".image-input");
        if (input) input.click();
      }
    });

    elements.productsGrid.addEventListener("change", (event) => {
      const imageInput = event.target.closest(".image-input");
      if (!imageInput) return;
      const card = imageInput.closest(".product-card");
      if (!card) return;
      handleCardImageUpload(imageInput, card.dataset.id, imageInput.files);
    });

    elements.productsGrid.addEventListener("dragover", (event) => {
      const dropzone = event.target.closest(".inline-dropzone");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.classList.add("dragover");
    });

    elements.productsGrid.addEventListener("dragleave", (event) => {
      const dropzone = event.target.closest(".inline-dropzone");
      if (!dropzone) return;
      dropzone.classList.remove("dragover");
    });

    elements.productsGrid.addEventListener("drop", (event) => {
      const dropzone = event.target.closest(".inline-dropzone");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.classList.remove("dragover");
      const card = dropzone.closest(".product-card");
      const input = dropzone.querySelector(".image-input");
      if (!card || !input || !event.dataTransfer?.files?.length) return;
      handleCardImageUpload(input, card.dataset.id, event.dataTransfer.files);
    });
  }

  function setupFilters() {
    [elements.searchInput, elements.categoryFilter, elements.regionFilter, elements.sortFilter].forEach((control) => {
      control.addEventListener("input", renderProducts);
      control.addEventListener("change", renderProducts);
    });

    elements.resetFilters.addEventListener("click", () => {
      elements.searchInput.value = "";
      elements.categoryFilter.value = "all";
      elements.regionFilter.value = "all";
      elements.sortFilter.value = "newest";
      renderProducts();
    });

    elements.addBlankProduct.addEventListener("click", addBlankProduct);
  }

  function setupUploadPortal() {
    elements.mainDropzone.addEventListener("click", () => elements.mainImages.click());
    elements.mainDropzone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elements.mainImages.click();
      }
    });

    elements.mainDropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      elements.mainDropzone.classList.add("dragover");
    });

    elements.mainDropzone.addEventListener("dragleave", () => {
      elements.mainDropzone.classList.remove("dragover");
    });

    elements.mainDropzone.addEventListener("drop", async (event) => {
      event.preventDefault();
      elements.mainDropzone.classList.remove("dragover");
      await handleMainImageFiles(event.dataTransfer?.files);
    });

    elements.mainImages.addEventListener("change", async (event) => {
      await handleMainImageFiles(event.target.files);
      event.target.value = "";
    });

    elements.previewBtn.addEventListener("click", openPreviewModal);
    elements.closePreviewModal.addEventListener("click", closePreviewModal);

    elements.previewModal.addEventListener("click", (event) => {
      if (event.target === elements.previewModal) {
        closePreviewModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && elements.previewModal.classList.contains("is-open")) {
        closePreviewModal();
      }
    });

    elements.uploadForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = getUploadFormData();
      const validationError = validateUploadFormData(data);

      if (validationError) {
        showToast(validationError, "error");
        return;
      }

      if (products.length >= MAX_PRODUCTS) {
        showToast(`Catalog limit reached (${MAX_PRODUCTS} products).`, "error");
        return;
      }

      const product = {
        id: createId(),
        title: data.name,
        description: data.description,
        category: data.category,
        region: data.region,
        hsCode: data.hsCode,
        moq: data.moq,
        priceRange: data.priceRange,
        notes: data.notes,
        image: uploadImages[0] || FALLBACK_IMAGE,
        gallery: uploadImages.length ? [...uploadImages] : [FALLBACK_IMAGE],
        createdAt: Date.now()
      };

      products.unshift(product);
      lastAddedId = product.id;
      saveProducts();
      renderProducts();
      resetUploadForm();
      closePreviewModal();
      showToast("Product submitted to catalog.", "success");

      const target = document.getElementById("products");
      if (target) {
        scrollWithHeaderOffset(target);
      }
    });
  }

  function getUploadFormData() {
    return {
      name: normalizeText(document.getElementById("uploadName")?.value),
      category: normalizeText(document.getElementById("uploadCategory")?.value),
      hsCode: normalizeText(document.getElementById("uploadHs")?.value),
      moq: normalizeText(document.getElementById("uploadMoq")?.value),
      priceRange: normalizeText(document.getElementById("uploadPrice")?.value),
      region: normalizeText(document.getElementById("uploadRegion")?.value),
      description: normalizeText(document.getElementById("uploadDescription")?.value),
      notes: normalizeText(document.getElementById("uploadNotes")?.value)
    };
  }

  function validateUploadFormData(data) {
    if (!data.name || !data.category || !data.hsCode || !data.moq || !data.priceRange || !data.region || !data.description) {
      return "Please complete all required upload fields.";
    }

    if (!CATEGORIES.includes(data.category)) {
      return "Select a valid category before submitting.";
    }

    if (!REGIONS.includes(data.region)) {
      return "Select a valid region before submitting.";
    }

    if (!uploadImages.length) {
      return "Please upload at least one product image.";
    }

    return "";
  }

  async function handleMainImageFiles(fileList) {
    if (!fileList || !fileList.length) return;

    const incoming = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_UPLOAD_IMAGES);

    if (!incoming.length) {
      showToast("No valid image files detected.", "error");
      return;
    }

    try {
      const nextImages = [];
      for (const file of incoming) {
        const compressed = await compressImage(file, 1280, 0.82);
        nextImages.push(compressed);
      }

      uploadImages = [...uploadImages, ...nextImages].slice(0, MAX_UPLOAD_IMAGES);
      renderMainPreviewGrid();
      showToast(`${nextImages.length} image${nextImages.length === 1 ? "" : "s"} added.`, "success");
    } catch (error) {
      showToast("Unable to process one or more images.", "error");
    }
  }

  function renderMainPreviewGrid() {
    if (!uploadImages.length) {
      elements.mainPreviewGrid.innerHTML = "";
      return;
    }

    elements.mainPreviewGrid.innerHTML = uploadImages
      .map(
        (image, index) => `
          <div class="main-preview-card" title="Upload image ${index + 1}">
            <img src="${image}" alt="Upload preview ${index + 1}" loading="lazy" width="300" height="300" />
          </div>
        `
      )
      .join("");
  }

  function openPreviewModal() {
    const data = getUploadFormData();

    const imageMarkup = uploadImages.length
      ? uploadImages
          .map(
            (image, index) =>
              `<img src="${image}" alt="Preview image ${index + 1}" loading="lazy" width="320" height="320" />`
          )
          .join("")
      : "<p>No images selected yet.</p>";

    elements.previewBody.innerHTML = `
      <p><strong>Name:</strong> ${escapeHtml(data.name || "-")}</p>
      <p><strong>Category:</strong> ${escapeHtml(data.category || "-")}</p>
      <p><strong>Region:</strong> ${escapeHtml(data.region || "-")}</p>
      <p><strong>HS Code:</strong> ${escapeHtml(data.hsCode || "-")}</p>
      <p><strong>MOQ:</strong> ${escapeHtml(data.moq || "-")}</p>
      <p><strong>Price Range:</strong> ${escapeHtml(data.priceRange || "-")}</p>
      <p><strong>Description:</strong> ${escapeHtml(data.description || "-")}</p>
      <p><strong>Buyer Notes:</strong> ${escapeHtml(data.notes || "-")}</p>
      <div class="preview-list">${imageMarkup}</div>
    `;

    elements.previewModal.classList.add("is-open");
    elements.previewModal.setAttribute("aria-hidden", "false");
    elements.closePreviewModal.focus();
  }

  function closePreviewModal() {
    elements.previewModal.classList.remove("is-open");
    elements.previewModal.setAttribute("aria-hidden", "true");
  }

  function resetUploadForm() {
    elements.uploadForm.reset();
    uploadImages = [];
    renderMainPreviewGrid();
  }

  function setupContactForms() {
    elements.contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = normalizeText(document.getElementById("contactName")?.value);
      const email = normalizeText(document.getElementById("contactEmail")?.value);
      const product = normalizeText(document.getElementById("contactProduct")?.value);
      const message = normalizeText(document.getElementById("contactMessage")?.value);

      if (!name || !email || !product || !message) {
        showToast("Please fill all inquiry fields.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showToast("Enter a valid email address.", "error");
        return;
      }

      elements.contactForm.reset();
      showToast("Inquiry submitted. We will contact you shortly.", "success");
    });

    elements.newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = normalizeText(document.getElementById("newsletterEmail")?.value);
      if (!isValidEmail(email)) {
        showToast("Please enter a valid newsletter email.", "error");
        return;
      }

      elements.newsletterForm.reset();
      showToast("Newsletter subscription saved.", "success");
    });
  }

  function showToast(message, type = "success") {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    clearTimeout(activeToastTimer);
    activeToastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
      window.setTimeout(() => toast.remove(), 200);
    }, 2600);
  }

  async function compressImage(file, maxWidth = 1280, quality = 0.82) {
    const dataUrl = await readFileAsDataURL(file);
    const image = await loadImage(dataUrl);

    const scale = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas unsupported");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function setupNavigation() {
    elements.mobileMenuToggle.addEventListener("click", () => {
      const isOpen = elements.primaryMenu.classList.toggle("is-open");
      elements.mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        scrollWithHeaderOffset(target);

        if (elements.primaryMenu.classList.contains("is-open")) {
          elements.primaryMenu.classList.remove("is-open");
          elements.mobileMenuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    window.addEventListener(
      "scroll",
      () => {
        updateScrollEffects();
      },
      { passive: true }
    );

    updateScrollEffects();
  }

  function scrollWithHeaderOffset(target) {
    const headerOffset = elements.siteHeader ? elements.siteHeader.offsetHeight + 8 : 86;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function updateScrollEffects() {
    const scrollY = window.scrollY;

    if (elements.siteHeader) {
      elements.siteHeader.style.boxShadow = scrollY > 18 ? "0 8px 30px rgba(0,0,0,0.35)" : "none";
      elements.siteHeader.style.borderBottomColor =
        scrollY > 18 ? "rgba(212, 175, 55, 0.36)" : "rgba(212, 175, 55, 0.2)";
    }

    if (elements.heroParallax) {
      const offset = Math.min(scrollY * 0.22, 140);
      elements.heroParallax.style.transform = `translateY(${offset}px) scale(1.08)`;
    }

    if (elements.scrollProgress) {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      );
      const progress = Math.min(100, (scrollY / maxScroll) * 100);
      elements.scrollProgress.style.width = `${progress.toFixed(2)}%`;
    }
  }

  function setupInteractiveMotion() {
    setupTiltCards();
    setupMagneticButtons();
  }

  function setupTiltCards() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = document.querySelectorAll(".metric-tilt, .product-card, .catalog-card, .cert-card");
    targets.forEach((target) => {
      if (target.dataset.tiltBound === "1") return;
      target.dataset.tiltBound = "1";

      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = (0.5 - y / rect.height) * 8;
        target.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
      });

      target.addEventListener("pointerleave", () => {
        target.style.transform = "";
      });
    });
  }

  function setupMagneticButtons() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((button) => {
      if (button.dataset.magneticBound === "1") return;
      button.dataset.magneticBound = "1";

      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        const moveX = x * 0.08;
        const moveY = y * 0.12;
        button.style.transform = `translate(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  function startTypewriter() {
    const lines = [
      "Export precision with premium sourcing excellence.",
      "From Mumbai to global buyers across EU, US, and Asia.",
      "Upload any requirement and receive tailored supply support."
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const line = lines[lineIndex];
      if (!elements.heroTypewriter) return;

      if (!deleting) {
        charIndex += 1;
      } else {
        charIndex -= 1;
      }

      elements.heroTypewriter.textContent = line.slice(0, charIndex);

      let delay = deleting ? 35 : 58;

      if (!deleting && charIndex >= line.length) {
        delay = 1300;
        deleting = true;
      } else if (deleting && charIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        delay = 320;
      }

      window.setTimeout(tick, delay);
    }

    tick();
  }

  function setupRevealObserver() {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    observeReveals();
  }

  function observeReveals() {
    if (!revealObserver) return;
    document.querySelectorAll(".reveal").forEach((element, index) => {
      if (element.dataset.revealBound === "1") return;
      element.dataset.revealBound = "1";
      element.style.transitionDelay = `${Math.min(380, index * 45)}ms`;
      revealObserver.observe(element);
    });
  }

  function setupParticles() {
    const canvas = elements.particleCanvas;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let rafId;
    let particles = [];

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.floor(rect?.width || window.innerWidth);
      height = Math.floor(rect?.height || window.innerHeight);
      canvas.width = width;
      canvas.height = height;

      const count = Math.max(28, Math.min(72, Math.floor(width / 22)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.9 + 0.4,
        a: Math.random() * 0.58 + 0.15
      }));
    }

    function draw() {
      context.clearRect(0, 0, width, height);

      for (const point of particles) {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;

        context.beginPath();
        context.fillStyle = `rgba(212, 175, 55, ${point.a})`;
        context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        context.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
  }

  function init() {
    loadProducts();
    renderProducts();
    setupProductEvents();
    setupFilters();
    setupUploadPortal();
    setupContactForms();
    setupNavigation();
    setupRevealObserver();
    startTypewriter();
    setupParticles();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
