console.log('🎯 SCRIPT START: designer.bundle.js is loading...');

// Global flag to prevent double initialization
let designerInitialized = false;

// Wait for fabric.js to be available before continuing
function waitForFabric() {
    console.log('🎯 FABRIC CHECK: fabric object available:', typeof fabric);

    if (typeof fabric !== 'undefined') {
        console.log('🎯 FABRIC AVAILABLE: fabric.js is ready, initializing components...');
        initializeDesignerComponents();
        return;
    }

    console.log('🎯 FABRIC WAITING: Setting up event listener for fabricGlobalReady...');

    // Set up event listener for fabricGlobalReady
    const handleFabricReady = (event) => {
        console.log('🎯 FABRIC EVENT: fabricGlobalReady received, source:', event.detail?.source);
        console.log('🎯 FABRIC AVAILABLE: fabric.js is ready via event, initializing components...');
        window.removeEventListener('fabricGlobalReady', handleFabricReady);
        clearTimeout(timeoutId);
        initializeDesignerComponents();
    };

    window.addEventListener('fabricGlobalReady', handleFabricReady);

    // Keep polling as backup with timeout
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds

    const pollBackup = () => {
        attempts++;
        console.log(`🎯 FABRIC POLL: Attempt ${attempts}/${maxAttempts}, fabric available:`, typeof fabric);

        if (typeof fabric !== 'undefined') {
            console.log('🎯 FABRIC AVAILABLE: fabric.js ready via polling backup, initializing components...');
            window.removeEventListener('fabricGlobalReady', handleFabricReady);
            clearTimeout(timeoutId);
            initializeDesignerComponents();
        } else if (attempts < maxAttempts) {
            setTimeout(pollBackup, 100);
        } else {
            console.error('❌ FABRIC TIMEOUT: fabric.js not available after 10 seconds');
            window.removeEventListener('fabricGlobalReady', handleFabricReady);
        }
    };

    const timeoutId = setTimeout(pollBackup, 100);
}

function initializeDesignerComponents() {
    // Prevent double initialization
    if (designerInitialized) {
        console.log('🎯 ALREADY INITIALIZED: Designer components already initialized, skipping...');
        return;
    }

    designerInitialized = true;
    console.log('🎯 INITIALIZATION: Starting designer components initialization...');

    let Canvas, Image, Rect, ActiveSelection, filters, Group;

    try {
        ({ Canvas, Image, Rect, ActiveSelection, filters, Group } = fabric);
        console.log('🎯 FABRIC DESTRUCTURE: Successfully destructured fabric components');

        // Continue with the rest of the script
        loadDesignerWidget(Canvas, Image, Rect, ActiveSelection, filters, Group);
    } catch (error) {
        console.error('❌ FABRIC DESTRUCTURE: Error destructuring fabric:', error);
        console.error('❌ FABRIC DESTRUCTURE: fabric object:', fabric);
        throw error;
    }
}

function loadDesignerWidget(Canvas, Image, Rect, ActiveSelection, filters, Group) {

// ToastManager class (inlined from ToastManager.js)
class ToastManager {
    constructor(container) {
        if (!container) throw new Error('Container element is required');

        this.container = container;
        this.toastContainer = null;

        this.initialize();
    }

    initialize() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        this.container.appendChild(this.toastContainer);
    }

    show(message, type = 'info', options = {}) {
        const defaultOptions = {
            duration: 1500
        };

        const config = { ...defaultOptions, ...options };
        const toastElement = this.createToastElement(message, type, config);

        this.toastContainer.appendChild(toastElement);

        requestAnimationFrame(() => {
            toastElement.classList.add('show');
        });

        if (config.duration !== null) {
            setTimeout(() => {
                this.removeToast(toastElement);
            }, config.duration);
        }
    }

    createToastElement(message, type, config) {
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;

        const icon = document.createElement('div');
        icon.className = `toast-icon ${type}`;

        switch (type) {
            case 'success':
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>`;
                break;
            case 'error':
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>`;
                break;
            default:
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>`;
        }

        const messageSpan = document.createElement('span');
        messageSpan.className = 'toast-content';
        messageSpan.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;

        closeButton.addEventListener('click', () => {
            this.removeToast(toast);
        });

        toast.appendChild(icon);
        toast.appendChild(messageSpan);
        toast.appendChild(closeButton);

        return toast;
    }

    removeToast(element) {
        element.classList.remove('show');

        element.addEventListener('transitionend', () => {
            element.remove();
        }, { once: true });
    }
}

class DesignerWidget {

    constructor() {
        console.log('🎯 DESIGNER WIDGET: Constructor called');
        this.container = document.querySelector('.octo-print-designer');
        console.log('🎯 DESIGNER WIDGET: Container element found:', !!this.container);
        if (!this.container) {
            console.error('❌ DESIGNER WIDGET: No .octo-print-designer element found on page');
            return;
        }
        console.log('🎯 DESIGNER WIDGET: Proceeding with initialization...');

        this.currentDesignId = null;
        this.templates = new Map();
        this.currentView = null;
        this.currentVariation = null;
        this.activeTemplateId = null;
        
        // Store view-specific images and their transforms per variation
        this.variationImages = new Map(); // Key format: `${variationId}_${viewId}`
        this._renderGen = 0; // Generation counter — stale loadTemplateView callbacks are ignored
        this._boundImages = new WeakSet(); // prevents duplicate bindImageEvents calls

        // In-memory storage for temporary images (non-logged users)
        this.tempImages = [];
        this.tempImageCounter = 0;
        this.isLoggedIn = window.octoPrintDesigner?.isLoggedIn || false;
        this.isPrintingVisible = true; // Print Zone standardmäßig sichtbar
        console.log('🎯 INITIAL isPrintingVisible set to:', this.isPrintingVisible);
        
        window.addEventListener('resize', () => this.handleResize());

        this.storeElementReferences();
        this.initializeTemplates();
        this.storeModalElements();
        this.setupModalEvents();

        this.toastManager = new ToastManager(this.toastContainer);

        // Print Zone Editing Mode
        this.editingMode = 'image'; // 'image', 'safezone', 'printzone'
        this.printZoneRect = null;
        this.safeZoneRect = null;

        this.init();
        console.log('✅ DESIGNER WIDGET: Constructor completed successfully');
    }

    initializeToolbar() {
        // Clone toolbar template
        const toolbarTemplate = document.getElementById('designer-image-toolbar-template');
        this.imageToolbar = toolbarTemplate.content.cloneNode(true).querySelector('.designer-image-toolbar');
        this.canvas.parentNode.appendChild(this.imageToolbar);
    
        // Store references to inputs
        this.widthInput = this.imageToolbar.querySelector('.width-input');
        this.heightInput = this.imageToolbar.querySelector('.height-input');
        this.pixelToCmLabel = this.imageToolbar.querySelector('.pixel-to-cm');
    
        // Add toolbar button handlers
        this.imageToolbar.querySelector('.center-image').addEventListener('click', () => {
            const activeObject = this.fabricCanvas.getActiveObject();
            if (activeObject) {
                activeObject.set({
                    left: this.fabricCanvas.width / 2,
                    top: this.fabricCanvas.height / 2
                });
                
                activeObject.setCoords();
                this.fabricCanvas.renderAll();
                
                // Update stored position for the active object
                if (this.currentView && this.currentVariation) {
                    const key = `${this.currentVariation}_${this.currentView}`;
                    const imagesArray = this.variationImages.get(key);
                    if (imagesArray) {
                        const activeId = activeObject.data?.imageId;
                        const imageData = activeId
                            ? imagesArray.find(d => d.id === activeId)
                            : imagesArray[imagesArray.length - 1];
                        if (imageData) {
                            imageData.transform = this._imgToTransform(activeObject);
                        }
                    }
                }

                this.updateToolbarPosition();
            }
        });

        // Add width/height input handlers
        this.widthInput.addEventListener('input', (e) => this.handleDimensionChange('width', e.target.value));
        this.heightInput.addEventListener('input', (e) => this.handleDimensionChange('height', e.target.value));
        
        // Rename label to clarify it shows physical dimensions
        this.pixelToCmLabel.classList.add('physical-dimensions');
    }

    // Returns the print-zone geometry in canvas pixels.
    // Pass (canvas, view) to compute for a different canvas (e.g. preview temp canvas).
    // safeZone.width/height are in main-canvas pixels, so they are scaled by the canvas ratio.
    // cw/ch are stored so legacy leftPct/topPct formats can resolve correctly in _applyTransform.
    _getZone(canvas = null, view = null) {
        const c = canvas || this.fabricCanvas;
        if (!view) {
            const template = this.templates.get(this.activeTemplateId);
            const variation = template.variations.get(this.currentVariation.toString());
            view = variation.views.get(this.currentView);
        }
        const sz = view.safeZone;
        const ratio = canvas ? (canvas.width / this.fabricCanvas.width) : 1;
        const zone = {
            cx: (sz.left / 100) * c.width,
            cy: (sz.top  / 100) * c.height,
            w:  sz.width  * ratio,
            h:  sz.height * ratio,
            cw: c.width,
            ch: c.height,
        };
        console.log('[ZONE] canvas:', c.width, 'x', c.height, '| sz:', sz.left, sz.top, sz.width, sz.height, '| cx,cy,w,h:', zone.cx.toFixed(0), zone.cy.toFixed(0), zone.w.toFixed(0), zone.h.toFixed(0));
        return zone;
    }

    // Pure function: fabric Image → zone-relative transform object. No side effects, no mutations.
    _imgToTransform(img) {
        const { cx, cy, w, h } = this._getZone();
        return {
            zx: (img.left - cx) / w,
            zy: (img.top  - cy) / h,
            sw: (img.width * img.scaleX) / w,
            angle: img.angle || 0,
            nw: img.width,
            nh: img.height,
        };
    }

    // Pure render function: applies transform data onto a fabric Image. No saves, no side effects.
    // Pass a precomputed zone (from _getZone) to render onto a different canvas (e.g. preview).
    _applyTransform(img, t, zone = null) {
        const { cx, cy, w, h, cw, ch } = zone || this._getZone();
        if (t.zx !== undefined) {
            // Current format: zone-relative
            const scaleX = t.nw > 0 ? (t.sw * w) / t.nw : 1;
            img.set({ left: cx + t.zx * w, top: cy + t.zy * h, scaleX, scaleY: scaleX, angle: t.angle || 0 });
        } else if (t.leftPct !== undefined) {
            // Legacy format (one-time migration read path): canvas-fraction
            img.set({ left: t.leftPct * cw, top: t.topPct * ch, scaleX: t.scaleX, scaleY: t.scaleY, angle: t.angle || 0 });
        } else {
            // Oldest format (one-time migration read path): absolute pixels
            img.set({ left: t.left, top: t.top, scaleX: t.scaleX, scaleY: t.scaleY, angle: t.angle || 0 });
        }
    }

    handleDimensionChange(dimension, value) {
        const activeObject = this.fabricCanvas.getActiveObject();
        if (!activeObject) return;

        const pixelValue = parseInt(value, 10);
        if (isNaN(pixelValue)) return;

        const currentWidth = activeObject.width * activeObject.scaleX;
        const currentHeight = activeObject.height * activeObject.scaleY;
        const aspectRatio = activeObject.width / activeObject.height;

        let newScaleX, newScaleY;

        if (dimension === 'width') {
            newScaleX = pixelValue / activeObject.width;
            newScaleY = newScaleX; // Maintain aspect ratio
        } else {
            newScaleY = pixelValue / activeObject.height;
            newScaleX = newScaleY; // Maintain aspect ratio
        }

        // Apply new scale
        activeObject.set({
            scaleX: newScaleX,
            scaleY: newScaleY
        });

        // Update the other input
        if (dimension === 'width') {
            this.heightInput.value = Math.round(activeObject.height * newScaleY);
        } else {
            this.widthInput.value = Math.round(activeObject.width * newScaleX);
        }

        // Update physical dimensions display
        this.updatePixelToCmConversion();

        activeObject.setCoords();
        this.fabricCanvas.renderAll();
        this.updateToolbarPosition();
        this.updateImageTransform(activeObject);
    }

    updatePixelToCmConversion() {
        // This method now updates the physical dimensions display
        const activeObject = this.fabricCanvas.getActiveObject();
        if (!activeObject) return;
        
        const template = this.templates.get(this.activeTemplateId);
        if (!template) return;
        
        // Get physical dimensions and canvas dimensions
        const physicalWidth = template.physical_width_cm || 30;
        const physicalHeight = template.physical_height_cm || 40;
        
        const view = template.variations.get(this.currentVariation)?.views.get(this.currentView);
        if (!view) return;
        
        const safeZoneWidth = view.safeZone?.width || 800;
        const safeZoneHeight = view.safeZone?.height || 500;
        
        // Calculate actual physical dimensions of the design
        const designWidthCm = ((activeObject.width * activeObject.scaleX) / safeZoneWidth) * physicalWidth;
        const designHeightCm = ((activeObject.height * activeObject.scaleY) / safeZoneHeight) * physicalHeight;
        
        // Update the physical dimensions display
        this.pixelToCmLabel.textContent = `${designWidthCm.toFixed(1)}cm × ${designHeightCm.toFixed(1)}cm`;
    }

    storeElementReferences() {
        // Navigation elements
        this.navItems = this.container.querySelectorAll('.designer-nav-item');
        this.sectionItemsContainer = this.container.querySelector('.designer-item-sections');
        this.sectionContents = this.container.querySelectorAll('.designer-item-section-content');
        
        // Upload zone elements
        this.uploadZone = this.container.querySelector('#uploadZone');
        this.uploadInput = this.container.querySelector('#uploadInput');
        this.imagesGrid = this.container.querySelector('.images-grid');
        this.imagesGridLimit = this.container.querySelector('.images-grid-limit');
        
        // Canvas elements
        this.canvas = this.container.querySelector('#octo-print-designer-canvas');
        this.viewsToolbar = this.container.querySelector('.views-toolbar');
        
        // Variation elements
        this.variationsToolbar = this.container.querySelector('.variations-toolbar');
        this.variationsList = this.container.querySelector('.variations-list');
        
        // Zoom controls
        this.zoomControls = this.container.querySelector('.zoom-controls');
        this.zoomInput = this.zoomControls.querySelector('input');
        this.zoomButtons = this.zoomControls.querySelectorAll('button');
        this.zoomPopup = this.container.querySelector('.zoom-level-popup');
        this.zoomRange = this.zoomPopup.querySelector('input');

        // Library section
        this.libraryGrid = this.container.querySelector('[data-section="library"] .images-grid');

        //Designer Toolbar
        this.togglePrintZoneButton = this.container.querySelector('#toggle-print-zone');

        this.toastContainer = this.container.querySelector('.toast-container');
    }

    initializeTemplates() {
        this.libraryImageTemplate = document.querySelector('#octo-print-designer-library-image-template');
        this.libraryItemTemplate = document.querySelector('#octo-print-designer-library-item-template');
        this.viewButtonTemplate = document.querySelector('#octo-print-designer-view-button-template');
    }

    async init() {

        this.initializeCanvas();
        this.initializeToolbar();

        await Promise.all([
            this.loadTemplates(),
            this.loadUserImages()
        ]);
        
        this.setupNavigationEvents();
        this.setupModeSelectionEvents();
        this.setupUploadEvents();
        this.setupZoomControls();
        this.setupDesignerToolbar();
        this.setupViewButtons();
        this.updateImagesGridLimit();
        this.handleResize();

        this.updateZoom(100);

        // Capture design_id NOW — loadInitialTemplate strips all URL params via replaceState.
        const designId = new URLSearchParams(window.location.search).get('design_id');

        await this.loadInitialTemplate();

        // Always run edit flow when design_id was present, regardless of activeTemplateId.
        if (designId) {
            await this.loadInitialDesign(designId);
        }
    }

    async loadInitialDesign(designId = null) {
        const id = designId || new URLSearchParams(window.location.search).get('design_id');
        if (!id) return;
        console.log('[EDIT] loadInitialDesign called with id:', id, '| canvas:', this.fabricCanvas.width, 'x', this.fabricCanvas.height);

        // Canvas-Dimensionen prüfen — wenn initializeCanvas() zu früh lief (Layout noch 0×0),
        // jetzt korrigieren. DOM-Layout ist zu diesem Zeitpunkt garantiert abgeschlossen.
        const domW = this.canvas.offsetWidth;
        const domH = this.canvas.offsetHeight;
        if (domW > 50 && domH > 50 && (this.fabricCanvas.getWidth() < 50 || this.fabricCanvas.getHeight() < 50)) {
            this.fabricCanvas.setDimensions({ width: domW, height: domH });
        }

        try {
            const res = await fetch(`/api/designs/${id}`);
            if (!res.ok) return;
            const { data } = await res.json();
            if (!data?.design_data) return;

            const state = data.design_data;

            // Load the template the design was saved with, if different from current.
            if (state.templateId && state.templateId !== this.activeTemplateId) {
                await this.loadTemplate(state.templateId);
            }

            // Populate variationImages BEFORE rendering so loadViewImage picks them up.
            this.applyDesignState(state);

            // Restore saved variation, then render the saved view.
            if (state.currentVariation) {
                this.currentVariation = state.currentVariation;
            }
            if (state.currentView) {
                await this.loadTemplateView(state.currentView);
            }
        } catch (e) {
            console.error('loadInitialDesign failed:', e);
        }
    }

    applyDesignState(state) {
        if (!state?.variationImages) return;
        for (const [key, images] of Object.entries(state.variationImages)) {
            const entries = images.map(img => {
                const t = img.transform;
                if (t && ('left' in t || 'top' in t) && ('zx' in t || 'zy' in t)) {
                    console.error('INVALID MIXED TRANSFORM STATE detected after load:', key, t);
                }
                return {
                    id: img.id,
                    url: img.url,
                    transform: img.transform,  // any format — normalized in configureAndLoadFabricImage
                    visible: img.visible !== false,
                    fabricImage: null,          // lazy: loadViewImage() loads on first view switch
                };
            });
            this.variationImages.set(key, entries);
        }
    }

    async loadInitialTemplate() {

        let templateId = this.getInitialTemplateByUrl();
        if( !templateId ) templateId = this.getDefaultTemplateByData();

        if( !templateId ) return;

        if (templateId && this.templates.has(templateId)) {
            await this.loadTemplate(templateId);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }

    getInitialTemplateByUrl(){

        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('template_id');

        if( !templateId ) return false;

        return templateId;

    }

    getDefaultTemplateByData(){

        const dataTemplateId = this.container.dataset.defaultTemplateId;

        if( !dataTemplateId ) return false;

        return dataTemplateId;

    }

    initializeCanvas() {
        const domW = this.canvas.offsetWidth;
        const domH = this.canvas.offsetHeight;
        console.log('[CANVAS INIT] offsetWidth:', domW, 'offsetHeight:', domH);
        this.fabricCanvas = new fabric.Canvas('octo-print-designer-canvas', {
            width: domW,
            height: domH,
            backgroundColor: '#fff',
            preserveObjectStacking: true
        });
        console.log('[CANVAS INIT] Fabric canvas size:', this.fabricCanvas.width, 'x', this.fabricCanvas.height);
    }

    async loadTemplates() {
        try {
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_templates',
                    nonce: octoPrintDesigner.nonce
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
            if (data.success) {
                this.templates = this.parseTemplates(data.data);
                this.renderTemplatesLibrary();
            } else {
                throw new Error(data.data || 'Error loading templates');
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    async loadUserImages() {
        // Skip loading user images for non-logged in users
        if (!this.isLoggedIn) return;
        
        try {
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_user_images',
                    nonce: octoPrintDesigner.nonce
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
            if (data.success) {
                data.data.images.forEach(image => {
                    this.addImageToGrid(image.url, image.id);
                });
            } else {
                throw new Error(data.data.message || 'Error loading images');
            }
        } catch (error) {
            console.error('Error loading user images:', error);
        }
    }

    parseTemplates(templates) {
        const parsedTemplates = new Map();
        
        for (const [templateId, template] of Object.entries(templates)) {
            template.variations = new Map(Object.entries(template.variations));

            for (const [variationId, variation] of template.variations) {
                variation.views = new Map(Object.entries(variation.views));
                if(variation.is_default) template.defaultVariation = variationId;
            }

            parsedTemplates.set(templateId, template);
        }

        return parsedTemplates;
    }

    renderTemplatesLibrary() {
        this.libraryGrid.innerHTML = '';

        for (const [templateId, template] of this.templates) {
            const templateElement = this.createTemplateElement(template);
            templateElement.addEventListener('click', () => this.loadTemplate(templateId));
            this.libraryGrid.appendChild(templateElement);
        }
    }

    createTemplateElement(template) {
        const $element = this.libraryItemTemplate.content.cloneNode(true);
        const $container = $element.querySelector('.library-item');
        
        const $preview = $container.querySelector('.image-preview');
        const $name = $container.querySelector('span');
        
        const defaultVariation = template.variations.get(template.defaultVariation);
        const firstView = Array.from(defaultVariation.views.values())[0];
        if (firstView?.image_url) $preview.src = firstView.image_url; 
        
        $name.textContent = template.name;
        
        return $container;
    }

    setupViewButtons() {
        this.viewsToolbar.innerHTML = '';
    }

    createViewButton(name, viewId) {
        const buttonTemplate = this.viewButtonTemplate.content.cloneNode(true);
        const button = buttonTemplate.querySelector('button');
        button.textContent = name;
        button.dataset.viewId = viewId;
        button.classList.add('designer-view-button', 'designer-action-button');
        return button;
    }

    updateViewButtons() {

        const template = this.templates.get(this.activeTemplateId);     
        const variation = template.variations.get(this.currentVariation);

        this.viewsToolbar.innerHTML = '';
        
        for (const [viewId, view] of variation.views) {
            const button = this.createViewButton(view.name, viewId);
            this.viewsToolbar.appendChild(button);
            
            button.addEventListener('click', () => {
                this.viewsToolbar.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                this.currentView = viewId;
                this.loadTemplateView(viewId);
            });
        }
        
        const firstButton = this.viewsToolbar.querySelector('button');
        if (firstButton) firstButton.classList.add('active');

    }

    updateVariationButtons() {
        const template = this.templates.get(this.activeTemplateId);

        this.variationsList.innerHTML = '';
        
        template.variations.forEach(variation => {
            const button = document.createElement('button');
            button.classList.add('variation-button');
            button.style.backgroundColor = variation.color;
            button.dataset.variationId = variation.id;
            
            if (variation.is_default) button.classList.add('active');
            
            button.addEventListener('click', () => this.handleVariationChange(variation.id));
            this.variationsList.appendChild(button);
        });
    }

    handleVariationChange(variationId) {
        this.currentVariation = variationId;
        
        this.variationsList.querySelectorAll('.variation-button')
            .forEach(btn => btn.classList.toggle('active', btn.dataset.variationId === variationId));        

        this.loadTemplateView(this.currentView);
    }

    async loadTemplate(templateId) {
        const template = this.templates.get(templateId);     
        if (!template) return;

        if( this.isMobile ) this.sectionItemsContainer.classList.toggle('hidden', true);

        this.activeTemplateId = templateId;
        this.currentVariation = template.defaultVariation;
        
        this.updateVariationButtons();
        this.updateViewButtons();
        
        const defaultVariation = template.variations.get(template.defaultVariation);
        const firstViewId = Array.from(defaultVariation.views.keys())[0];
        if (firstViewId) {
            this.currentView = firstViewId;
            await this.loadTemplateView(firstViewId);
        }

        this.updatePixelToCmConversion();
    }

    async loadTemplateView(viewId) {

        if (!this.activeTemplateId) return;

        const template = this.templates.get(this.activeTemplateId);
        const variation = template.variations.get(this.currentVariation.toString());
        const view = variation.views.get(viewId);

        if (!view) return;

        const gen = ++this._renderGen;
        return new Promise((resolve) => {
            fabric.Image.fromURL(view.image_url, (img) => {
                if (gen !== this._renderGen) { resolve(); return; }
                this.renderTemplateView(view, img);
                resolve();
            });
        });
    }

    renderTemplateView(view, fabricImage) {
        // Clear existing canvas and restore white background (clear() resets backgroundColor to "")
        this.fabricCanvas.clear();
        this.fabricCanvas.backgroundColor = '#ffffff';

        this.clipMask = new fabric.Rect({
            left: view.safeZone.left * this.fabricCanvas.width / 100,
            top: view.safeZone.top * this.fabricCanvas.height / 100,
            width: view.safeZone.width,
            height: view.safeZone.height,
            absolutePositioned: true,
            fill: 'transparent',
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center'
        });

        fabricImage.set({
            ...view.imageZone,
            selectable: false,
            evented: false,
            left: view.imageZone.left * this.fabricCanvas.width / 100,
            top: view.imageZone.top * this.fabricCanvas.height / 100,
            originX: 'center',
            originY: 'center',
        });

        // Use printZone data if available, fallback to safeZone
        const zoneData = (view.printZone && view.printZone.left !== undefined) ? view.printZone : view.safeZone;

        // Position = percent (0–100), size = pixels
        const calculatedLeft   = ((view.safeZone.left / 100) * this.fabricCanvas.width)  - (view.safeZone.width  / 2);
        const calculatedTop    = ((view.safeZone.top  / 100) * this.fabricCanvas.height) - (view.safeZone.height / 2);
        const calculatedWidth  = view.safeZone.width;
        const calculatedHeight = view.safeZone.height;

        this.printingZoneElement = new Rect({
            left: calculatedLeft,
            top: calculatedTop,
            width: calculatedWidth,
            height: calculatedHeight,
            // fill: 'rgba(0, 124, 186, 0.2)',
            fill: 'transparent',
            stroke: '#007cba',
            strokeWidth: 2,
            strokeDashArray: [10, 5],
            selectable: false,
            evented: false,
            excludeFromExport: true
        });

        // Add stable identifier for PNG generation
        this.printingZoneElement.data = { role: 'printZone' };

        if (view.colorOverlayEnabled) {

            const template = this.templates.get(this.activeTemplateId);
            const variation = template.variations.get(this.currentVariation.toString());

            fabricImage.filters.push(new fabric.Image.filters.BlendColor({
                color: variation?.color,
                mode: 'multiply',
                alpha: view.overlayOpacity || 0.5
            }));
            fabricImage.applyFilters();
        }

        this.fabricCanvas.add(fabricImage);


        if( this.isPrintingVisible ) {
            this.fabricCanvas.add(this.printingZoneElement);
        }

        // Old style: No clipping, just visual rectangle

        // Load saved image for this view if it exists
        this.loadViewImage();
    }

    addImageToGrid(imageUrl, imageId, isTemporary = false) {
        const template = this.libraryImageTemplate.content.cloneNode(true);
        const imageItem = template.querySelector('.library-image-item');
        const preview = imageItem.querySelector('.image-preview');
        const removeButton = imageItem.querySelector('button');

        preview.src = imageUrl;
        imageItem.dataset.imageId = imageId;
        imageItem.dataset.isTemporary = isTemporary ? 'true' : 'false';
        
        preview.addEventListener('click', () => {
            if (this.isMobile) this.sectionItemsContainer.classList.toggle('hidden', true);

            fabric.Image.fromURL(imageUrl, (img) => {
                try {
                    const template = this.templates.get(this.activeTemplateId);
                    const variation = template.variations.get(this.currentVariation.toString());
                    const view = variation.views.get(this.currentView);
                    const safeZone = view?.safeZone;

                    // Scale to fit within the print zone, never upscale beyond 1
                    const scaleX = safeZone && img.width  > 0 ? safeZone.width  / img.width  : 0.5;
                    const scaleY = safeZone && img.height > 0 ? safeZone.height / img.height : 0.5;
                    const scale = Math.min(scaleX, scaleY, 1);

                    // Center of the print zone on canvas (fall back to canvas center)
                    const cx = safeZone ? safeZone.left * this.fabricCanvas.width / 100 : this.fabricCanvas.width / 2;
                    const cy = safeZone ? safeZone.top  * this.fabricCanvas.height / 100 : this.fabricCanvas.height / 2;

                    img.set({
                        left: cx,
                        top: cy,
                        originX: 'center',
                        originY: 'center',
                        scaleX: scale,
                        scaleY: scale,
                        cornerSize: 10,
                        cornerStyle: 'circle',
                        transparentCorners: false,
                        cornerColor: '#007cba',
                        borderColor: '#007cba',
                        cornerStrokeColor: '#fff',
                        padding: 5,
                        opacity: 1,
                    });

                    // Add directly to canvas so it's immediately visible
                    this.fabricCanvas.add(img);
                    this.fabricCanvas.setActiveObject(img);
                    this.fabricCanvas.renderAll();

                    // Store for persistence across view switches
                    this.storeViewImage(imageUrl, img);
                    this.bindImageEvents(img);
                } catch (err) {
                    console.error('[Designer] Error adding image to canvas:', err);
                }
            });
        });

        removeButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!confirm('Are you sure you want to remove this image?')) return;

            if (isTemporary) {
                // Remove temporary image
                this.removeTempImage(imageId);
                imageItem.remove();
                this.updateImagesGridLimit();
                
                // If this image is being used in the current view, remove it
                if (this.currentView && this.currentVariation) {
                    const key = `${this.currentVariation}_${this.currentView}`;
                    const currentImage = this.variationImages.get(key);
                    if (currentImage?.url === imageUrl) this.removeViewImage();
                }
                return;
            }

            try {
                const response = await fetch(octoPrintDesigner.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'delete_user_image',
                        nonce: octoPrintDesigner.nonce,
                        image_id: imageId
                    })
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                
                if (data.success) {
                    imageItem.remove();
                    this.updateImagesGridLimit();
                    
                    // If this image is being used in the current view, remove it
                    if (this.currentView && this.currentVariation) {
                        const key = `${this.currentVariation}_${this.currentView}`;
                        const currentImage = this.variationImages.get(key);
                        if (currentImage?.url === imageUrl) this.removeViewImage();
                    }
                } else {
                    throw new Error(data.data.message || 'Error deleting image');
                }
            } catch (error) {
                console.error('Error deleting image:', error);
                alert('Failed to delete image: ' + error.message);
            }
        });

        this.imagesGrid.appendChild(imageItem);
        this.updateImagesGridLimit();
    }

    storeViewImage(imageUrl, fabricImage) {
        if (!this.currentView || !this.currentVariation) return;
        
        // Create a unique ID for the image
        const imageId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const imageData = {
            id: imageId,
            url: imageUrl,
            transform: this._imgToTransform(fabricImage),
            fabricImage: fabricImage,
            visible: true
        };

        const key = `${this.currentVariation}_${this.currentView}`;

        // Initialize array if needed
        if (!this.variationImages.has(key)) {
            this.variationImages.set(key, []);
        }

        // Add to image array instead of replacing
        this.variationImages.get(key).push(imageData);
        
        // Mark the template view as having custom images (existing code)
        const template = this.templates.get(this.activeTemplateId);
        const variation = template.variations.get(this.currentVariation.toString());
        const view = variation.views.get(this.currentView);
        view.has_custom_image = true;
        
        // Handle copying to other variations if this is the default variation
        if (this.currentVariation != template.defaultVariation) return;
    
        template.variations.forEach(eachVariation => {
            if (eachVariation.is_default || this.hasCustomImage(eachVariation.id)) return;
    
            const variationKey = `${eachVariation.id}_${this.currentView}`;
            
            // Initialize array if needed
            if (!this.variationImages.has(variationKey)) {
                this.variationImages.set(variationKey, []);
            }
            
            // Add a deep copy of the image data (without fabricImage reference)
            const imageCopy = {...imageData};
            delete imageCopy.fabricImage; // We'll create a new fabric instance when loading
            this.variationImages.get(variationKey).push(imageCopy);
        });
        
        return imageId; // Return the ID so we can reference this specific image
    }

    removeViewImage(imageId = null) {
        if (!this.currentView || !this.currentVariation) return;
    
        const key = `${this.currentVariation}_${this.currentView}`;
        const imagesArray = this.variationImages.get(key);
        
        if (!imagesArray || imagesArray.length === 0) return;
        
        if (imageId) {
            // Remove specific image by ID
            const index = imagesArray.findIndex(img => img.id === imageId);
            if (index !== -1) {
                // Remove from canvas if it exists
                const imageData = imagesArray[index];
                if (imageData.fabricImage) {
                    this.fabricCanvas.remove(imageData.fabricImage);
                }
                // Remove from array
                imagesArray.splice(index, 1);
            }
        } else {
            // Remove all images (backward compatibility)
            imagesArray.forEach(imageData => {
                if (imageData.fabricImage) {
                    this.fabricCanvas.remove(imageData.fabricImage);
                }
            });
            imagesArray.length = 0; // Clear the array
        }
        
        // Update has_custom_image flag if needed
        if (imagesArray.length === 0) {
            const template = this.templates.get(this.activeTemplateId);
            const variation = template.variations.get(this.currentVariation.toString());
            const view = variation.views.get(this.currentView);
            view.has_custom_image = false;
            
            // Also remove from other variations if this is default
            if (this.currentVariation == template.defaultVariation) {
                template.variations.forEach(eachVariation => {
                    if (eachVariation.is_default) return;
                    
                    const variationKey = `${eachVariation.id}_${this.currentView}`;
                    const variationImages = this.variationImages.get(variationKey);
                    
                    if (variationImages && variationImages.length > 0) {
                        variationImages.forEach(img => {
                            if (img.fabricImage) {
                                this.fabricCanvas.remove(img.fabricImage);
                            }
                        });
                        variationImages.length = 0;
                    }
                    
                    const variationView = eachVariation.views.get(this.currentView);
                    if (variationView) {
                        variationView.has_custom_image = false;
                    }
                });
            }
        }
        
        // Render canvas to reflect changes
        this.fabricCanvas.renderAll();
    }

    loadViewImage() {
        if (!this.currentView || !this.currentVariation) return;

        const key = `${this.currentVariation}_${this.currentView}`;
        const imagesArray = this.variationImages.get(key);

        if (!imagesArray || imagesArray.length === 0) return;

        // Get template and variation data for filter settings
        const template = this.templates.get(this.activeTemplateId);
        const variation = template.variations.get(this.currentVariation.toString());
        const isDarkShirt = variation.is_dark_shirt === true;

        // Load each image
        imagesArray.forEach((imageData) => {
            const alreadyOnCanvas = imageData.fabricImage && this.fabricCanvas.contains(imageData.fabricImage);

            // Skip if we already have this image on canvas (avoids duplicates)
            if (alreadyOnCanvas) {
                return;
            }

            // If we have a URL but no fabric instance, create one
            if (imageData.url && !imageData.fabricImage) {
                fabric.Image.fromURL(imageData.url, (img) => {
                    // Store the fabricImage reference
                    imageData.fabricImage = img;

                    // Apply common settings and load the image
                    this.configureAndLoadFabricImage(imageData, isDarkShirt);
                });
            } else if (imageData.fabricImage) {
                // We have a fabric instance already, just configure and add
                this.configureAndLoadFabricImage(imageData, isDarkShirt);
            }
        });
    }

    configureAndLoadFabricImage(imageData, isDarkShirt) {
        const img = imageData.fabricImage;
        img.filters = [];

        img.set({
            originX: 'center',
            originY: 'center',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerColor: '#007cba',
            borderColor: '#007cba',
            cornerStrokeColor: '#fff',
            padding: 5,
            preserveAspectRatio: true,
            visible: imageData.visible !== undefined ? imageData.visible : true,
            ...(isDarkShirt
                ? { globalCompositeOperation: 'screen', opacity: 0.95 }
                : { globalCompositeOperation: 'multiply', opacity: 0.8 })
        });

        this._applyTransform(img, imageData.transform);
        // Normalize to zone-relative immediately — legacy formats are a one-time migration read path.
        // After this line imageData.transform is guaranteed to be {zx,zy,sw,angle,nw,nh}.
        imageData.transform = this._imgToTransform(img);

        if (isDarkShirt) {
            img.filters.push(
                new fabric.Image.filters.Contrast({ contrast: 0.15 }),
                new fabric.Image.filters.BlendColor({ color: '#ffffff', mode: 'screen', alpha: 0.1 })
            );
        } else {
            img.filters.push(
                new fabric.Image.filters.Brightness({ brightness: -0.05 }),
                new fabric.Image.filters.Contrast({ contrast: 0.1 }),
                new fabric.Image.filters.BlendColor({ color: '#ffffff', mode: 'multiply', alpha: 0.9 })
            );
        }

        img.applyFilters();
        this.bindImageEvents(img);
        this.fabricCanvas.add(img);
        img.setCoords();
        this.fabricCanvas.renderAll();
    }

    hasCustomImage(variationId) {

        const variation = this.templates.get(this.activeTemplateId).variations.get(variationId.toString());
        const view = variation.views.get(this.currentView);
        return view.has_custom_image;
        
    }

    copyImageFromDefaultVariation(targetVariationId) {
        const template = this.templates.get(this.activeTemplateId);
        const defaultVariation = template.variations.find(v => v.is_default);
        
        const defaultImageData = this.variationImages.get(`${defaultVariation.id}_${this.currentView}`);
        if (defaultImageData) {
            this.variationImages.set(`${targetVariationId}_${this.currentView}`, {...defaultImageData});
        }
    }

    bindImageEvents(img) {
        if (this._boundImages.has(img)) return;
        this._boundImages.add(img);

        img.on('scaling', (event) => {
            // Maintain aspect ratio
            if (img.scaleX !== img.scaleY) {
                const avgScale = (img.scaleX + img.scaleY) / 2;
                img.set({
                    scaleX: avgScale,
                    scaleY: avgScale
                });
            }
            
            // Update input fields during scaling
            if (this.widthInput && this.heightInput) {
                this.widthInput.value = Math.round(img.width * img.scaleX);
                this.heightInput.value = Math.round(img.height * img.scaleY);
                
                // Update physical dimensions display
                this.updatePixelToCmConversion();
            }
            
            // Update toolbar position
            this.updateToolbarPosition();
        });

        img.on('modified', () => {
            // Maintain aspect ratio
            if (img.scaleX !== img.scaleY) {
                const avgScale = (img.scaleX + img.scaleY) / 2;
                img.set({
                    scaleX: avgScale,
                    scaleY: avgScale
                });
            }
    
            // Update input fields
            if (this.widthInput && this.heightInput) {
                this.widthInput.value = Math.round(img.width * img.scaleX);
                this.heightInput.value = Math.round(img.height * img.scaleY);
                
                // Update physical dimensions display
                this.updatePixelToCmConversion();
            }
    
            // Find and update the corresponding image data
            this.updateImageTransform(img);
            
            this.fabricCanvas.renderAll();
            this.updateToolbarPosition();
        });

        img.on('selected', () => {
            img.set({
                borderColor: '#007cba',
                cornerColor: '#007cba'
            });
            this.showToolbar();
        });

        img.on('deselected', () => {
            img.set({
                borderColor: '#d2d2d2',
                cornerColor: '#d2d2d2'
            });
            this.hideToolbar();
        });

        img.on('moving', () => {
            this.updateToolbarPosition();
        });
    }

    updateImageTransform(img) {
        if (!this.currentView || !this.currentVariation) return;
        
        const key = `${this.currentVariation}_${this.currentView}`;
        const imagesArray = this.variationImages.get(key);
        
        if (!imagesArray) return;
        
        // Find the image by reference or by ID
        const imageData = imagesArray.find(data => 
            data.fabricImage === img || (img.data && img.data.imageId === data.id)
        );
        
        if (imageData) {
            imageData.transform = this._imgToTransform(img);
        }
    }

    setupNavigationEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.type === 'fiverr') {
                    window.open('https://fiverr.com', '_blank');
                    return;
                }

                this.navItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');

                const sectionType = item.dataset.type;
                this.sectionContents.forEach(section => {
                    section.classList.toggle('hidden', section.dataset.section !== sectionType);
                });
            });
        });
    }

    showToolbar() {
        const activeObject = this.fabricCanvas.getActiveObject();
        if (!activeObject) return;

        // Update dimension inputs
        this.widthInput.value = Math.round(activeObject.width * activeObject.scaleX);
        this.heightInput.value = Math.round(activeObject.height * activeObject.scaleY);
        
        // Update physical dimensions display
        this.updatePixelToCmConversion();

        this.imageToolbar.classList.add('visible');
        this.updateToolbarPosition();
    }
    
    hideToolbar() {
        this.imageToolbar.classList.remove('visible');
    }
    
    updateToolbarPosition() {
        const activeObject = this.fabricCanvas.getActiveObject();
        if (!activeObject) return;
    
        // Get canvas container (wrapper) rect
        const containerRect = this.canvas.parentNode.getBoundingClientRect();
        
        // Get object coordinates relative to canvas
        const objCoords = activeObject.getBoundingRect();
        const zoom = this.fabricCanvas.getZoom();
        const pan = this.fabricCanvas.viewportTransform;
    
        // Calculate absolute position considering zoom and pan
        const absoluteLeft = (objCoords.left * zoom) + pan[4];
        const absoluteTop = (objCoords.top * zoom) + pan[5];
        const absoluteWidth = objCoords.width * zoom;
        
        // Position the toolbar relative to the canvas container
        this.imageToolbar.style.left = `${absoluteLeft + (absoluteWidth / 2)}px`;
        this.imageToolbar.style.top = `${absoluteTop - this.imageToolbar.offsetHeight - 10}px`;
    }

    setupUploadEvents() {
        // Setup drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadZone.style.backgroundColor = '#f8f8f8';
        });

        this.uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadZone.style.backgroundColor = '';
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadZone.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });

        // Setup click to upload
        this.uploadZone.addEventListener('click', () => {
            this.uploadInput.click();
        });

        this.uploadInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        if (!files.length) return;

        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const maxImages = 20; // Match server-side limit
        const currentImages = this.imagesGrid.querySelectorAll('.library-image-item').length;

        if (currentImages >= maxImages) {
            alert('Maximum number of images reached');
            return;
        }

        for (const file of Array.from(files)) {
            // Validate file type and size
            if (!allowedTypes.includes(file.type)) {
                alert('Only JPG and PNG files are allowed');
                continue;
            }

            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                continue;
            }

            if (currentImages + files.length > maxImages) {
                alert(`Can only add ${maxImages - currentImages} more images`);
                break;
            }

            // For non-logged in users, handle files in memory
            if (!this.isLoggedIn) {
                this.handleTempImageUpload(file);
                continue;
            }

            try {
                // Create FormData and upload to server for logged-in users
                const formData = new FormData();
                formData.append('action', 'upload_user_image');
                formData.append('nonce', octoPrintDesigner.nonce);
                formData.append('image', file);

                const response = await fetch(octoPrintDesigner.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                
                if (data.success) {
                    // Add image to grid with server-generated ID
                    this.addImageToGrid(data.data.url, data.data.id);
                } else {
                    throw new Error(data.data.message || 'Error uploading image');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Failed to upload image: ' + error.message);
            }
        }
    }

    // Handle temporary image upload for non-logged users
    handleTempImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            const tempId = `temp-${++this.tempImageCounter}`;
            
            // Store in tempImages array
            this.tempImages.push({
                id: tempId,
                url: imageUrl,
                file: file
            });
            
            // Add to grid with temporary flag
            this.addImageToGrid(imageUrl, tempId, true);
        };
        reader.readAsDataURL(file);
    }

    // Remove a temporary image by ID
    removeTempImage(tempId) {
        const index = this.tempImages.findIndex(img => img.id === tempId);
        if (index !== -1) {
            this.tempImages.splice(index, 1);
        }
    }

    updateImagesGridLimit() {
        const maxImages = 25;
        const currentImages = this.imagesGrid.querySelectorAll('.library-image-item').length;
        this.imagesGridLimit.innerHTML = `${currentImages}/<b>${maxImages}</b>`;
    }

    setupDesignerToolbar(){

        if (!this.togglePrintZoneButton) {
            console.error('ERROR: togglePrintZoneButton not found! Cannot setup print zone toggle.');
            return;
        }

        this.togglePrintZoneButton.classList.toggle('active', this.isPrintingVisible);

        this.togglePrintZoneButton.addEventListener('click', () => {
            console.log('🔘 PRINT ZONE TOGGLE DEBUG START:');
            console.log('  - Before toggle: isPrintingVisible =', this.isPrintingVisible);

            this.isPrintingVisible = !this.isPrintingVisible || false;

            console.log('  - After toggle: isPrintingVisible =', this.isPrintingVisible);
            console.log('  - printingZoneElement exists:', !!this.printingZoneElement);
            console.log('  - Canvas objects before:', this.fabricCanvas.getObjects().length);

            this.togglePrintZoneButton.classList.toggle('active', this.isPrintingVisible);

            if( this.isPrintingVisible ) {
                console.log('  ✅ Adding print zone to canvas');
                this.fabricCanvas.add(this.printingZoneElement);
                console.log('  - Print zone position on canvas:', this.printingZoneElement.left, ',', this.printingZoneElement.top);
                console.log('  - Print zone size on canvas:', this.printingZoneElement.width, 'x', this.printingZoneElement.height);
            } else {
                console.log('  ❌ Removing print zone from canvas');
                this.fabricCanvas.remove(this.printingZoneElement);
            }

            console.log('  - Canvas objects after:', this.fabricCanvas.getObjects().length);
            this.fabricCanvas.renderAll();
            console.log('🔘 PRINT ZONE TOGGLE DEBUG END');
        });
    }


    setupZoomControls() {
        let zoomTimeout;
        const minZoom = 10;  // 10%
        const maxZoom = 200; // 200%
        const step = 10;     // 10% steps
    
        // Setup zoom buttons
        this.zoomButtons.forEach(button => {
            button.addEventListener('click', () => {
                const currentZoom = parseInt(this.zoomInput.value);
                const newZoom = button.dataset.zoomType === 'in' 
                    ? Math.min(currentZoom + step, maxZoom)
                    : Math.max(currentZoom - step, minZoom);
                    
                this.updateZoom(newZoom);
            });
        });
    
        // Setup zoom input
        this.zoomInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            // Ensure value is within bounds
            value = Math.max(minZoom, Math.min(maxZoom, value));
            // Ensure value is a multiple of step
            value = Math.round(value / step) * step;
            this.updateZoom(value);
        });
    
        // Setup zoom range in popup
        this.zoomRange.addEventListener('input', (e) => {
            this.updateZoom(parseInt(e.target.value));
        });
    
        // Show/hide zoom popup
        this.zoomInput.addEventListener('focus', () => {
            clearTimeout(zoomTimeout);
            this.zoomPopup.classList.remove('hidden');
            this.zoomRange.focus();
        });
    
        this.zoomRange.addEventListener('blur', () => {
            zoomTimeout = setTimeout(() => {
                this.zoomPopup.classList.add('hidden');
            }, 200);
        });
    }

    updateZoom(percentage) {
        // Update inputs with percentage value
        this.zoomInput.value = percentage;
        this.zoomRange.value = percentage;
        
        // Convert percentage to zoom factor (100% = 1.0)
        const zoom = percentage / 100;
        
        // Get the canvas center
        const center = {
            x: this.fabricCanvas.width / 2,
            y: this.fabricCanvas.height / 2
        };
    
        // Apply zoom from center
        this.fabricCanvas.zoomToPoint(center, zoom);
        this.fabricCanvas.renderAll();
    
        // Update any UI elements that depend on zoom level
        if (this.imageToolbar?.classList.contains('visible')) {
            this.updateToolbarPosition();
        }
    }

    handleResize() {
        
        // Check if mobile view (under 950px)
        this.isMobile = window.innerWidth <= 950;
        
        // Toggle section visibility based on viewport
        if (!this.isMobile) this.sectionItemsContainer.classList.remove('hidden');
        
        // Add click handlers for mobile navigation
        this.navItems.forEach(item => {
            const originalClickHandler = item.onclick;
            item.onclick = (e) => {
                if (this.isMobile && item.dataset.type !== 'fiverr') this.sectionItemsContainer.classList.toggle('hidden');
                if (originalClickHandler) originalClickHandler(e);
            };
        });
    
        // Reload current view to adjust positions
        if (this.currentView) {
            this.loadTemplateView(this.currentView);
        }
    }

    // Add these new methods to DesignerWidget class
    storeModalElements() {
        this.saveDesignModal = document.getElementById('saveDesignModal');
        if (!this.saveDesignModal) return;

        this.modalNameInput = this.saveDesignModal.querySelector('#designName');
        this.modalDesignId = this.saveDesignModal.querySelector('#designId');
        this.modalSaveButton = this.saveDesignModal.querySelector('.designer-modal-save');
        this.modalCancelButton = this.saveDesignModal.querySelector('.designer-modal-cancel');
        this.modalCloseButton = this.saveDesignModal.querySelector('.designer-modal-close');
    }

    setupModalEvents() {
        if (!this.saveDesignModal) return;

        // Save button in footer
        const saveButton = this.container.querySelector('.designer-editor footer .designer-action-button');
        saveButton.addEventListener('click', () => this.showSaveModal());

        // Modal events - Modified to show PNGs instead of redirect
        this.modalSaveButton.addEventListener('click', () => this.saveDesignWithPNGDisplay());
        this.modalCancelButton.addEventListener('click', () => this.hideModal());
        this.modalCloseButton.addEventListener('click', () => this.hideModal());
        
        // Close on overlay click
        this.saveDesignModal.querySelector('.designer-modal-overlay')
            .addEventListener('click', () => this.hideModal());

        // Prevent modal close when clicking modal content
        this.saveDesignModal.querySelector('.designer-modal-content')
            .addEventListener('click', e => e.stopPropagation());
    }

    showSaveModal() {

        if (!this.isLoggedIn) {
            this.showLoginModal();
            return;
        }

        if (!this.activeTemplateId) {
            alert('Please select a template first');
            return;
        }

        this.saveDesignModal.classList.remove('hidden');
        this.modalNameInput.focus();
    }

    showLoginModal() {

        try{
            elementorProFrontend.modules.popup.showPopup( { id: 1831 } );
        }catch(e){
        }

        // const loginModal = document.getElementById('loginRequiredModal');
        // if (!loginModal) return;

        // // Disable all interactions with the designer
        // this.container.querySelectorAll('button, input, a').forEach(element => {
        //     if (!element.closest('#loginRequiredModal')) {
        //         element.style.pointerEvents = 'none';
        //     }
        // });

        // loginModal.classList.remove('hidden');
    }

    hideModal() {
        this.saveDesignModal.classList.remove('loading');
        this.saveDesignModal.classList.add('hidden');
    }

    async generateAndShowPNG() {
        try {
            console.log('🎨 PNG Generation: Starting PNG generation from save button...');

            // Check if PNG generator is available
            if (typeof window.generatePNGForDownload === 'function') {
                console.log('✅ PNG Generation: generatePNGForDownload function found');

                // Generate PNG using the existing function
                const pngDataUrl = await window.generatePNGForDownload();

                if (pngDataUrl) {
                    this.displayPNGPreview(pngDataUrl);
                } else {
                    throw new Error('PNG generation returned empty result');
                }
            } else {
                throw new Error('PNG generation function not available');
            }
        } catch (error) {
            console.error('❌ PNG Generation Error:', error);
            alert('Failed to generate PNG: ' + error.message);
        }
    }

    displayPNGPreview(pngDataUrl) {
        // Create modal overlay for PNG preview
        const pngModal = document.createElement('div');
        pngModal.className = 'designer-modal png-preview-modal';
        pngModal.innerHTML = `
            <div class="designer-modal-overlay"></div>
            <div class="designer-modal-content" style="max-width: 80%; max-height: 80%;">
                <div class="designer-modal-header">
                    <h3>Generated PNG Preview</h3>
                    <button type="button" class="designer-modal-close">
                        <img src="${window.octo_print_designer_url}/public/img/close.svg" alt="Close Modal" />
                    </button>
                </div>
                <div class="designer-modal-body" style="text-align: center; padding: 20px;">
                    <img src="${pngDataUrl}" alt="Generated PNG" style="max-width: 100%; max-height: 400px; border: 1px solid #ddd; border-radius: 4px;" />
                </div>
                <div class="designer-modal-footer">
                    <a href="${pngDataUrl}" download="design.png" class="designer-action-button">
                        Download PNG
                    </a>
                    <button type="button" class="designer-action-button designer-modal-close" style="margin-left: 10px;">
                        Close
                    </button>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(pngModal);

        // Setup close events
        const closeButtons = pngModal.querySelectorAll('.designer-modal-close');
        const overlay = pngModal.querySelector('.designer-modal-overlay');

        const closePNGModal = () => {
            document.body.removeChild(pngModal);
        };

        closeButtons.forEach(button => button.addEventListener('click', closePNGModal));
        overlay.addEventListener('click', closePNGModal);

        // Show modal
        setTimeout(() => pngModal.classList.add('show'), 10);
    }

    async saveDesignWithPNGDisplay() {
        const success = await this.saveDesignInternal();
        if (success) {
            // Brief pause so the success toast is visible, then go to dashboard
            setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
        }
    }

    async saveDesignInternal() {
        // Skip save for non-logged users
        if (!this.isLoggedIn) {
            this.showLoginModal();
            return;
        }
        
        const name = this.modalNameInput.value.trim();
        if (!name) {
            alert('Please enter a name for your design');
            return;
        }
    
        try {
            this.saveDesignModal.classList.add('loading');
            
            // Collect the current design state
            const designData = this.collectDesignState();
    
            const formData = new FormData();
            formData.append('action', 'save_design');
            formData.append('nonce', octoPrintDesigner.nonce);
            formData.append('template_id', this.activeTemplateId);
            formData.append('name', name);
            formData.append('design_data', JSON.stringify(designData));
            
            if (this.currentDesignId) {
                formData.append('design_id', this.currentDesignId);
                
                // For existing designs, capture all view previews if we're updating the design
                const previews = await this.captureAllViewsPreviews();
                let viewIndex = 0;
                
                for (const viewId in previews) {
                    const preview = previews[viewId];
                    formData.append(`preview_image_${viewId}`, preview.blob, `preview_${viewId}.png`);
                    formData.append(`preview_view_${viewId}`, viewId);
                    formData.append(`preview_view_name_${viewId}`, preview.viewName);
                    viewIndex++;
                }
                
                formData.append('preview_count', viewIndex); // Add count of previews
            } else {
                // For new designs, capture all view previews
                const previews = await this.captureAllViewsPreviews();
                let viewIndex = 0;
                
                for (const viewId in previews) {
                    const preview = previews[viewId];
                    formData.append(`preview_image_${viewId}`, preview.blob, `preview_${viewId}.png`);
                    formData.append(`preview_view_${viewId}`, viewId);
                    formData.append(`preview_view_name_${viewId}`, preview.viewName);
                    viewIndex++;
                }
                
                formData.append('preview_count', viewIndex); // Add count of previews
            }
    
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
    
            const data = await response.json();
            
            if (data.success) {
                this.toastManager.show('Design saved!', 'success');
                this.currentDesignId = data.data.design_id;

                // Generate print-ready PNG files after successful save - ENHANCED MULTI-VIEW INTEGRATION
                try {
                    console.log('🖨️ Generating print-ready PNG files with validated design ID...');

                    // Use enhanced PNG generation function with design ID validation
                    if (typeof window.generatePNGForSave === 'function') {
                        console.log('🎯 Using enhanced multi-view PNG generation with design ID:', this.currentDesignId);

                        const pngResult = await window.generatePNGForSave(this.currentDesignId);

                        if (pngResult && pngResult.success) {
                            console.log('✅ Multi-view PNG generation completed successfully!');
                            console.log(`📊 Generated: ${pngResult.totalGenerated} PNGs, Uploaded: ${pngResult.successfulUploads}/${pngResult.totalGenerated}`);

                            // Log all successful PNG URLs
                            if (pngResult.urls && pngResult.urls.length > 0) {
                                console.log('🔗 All PNG URLs:', pngResult.urls);

                                // Store PNG URLs in designer instance for future reference
                                this._savedPNGs = {
                                    designId: this.currentDesignId,
                                    urls: pngResult.urls,
                                    uploads: pngResult.uploads,
                                    timestamp: Date.now()
                                };
                            }

                            // No legacy "main" PNG - all views are equal

                            // Handle partial failures
                            if (pngResult.failedUploads > 0) {
                                console.warn(`⚠️ ${pngResult.failedUploads} PNG uploads failed - check individual errors above`);
                            }

                        } else {
                            throw new Error('Multi-view PNG generation failed');
                        }
                    }
                    // Fallback to old system if new function not available
                    else if (typeof window.generatePNGForDownload === 'function') {
                        console.warn('⚠️ Falling back to legacy PNG generation');

                        const pngDataUrl = await window.generatePNGForDownload();

                        if (pngDataUrl) {
                            // Send PNG to backend for storage
                            const pngFormData = new FormData();
                            pngFormData.append('action', 'save_design_png');
                            pngFormData.append('nonce', octoPrintDesigner.nonce);
                            pngFormData.append('design_id', this.currentDesignId);

                            // Convert data URL to blob
                            const response = await fetch(pngDataUrl);
                            const blob = await response.blob();
                            pngFormData.append('png_file', blob, `design_${this.currentDesignId}.png`);

                            const pngResponse = await fetch(octoPrintDesigner.ajaxUrl, {
                                method: 'POST',
                                body: pngFormData
                            });

                            const pngData = await pngResponse.json();

                            if (pngData.success) {
                                console.log('✅ Legacy PNG saved successfully!');
                                console.log('📁 PNG file location:', pngData.data.file_url);
                                console.log('💾 PNG file path:', pngData.data.file_path);
                            } else {
                                console.warn('⚠️ Legacy PNG save failed:', pngData.data.message);
                            }
                        } else {
                            console.warn('⚠️ Legacy PNG generation returned empty result');
                        }
                    } else {
                        console.warn('⚠️ No PNG generation function available');
                    }
                } catch (pngError) {
                    console.error('❌ PNG generation/save error:', pngError);
                    // Don't block the redirect if PNG fails
                }

                // Store redirect URL for later use but don't redirect
                this._redirectUrl = data.data.redirect_url;
                console.log('💾 Design saved successfully, redirect URL stored:', this._redirectUrl);

                // Return success for PNG display handling
                return true;
    
            } else {
                throw new Error(data.data.message || 'Error saving design');
            }
        } catch (error) {
            this.toastManager.show('Error while saving the design', 'error', { duration: null });
            console.error('Error saving design:', error);
            alert('Failed to save design: ' + error.message);
        } finally {
            this.saveDesignModal.classList.remove('loading');
        }

        return false; // Return false if save failed
    }

    showPNGDisplay(pngData) {
        // Hide save modal
        this.hideModal();

        console.log('🖼️ Displaying generated PNGs:', pngData);

        // Create enhanced PNG display modal with debug info
        const pngModal = document.createElement('div');
        pngModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 95%; max-height: 95%; overflow: auto; font-family: monospace;">
                    <h2>🎉 Design saved! Generated PNGs with Debug Info:</h2>
                    <div id="png-display-container"></div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="png-continue-btn" style="background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">Continue to Dashboard</button>
                        <button id="png-close-btn" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(pngModal);

        // Add PNG images with enhanced debug information
        const container = pngModal.querySelector('#png-display-container');
        if (pngData.urls && pngData.urls.length > 0) {
            // Get template and print zone information for comparison
            const designer = this;
            const template = designer.templates?.get(designer.activeTemplateId);
            const variation = template?.variations?.get(designer.currentVariation?.toString());

            pngData.uploads.forEach((upload, index) => {
                if (upload.success && upload.url) {
                    // Get view data for debug info
                    const viewData = variation?.views?.get(upload.viewId.toString());

                    const pngDiv = document.createElement('div');
                    pngDiv.style.marginBottom = '30px';
                    pngDiv.style.border = '2px solid #ddd';
                    pngDiv.style.padding = '15px';
                    pngDiv.style.borderRadius = '5px';

                    // Create placeholder for image dimensions (will be updated when image loads)
                    const imageDebugId = `image-debug-${index}`;

                    pngDiv.innerHTML = `
                        <h3 style="color: #007cba; margin: 0 0 15px 0;">📋 ${upload.viewName} View (${upload.viewId})</h3>

                        <div style="display: flex; gap: 20px; align-items: flex-start;">
                            <div style="flex-shrink: 0;">
                                <h4>🖼️ Generated PNG:</h4>
                                <img id="png-img-${index}" src="${upload.url}" style="max-width: 250px; max-height: 250px; border: 1px solid #ccc; display: block; margin: 5px 0;">
                                <div style="font-size: 12px; color: #666;">
                                    <div>📏 <span id="${imageDebugId}">Loading dimensions...</span></div>
                                    <div>🔗 <a href="${upload.url}" target="_blank" style="color: #007cba;">Open in new tab</a></div>
                                </div>
                            </div>

                            <div style="flex: 1;">
                                <h4>🔍 Debug Information:</h4>
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 3px; font-size: 12px; line-height: 1.4;">
                                    ${viewData ? `
                                        <div><strong>📐 Template Print Zone:</strong></div>
                                        <div style="margin-left: 15px;">
                                            ${viewData.safeZone ? `
                                                <div>• Size: ${viewData.safeZone.width}×${viewData.safeZone.height}px</div>
                                                <div>• Position: (${viewData.safeZone.left}, ${viewData.safeZone.top})</div>
                                            ` : '<div>• No safeZone data</div>'}
                                        </div>
                                        <br>
                                    ` : ''}

                                    <div><strong>📸 Generated PNG Details:</strong></div>
                                    <div style="margin-left: 15px;" id="png-details-${index}">
                                        <div>• Loading PNG analysis...</div>
                                    </div>
                                    <br>

                                    <div><strong>✅ Validation Status:</strong></div>
                                    <div style="margin-left: 15px;" id="validation-${index}">
                                        <div>• Checking size match...</div>
                                    </div>

                                    ${upload.error ? `
                                        <br>
                                        <div><strong>❌ Upload Errors:</strong></div>
                                        <div style="margin-left: 15px; color: #d32f2f;">
                                            <div>${upload.error}</div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    container.appendChild(pngDiv);

                    // Load image and analyze its dimensions
                    const img = pngDiv.querySelector(`#png-img-${index}`);
                    img.onload = function() {
                        const imageDimensions = `${this.naturalWidth}×${this.naturalHeight}px`;
                        document.getElementById(imageDebugId).textContent = imageDimensions;

                        // Update PNG details
                        const pngDetails = document.getElementById(`png-details-${index}`);
                        const fileSize = upload.url.includes('data:') ?
                            Math.round(upload.url.length * 0.75 / 1024) : 'Unknown';

                        pngDetails.innerHTML = `
                            <div>• Dimensions: ${this.naturalWidth}×${this.naturalHeight}px</div>
                            <div>• Multiplier: 4.17× (300 DPI)</div>
                            <div>• Method: Visual Canvas Snapshot</div>
                            ${fileSize !== 'Unknown' ? `<div>• Estimated Size: ${fileSize}KB</div>` : ''}
                        `;

                        // Update validation
                        const validation = document.getElementById(`validation-${index}`);
                        if (viewData?.safeZone) {
                            const expectedWidth = Math.round(viewData.safeZone.width * 4.17);
                            const expectedHeight = Math.round(viewData.safeZone.height * 4.17);
                            const widthMatch = Math.abs(this.naturalWidth - expectedWidth) <= 2;
                            const heightMatch = Math.abs(this.naturalHeight - expectedHeight) <= 2;

                            validation.innerHTML = `
                                <div style="color: ${widthMatch ? '#4caf50' : '#d32f2f'};">
                                    • Width: ${this.naturalWidth}px ${widthMatch ? '✅' : '❌'} (expected ~${expectedWidth}px)
                                </div>
                                <div style="color: ${heightMatch ? '#4caf50' : '#d32f2f'};">
                                    • Height: ${this.naturalHeight}px ${heightMatch ? '✅' : '❌'} (expected ~${expectedHeight}px)
                                </div>
                                <div style="color: ${widthMatch && heightMatch ? '#4caf50' : '#d32f2f'};">
                                    • Overall: ${widthMatch && heightMatch ? 'MATCH ✅' : 'MISMATCH ❌'}
                                </div>
                            `;
                        } else {
                            validation.innerHTML = `
                                <div>• No template data available for comparison</div>
                                <div>• PNG generated successfully ✅</div>
                            `;
                        }
                    };
                }
            });
        } else {
            container.innerHTML = '<p style="color: #d32f2f; text-align: center; padding: 20px;">❌ No PNGs were generated. Check console for errors.</p>';
        }

        // Event listeners
        pngModal.querySelector('#png-continue-btn').addEventListener('click', () => {
            document.body.removeChild(pngModal);
            if (this._redirectUrl) {
                window.location.href = this._redirectUrl;
            }
        });

        pngModal.querySelector('#png-close-btn').addEventListener('click', () => {
            document.body.removeChild(pngModal);
        });
    }

    collectDesignState() {
        // Create an object representing the current state of the design
        const state = {
            templateId: this.activeTemplateId,
            currentVariation: this.currentVariation,
            currentView: this.currentView,
            variationImages: {}
        };
    
        // Convert the variationImages Map to a plain object with arrays
        for (const [key, imagesArray] of this.variationImages) {
            if (!imagesArray || imagesArray.length === 0) continue;

            state.variationImages[key] = imagesArray.map(imageData => {
                const t = imageData.transform;
                if (t && ('left' in t || 'top' in t) && ('zx' in t || 'zy' in t)) {
                    console.error('INVALID MIXED TRANSFORM STATE detected before save:', key, t);
                }
                return {
                    id: imageData.id,
                    url: imageData.url,
                    transform: imageData.transform,
                    visible: imageData.visible !== undefined ? imageData.visible : true,
                };
            });
        }
    
        return state;
    }

    async captureCanvasPreview() {
        // Create temporary canvas for preview 
        const tempCanvasElement = document.createElement('canvas');
        const tempCanvas = new fabric.Canvas(tempCanvasElement, {
            width: 500,
            height: 500,
            backgroundColor: 'white'
        });
    
        try {
            // Get the current template view settings
            const template = this.templates.get(this.activeTemplateId);
            const variation = template.variations.get(this.currentVariation.toString());
            const view = variation.views.get(this.currentView);
    
            // Add template background with same settings as main canvas
            const backgroundImage = await Image.fromURL(view.image_url);
            if (backgroundImage) {
                backgroundImage.set({
                ...view.imageZone,
                selectable: false,
                evented: false,
                left: view.imageZone.left * tempCanvas.width / 100,
                top: view.imageZone.top * tempCanvas.height / 100,
                originX: 'center',
                originY: 'center'
            });
    
                // Add color overlay if enabled
                if (view.colorOverlayEnabled) {
                    backgroundImage.filters.push(new fabric.Image.filters.BlendColor({
                        color: variation?.color,
                        mode: 'multiply',
                        alpha: view.overlayOpacity || 0.5
                    }));
                    backgroundImage.applyFilters();
                }

                tempCanvas.add(backgroundImage);
            }
    
            // Get current user images for this view
            const key = `${this.currentVariation}_${this.currentView}`;
            const imagesArray = this.variationImages.get(key) || [];
            
            // Zone geometry for temp canvas — uses the same pipeline as the main canvas.
            // _getZone scales safeZone pixel values by the canvas ratio automatically.
            const tempZone = this._getZone(tempCanvas, view);

            // Create clipPath with adjusted dimensions (derived from tempZone for consistency)
            const clipPath = new fabric.Rect({
                left: tempZone.cx,
                top: tempZone.cy,
                width: tempZone.w,
                height: tempZone.h,
                absolutePositioned: true,
                fill: 'transparent',
                selectable: false,
                evented: false,
                originX: 'center',
                originY: 'center'
            });

            // Add each image to the preview canvas
            for (const imageData of imagesArray) {
                if (!imageData.visible || !imageData.url) continue;

                // Load the image
                const userImage = await Image.fromURL(imageData.url);
                if (!userImage) continue;

                // Apply transform via the canonical pipeline — same function as main canvas render.
                // Any legacy format is handled by _applyTransform's migration read path.
                this._applyTransform(userImage, imageData.transform, tempZone);
                userImage.set({ originX: 'center', originY: 'center', clipPath: clipPath });
                
                // Apply dark/light shirt filters if needed
                const isDarkShirt = variation.is_dark_shirt === true;
                if (isDarkShirt) {
                    userImage.filters.push(
                        new fabric.Image.filters.Contrast({ contrast: 0.15 }),
                        new fabric.Image.filters.BlendColor({
                            color: '#ffffff',
                            mode: 'screen',
                            alpha: 0.1
                        })
                    );
                    userImage.set({
                        globalCompositeOperation: 'screen',
                        opacity: 0.95
                    });
                } else {
                    userImage.filters.push(
                        new fabric.Image.filters.Brightness({ brightness: -0.05 }),
                        new fabric.Image.filters.Contrast({ contrast: 0.1 }),
                        new fabric.Image.filters.BlendColor({
                            color: '#ffffff',
                            mode: 'multiply',
                            alpha: 0.9
                        })
                    );
                    userImage.set({
                        globalCompositeOperation: 'multiply',
                        opacity: 0.8
                    });
                }
                
                userImage.applyFilters();
                tempCanvas.add(userImage);
            }
    
            tempCanvas.renderAll();
            return tempCanvas.toDataURL({
                format: 'png',
                quality: 0.8
            });
    
        } finally {
            tempCanvas.dispose();
        }
    }

    async captureAllViewsPreviews() {
        // Get the current template and variation
        const template = this.templates.get(this.activeTemplateId);
        if (!template) return {};

        const variation = template.variations.get(this.currentVariation.toString());
        if (!variation) return {};
        
        // Store the current view so we can restore it later
        const originalView = this.currentView;
        
        // Object to store all previews
        const previews = {};
        
        // Capture preview for each view
        for (const [viewId, view] of variation.views) {
            // Set current view to capture
            this.currentView = viewId;
            
            // Capture the preview
            const previewDataUrl = await this.captureCanvasPreview();
            
            // Convert data URL to blob
            const blob = await (await fetch(previewDataUrl)).blob();
            
            // Store the preview
            previews[viewId] = {
                viewId: viewId,
                viewName: view.name,
                blob: blob
            };
        }
        
        // Restore the original view
        this.currentView = originalView;

        return previews;
    }

    // 🖨️ PRINT ZONE EDITING SYSTEM
    setupModeSelectionEvents() {
        // Listen for mode selection buttons
        document.addEventListener('click', (e) => {
            const modeButton = e.target.closest('[data-mode]');
            if (!modeButton) return;

            const mode = modeButton.getAttribute('data-mode');
            this.switchEditingMode(mode);

            // Update button states
            document.querySelectorAll('[data-mode]').forEach(btn => btn.classList.remove('active'));
            modeButton.classList.add('active');
        });

        // Listen for reset buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.resetPrintZone')) {
                e.preventDefault();
                this.resetPrintZone();
            }
        });
    }

    switchEditingMode(mode) {
        console.log(`🔄 Switching to ${mode} mode`);
        this.editingMode = mode;

        // Clear existing zone overlays
        this.clearZoneOverlays();

        // Set up new editing mode
        switch (mode) {
            case 'image':
                this.enableImageEditing();
                break;
            case 'safezone':
                this.enableSafeZoneEditing();
                break;
            case 'printzone':
                this.enablePrintZoneEditing();
                break;
        }
    }

    enableImageEditing() {
        // Default image editing mode - objects are selectable and movable
        this.fabricCanvas.selection = true;
        this.fabricCanvas.getObjects().forEach(obj => {
            if (obj.type !== 'rect' || (!obj.isPrintZone && !obj.isSafeZone)) {
                obj.selectable = true;
                obj.evented = true;
            }
        });
        this.fabricCanvas.renderAll();
    }

    enableSafeZoneEditing() {
        this.fabricCanvas.selection = false;

        // Hide other objects
        this.fabricCanvas.getObjects().forEach(obj => {
            if (!obj.isSafeZone) {
                obj.selectable = false;
                obj.evented = false;
            }
        });

        this.showSafeZoneOverlay();
        this.fabricCanvas.renderAll();
    }

    enablePrintZoneEditing() {
        this.fabricCanvas.selection = false;

        // Hide other objects
        this.fabricCanvas.getObjects().forEach(obj => {
            if (!obj.isPrintZone) {
                obj.selectable = false;
                obj.evented = false;
            }
        });

        this.showPrintZoneOverlay();
        this.fabricCanvas.renderAll();
    }

    showPrintZoneOverlay() {
        if (this.printZoneRect) {
            this.fabricCanvas.remove(this.printZoneRect);
        }

        const view = this.getCurrentViewData();
        if (!view) return;

        // Use existing printZone data or create default based on safeZone
        const printZoneData = view.printZone || {
            left: view.safeZone?.left || 45,
            top: view.safeZone?.top || 40,
            width: (view.safeZone?.width || 240) + 20, // Slightly larger than safe zone
            height: (view.safeZone?.height || 320) + 40
        };

        this.printZoneRect = new Rect({
            left: printZoneData.left * this.fabricCanvas.width / 100,
            top: printZoneData.top * this.fabricCanvas.height / 100,
            width: printZoneData.width * this.fabricCanvas.width / 100,
            height: printZoneData.height * this.fabricCanvas.height / 100,
            fill: 'rgba(255, 0, 0, 0.2)',
            stroke: '#ff0000',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: true,
            evented: true,
            isPrintZone: true
        });

        this.fabricCanvas.add(this.printZoneRect);
        this.fabricCanvas.setActiveObject(this.printZoneRect);

        // Listen for modifications
        this.printZoneRect.on('modified', () => this.onPrintZoneModified());

        this.fabricCanvas.renderAll();

        console.log('🖨️ Print Zone Overlay created:', printZoneData);
    }

    showSafeZoneOverlay() {
        if (this.safeZoneRect) {
            this.fabricCanvas.remove(this.safeZoneRect);
        }

        const view = this.getCurrentViewData();
        if (!view || !view.safeZone) return;

        this.safeZoneRect = new Rect({
            left: view.safeZone.left * this.fabricCanvas.width / 100,
            top: view.safeZone.top * this.fabricCanvas.height / 100,
            width: view.safeZone.width,
            height: view.safeZone.height,
            fill: 'rgba(0, 255, 0, 0.2)',
            stroke: '#00ff00',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: true,
            evented: true,
            isSafeZone: true
        });

        this.fabricCanvas.add(this.safeZoneRect);
        this.fabricCanvas.setActiveObject(this.safeZoneRect);

        this.fabricCanvas.renderAll();
    }

    clearZoneOverlays() {
        if (this.printZoneRect) {
            this.fabricCanvas.remove(this.printZoneRect);
            this.printZoneRect = null;
        }
        if (this.safeZoneRect) {
            this.fabricCanvas.remove(this.safeZoneRect);
            this.safeZoneRect = null;
        }
    }

    onPrintZoneModified() {
        if (!this.printZoneRect) return;

        const printZoneData = {
            left: (this.printZoneRect.left / this.fabricCanvas.width) * 100,
            top: (this.printZoneRect.top / this.fabricCanvas.height) * 100,
            width: (this.printZoneRect.width * this.printZoneRect.scaleX / this.fabricCanvas.width) * 100,
            height: (this.printZoneRect.height * this.printZoneRect.scaleY / this.fabricCanvas.height) * 100
        };

        console.log('🖨️ Print Zone Modified:', printZoneData);

        // Save print zone data to view
        this.savePrintZoneToView(printZoneData);
    }

    savePrintZoneToView(printZoneData) {
        const template = this.templates.get(this.activeTemplateId);
        if (!template) return;

        const variation = template.variations.get(this.currentVariation.toString());
        if (!variation) return;

        const view = variation.views.get(this.currentView.toString());
        if (!view) return;

        // Update view with print zone data
        view.printZone = printZoneData;

        console.log('💾 Print Zone saved to view:', view.name, printZoneData);

        // Trigger save to database
        this.savePrintZoneToDatabase(printZoneData);
    }

    async savePrintZoneToDatabase(printZoneData) {
        try {
            const response = await fetch(window.octoPrintDesigner.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_template_print_zone',
                    nonce: window.octoPrintDesigner.nonce,
                    template_id: this.activeTemplateId,
                    variation_id: this.currentVariation,
                    view_id: this.currentView,
                    print_zone: JSON.stringify(printZoneData)
                })
            });

            const result = await response.json();

            if (result.success) {
                this.toastManager.show('Print Zone saved successfully!', 'success');
                console.log('✅ Print Zone saved to database');
            } else {
                this.toastManager.show('Failed to save Print Zone: ' + result.data, 'error');
                console.error('❌ Failed to save Print Zone:', result.data);
            }
        } catch (error) {
            console.error('❌ Error saving Print Zone:', error);
            this.toastManager.show('Error saving Print Zone', 'error');
        }
    }

    resetPrintZone() {
        const view = this.getCurrentViewData();
        if (!view) return;

        // Reset to default based on safe zone
        const defaultPrintZone = {
            left: view.safeZone?.left || 45,
            top: view.safeZone?.top || 40,
            width: (view.safeZone?.width || 240) + 20,
            height: (view.safeZone?.height || 320) + 40
        };

        console.log('🔄 Resetting Print Zone to default:', defaultPrintZone);

        this.savePrintZoneToView(defaultPrintZone);

        if (this.editingMode === 'printzone') {
            this.showPrintZoneOverlay(); // Refresh overlay
        }

        this.toastManager.show('Print Zone reset to default', 'info');
    }

    getCurrentViewData() {
        const template = this.templates.get(this.activeTemplateId);
        if (!template) return null;

        const variation = template.variations.get(this.currentVariation.toString());
        if (!variation) return null;

        return variation.views.get(this.currentView.toString());
    }

    // Removed: Complex clipping system replaced with simple visual rectangle

    // Removed: No longer needed with simple visual approach

    // Removed: CSS overlay no longer needed with simple visual approach

    // Removed: No longer needed

}

// Make DesignerWidget globally available
console.log('🎯 GLOBAL ASSIGNMENT: Making DesignerWidget globally available...');
window.DesignerWidget = DesignerWidget;
console.log('🎯 GLOBAL ASSIGNMENT: DesignerWidget assigned to window');

// Initialize the designer widget when DOM is ready (or immediately if already ready)
console.log('🎯 DESIGNER INITIALIZATION: Starting designer widget initialization...');

function initializeDesignerWidget() {
    console.log('🎯 DESIGNER WIDGET: Initializing DesignerWidget...');
    try {
        window.designerInstance = new DesignerWidget();
        console.log('🎯 DESIGNER WIDGET: Instance created successfully:', !!window.designerInstance);

        // Dispatch designer ready event
        window.dispatchEvent(new CustomEvent('designerReady', {
            detail: { instance: window.designerInstance }
        }));
        console.log('🎯 DESIGNER WIDGET: designerReady event dispatched');
    } catch (error) {
        console.error('❌ DESIGNER WIDGET: Error creating instance:', error);
    }
}

// Check if DOM is already loaded or wait for it
if (document.readyState === 'loading') {
    console.log('🎯 DOM STATUS: DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initializeDesignerWidget);
} else {
    console.log('🎯 DOM STATUS: DOM already ready, initializing immediately...');
    initializeDesignerWidget();
}

// Additional load event for debugging and fallback
window.addEventListener('load', () => {
    console.log('🎯 WINDOW LOAD: Window load event fired');
    console.log('🎯 WINDOW LOAD: designerInstance exists:', !!window.designerInstance);

    if (!window.designerInstance) {
        console.error('❌ WINDOW LOAD: Designer instance missing, attempting recovery...');
        // Try to initialize again as fallback
        setTimeout(initializeDesignerWidget, 100);
    } else {
        console.log('✅ WINDOW LOAD: Designer instance ready and available');
    }
});

} // End of loadDesignerWidget function

console.log('🎯 SCRIPT END: designer.bundle.js execution completed successfully');

// Start waiting for fabric.js
console.log('🎯 FABRIC INIT: Starting fabric.js detection...');
waitForFabric();