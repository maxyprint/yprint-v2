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
                
                // Update stored position
                if (this.currentView && this.currentVariation) {
                    const key = `${this.currentVariation}_${this.currentView}`;
                    const imageData = this.variationImages.get(key);
                    if (imageData) {
                        imageData.transform.left = activeObject.left;
                        imageData.transform.top = activeObject.top;
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
        
        // Store the image transformation
        if (this.currentView && this.currentVariation) {
            const key = `${this.currentVariation}_${this.currentView}`;
            const imageData = this.variationImages.get(key);
            if (imageData) {
                imageData.transform.scaleX = newScaleX;
                imageData.transform.scaleY = newScaleY;
            }
        }
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

        await this.loadInitialTemplate();
        
        if (!this.activeTemplateId) {
            await this.loadInitialDesign();
        }
    }

    async loadInitialDesign() {

        const urlParams = new URLSearchParams(window.location.search);
        const initialDesignId = urlParams.get('design_id');

        if( !initialDesignId ) return false;

        await this.loadDesign(initialDesignId);

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
        this.fabricCanvas = new fabric.Canvas('octo-print-designer-canvas', {
            width: this.canvas.offsetWidth,
            height: this.canvas.offsetHeight,
            backgroundColor: '#fff',
            preserveObjectStacking: true
        });
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

        fabric.Image.fromURL(view.image_url, (img) => {
            this.renderTemplateView(view, img);
        });
    }

    renderTemplateView(view, fabricImage) {
        // Clear existing canvas
        this.fabricCanvas.clear();

        this.clipMask = new fabric.Rect({
            left: view.safeZone.left * this.fabricCanvas.width / 100,
            top: view.safeZone.top * this.fabricCanvas.height / 100,
            width: view.safeZone.width * this.fabricCanvas.width / 100,
            height: view.safeZone.height * this.fabricCanvas.height / 100,
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

        console.log('🔍 Print Zone Data:', {
            printZone: view.printZone,
            safeZone: view.safeZone,
            using: zoneData
        });

        // 🔍 DEBUG: Detailed Print Zone Analysis
        console.log('🔍 CANVAS DIMENSIONS:', {
            canvasWidth: this.fabricCanvas.width,
            canvasHeight: this.fabricCanvas.height
        });

        console.log('🔍 RAW ZONE DATA:', {
            safeZone: view.safeZone,
            printZone: view.printZone || 'nicht vorhanden'
        });

        console.log('🔍 VERWENDETE ZONE DATA:', zoneData);

        console.log('🔍 BERECHNUNGEN (AKTUELL - MIT /100):', {
            left_calculated: zoneData.left * this.fabricCanvas.width / 100,
            top_calculated: zoneData.top * this.fabricCanvas.height / 100,
            width_calculated: zoneData.width * this.fabricCanvas.width / 100,
            height_calculated: zoneData.height * this.fabricCanvas.height / 100
        });

        console.log('🔍 BERECHNUNGEN (TEST - OHNE /100):', {
            left_direct: zoneData.left,
            top_direct: zoneData.top,
            width_direct: zoneData.width,
            height_direct: zoneData.height
        });

        // 🔍 IMAGE vs CANVAS POSITIONING ANALYSIS
        console.log('=== 🖼️ IMAGE vs CANVAS POSITIONING ===');
        const objects = this.fabricCanvas.getObjects();
        const backgroundImage = objects.find(obj => obj.type === 'image');

        if (backgroundImage) {
            console.log('🖼️ Background Image:', {
                left: backgroundImage.left,
                top: backgroundImage.top,
                width: backgroundImage.width,
                height: backgroundImage.height,
                scaleX: backgroundImage.scaleX,
                scaleY: backgroundImage.scaleY,
                actualWidth: backgroundImage.width * backgroundImage.scaleX,
                actualHeight: backgroundImage.height * backgroundImage.scaleY
            });

            const imageBounds = {
                left: backgroundImage.left - (backgroundImage.width * backgroundImage.scaleX) / 2,
                top: backgroundImage.top - (backgroundImage.height * backgroundImage.scaleY) / 2,
                right: backgroundImage.left + (backgroundImage.width * backgroundImage.scaleX) / 2,
                bottom: backgroundImage.top + (backgroundImage.height * backgroundImage.scaleY) / 2
            };

            console.log('📦 Image bounds:', imageBounds);
            console.log('🎯 Zone relative to image would be:', {
                left: imageBounds.left + zoneData.left,
                top: imageBounds.top + zoneData.top,
                width: zoneData.width,
                height: zoneData.height
            });
        } else {
            console.log('❌ No background image found');
            console.log('📋 All objects:', objects.map(obj => ({type: obj.type, left: obj.left, top: obj.top})));
        }

        // 🔍 PRINT ZONE DEBUG - Canvas & Template Data
        console.log('🔍 PRINT ZONE DEBUG START:');
        console.log('📐 Canvas dimensions:', this.fabricCanvas.width, 'x', this.fabricCanvas.height);
        console.log('📊 SafeZone data:', view.safeZone);
        console.log('🏗️ Current template ID:', this.activeTemplateId);
        console.log('🔢 Current variation:', this.currentVariation);
        console.log('👀 Current view:', this.currentView);
        console.log('🎨 Fabric version:', fabric.version);
        console.log('📏 Canvas zoom:', this.fabricCanvas.getZoom());

        // 🎯 SINGLE SOURCE OF TRUTH - HYBRID PRINT ZONE LOGIC
        console.log('=== 🎯 SSOT HYBRID PRINT ZONE CALCULATION ===');

        // DEFINITIVE FORMAT: Position = Percent, Size = Pixels (based on SQL data analysis)
        console.log('📋 DATA FORMAT DEFINITION:');
        console.log('  - Position (left/top): PERCENT (0-100) of canvas dimensions');
        console.log('  - Size (width/height): PIXELS (absolute values)');

        console.log('📊 RAW DATA FROM DATABASE:');
        console.log('  - left:', view.safeZone.left, '(interpreted as %)');
        console.log('  - top:', view.safeZone.top, '(interpreted as %)');
        console.log('  - width:', view.safeZone.width, '(interpreted as px)');
        console.log('  - height:', view.safeZone.height, '(interpreted as px)');

        console.log('📐 CANVAS CONTEXT:');
        console.log('  - Canvas width:', this.fabricCanvas.width, 'px');
        console.log('  - Canvas height:', this.fabricCanvas.height, 'px');

        // HYBRID CALCULATION - SSOT Implementation (CENTER-BASED POSITIONING)
        // SQL Analysis: 49.625% left, 45.4% top = CENTER POSITION, not top-left corner
        const calculatedLeft = ((view.safeZone.left / 100) * this.fabricCanvas.width) - (view.safeZone.width / 2);
        const calculatedTop = ((view.safeZone.top / 100) * this.fabricCanvas.height) - (view.safeZone.height / 2);
        const calculatedWidth = view.safeZone.width; // Direct pixel value
        const calculatedHeight = view.safeZone.height; // Direct pixel value

        console.log('🧮 HYBRID CALCULATION RESULTS:');
        console.log('  - left:', view.safeZone.left + '% → ' + calculatedLeft + 'px');
        console.log('  - top:', view.safeZone.top + '% → ' + calculatedTop + 'px');
        console.log('  - width:', calculatedWidth + 'px (direct)');
        console.log('  - height:', calculatedHeight + 'px (direct)');

        // BOUNDS VALIDATION
        const bounds = {
            left: calculatedLeft >= 0 && calculatedLeft <= this.fabricCanvas.width,
            top: calculatedTop >= 0 && calculatedTop <= this.fabricCanvas.height,
            right: (calculatedLeft + calculatedWidth) <= this.fabricCanvas.width,
            bottom: (calculatedTop + calculatedHeight) <= this.fabricCanvas.height
        };
        const boundsValid = Object.values(bounds).every(v => v);

        console.log('✅ BOUNDS VALIDATION:', {
            valid: boundsValid,
            details: bounds,
            finalBox: {
                left: calculatedLeft,
                top: calculatedTop,
                right: calculatedLeft + calculatedWidth,
                bottom: calculatedTop + calculatedHeight
            }
        });

        console.log('🎯 VISUAL POSITION EXPECTATIONS:');
        console.log('  - Current position creates box from:', calculatedLeft,
        'to', (calculatedLeft + calculatedWidth));
        console.log('  - Current position creates box from:', calculatedTop, 'to',
         (calculatedTop + calculatedHeight));
        console.log('  - Expected center position (for ~50% left):',
        this.fabricCanvas.width * 0.5);
        console.log('  - Expected center position (for ~45% top):',
        this.fabricCanvas.height * 0.45);
        console.log('  - Distance from expected center:', {
            leftOffset: calculatedLeft - (this.fabricCanvas.width * 0.5),
            topOffset: calculatedTop - (this.fabricCanvas.height * 0.45)
        });

        // Test alternative positioning approaches
        console.log('🧪 ALTERNATIVE POSITIONING TESTS:');
        console.log('  - A) Centered approach:', {
            left: (this.fabricCanvas.width - calculatedWidth) * (49.625/100),
            top: (this.fabricCanvas.height - calculatedHeight) * (45.4/100)
        });
        console.log('  - B) Container relative:', {
            left: this.fabricCanvas.width * (49.625/100) - (calculatedWidth/2),
            top: this.fabricCanvas.height * (45.4/100) - (calculatedHeight/2)
        });

        if (!boundsValid) {
            console.warn('⚠️ WARNING: Print zone extends outside canvas boundaries!');
        }

        console.log('🔍 FABRIC CANVAS COORDINATE SYSTEM ANALYSIS:');
        console.log('  - Canvas element position:',
        this.fabricCanvas.getElement().getBoundingClientRect());
        console.log('  - Canvas offset parent:',
        this.fabricCanvas.getElement().offsetParent);
        console.log('  - Canvas transform matrix:',
        this.fabricCanvas.viewportTransform);
        console.log('  - Canvas center point:', this.fabricCanvas.getCenter());
        console.log('  - Canvas absolute dimensions:', {
            width: this.fabricCanvas.width,
            height: this.fabricCanvas.height,
            getWidth: this.fabricCanvas.getWidth(),
            getHeight: this.fabricCanvas.getHeight()
        });

        const backgroundObjects = this.fabricCanvas.getObjects().filter(obj =>
        obj.type === 'image');
        console.log('🖼️ BACKGROUND IMAGE ANALYSIS:');
        console.log('  - Found background images:', backgroundObjects.length);
        if (backgroundObjects.length > 0) {
            const bgImg = backgroundObjects[0];
            console.log('  - Image position:', {left: bgImg.left, top:
        bgImg.top});
            console.log('  - Image dimensions:', {width: bgImg.width, height:
        bgImg.height});
            console.log('  - Image scale:', {scaleX: bgImg.scaleX, scaleY:
        bgImg.scaleY});
            console.log('  - Image bounds:', bgImg.getBoundingRect());
            console.log('  - Should print zone be relative to image?', {
                imageLeft: bgImg.left,
                imageTop: bgImg.top,
                zoneShouldBe: {
                    left: bgImg.left + (49.625/100 * bgImg.width * bgImg.scaleX),
                    top: bgImg.top + (45.4/100 * bgImg.height * bgImg.scaleY)
                }
            });
        }

        // 🔍 ENHANCED CANVAS STATE ANALYSIS
        console.log('=== 🔍 ENHANCED CANVAS STATE ANALYSIS ===');

        // 1. Complete Canvas Object Analysis
        const allCanvasObjects = this.fabricCanvas.getObjects();
        console.log('📋 COMPLETE CANVAS INVENTORY:');
        console.log(`  - Total objects: ${allCanvasObjects.length}`);

        allCanvasObjects.forEach((obj, index) => {
            const boundingRect = obj.getBoundingRect();
            console.log(`  📦 Object ${index + 1}: ${obj.type} at (${obj.left}, ${obj.top})`, {
                width: obj.width,
                height: obj.height,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                visible: obj.visible,
                selectable: obj.selectable,
                evented: obj.evented,
                boundingRect: boundingRect,
                isFabricImage: obj.type === 'image',
                hasSourceProperty: !!(obj.src || obj._element),
                data: obj.data || 'none'
            });
        });

        // 2. Canvas Background Analysis
        console.log('🖼️ DETAILED CANVAS BACKGROUND ANALYSIS:');
        console.log('  - backgroundImage exists:', !!this.fabricCanvas.backgroundImage);
        console.log('  - backgroundColor:', this.fabricCanvas.backgroundColor);
        console.log('  - overlayImage exists:', !!this.fabricCanvas.overlayImage);

        if (this.fabricCanvas.backgroundImage) {
            const bgImg = this.fabricCanvas.backgroundImage;
            console.log('  🖼️ Canvas Background Image Details:', {
                src: (bgImg.src || '').substring(0, 100) + '...',
                left: bgImg.left,
                top: bgImg.top,
                width: bgImg.width,
                height: bgImg.height,
                scaleX: bgImg.scaleX,
                scaleY: bgImg.scaleY,
                originX: bgImg.originX,
                originY: bgImg.originY,
                visible: bgImg.visible,
                bounds: bgImg.getBoundingRect()
            });
        }

        // 3. Template View Background Analysis
        console.log('🖼️ TEMPLATE VIEW BACKGROUND ANALYSIS:');
        console.log('  - Template ID:', this.activeTemplateId);
        console.log('  - Current variation:', this.currentVariation);
        console.log('  - Current view:', this.currentView);
        console.log('  - View imageZone:', view.imageZone);

        // 4. Actual Rendered Print Zone Analysis
        console.log('🎯 RENDERED PRINT ZONE VERIFICATION:');
        const printZoneObjects = allCanvasObjects.filter(obj =>
            obj.stroke === '#007cba' ||
            (obj.fill && obj.fill.includes('rgba')) ||
            obj.isPrintZone === true
        );

        console.log(`  - Found print zone objects: ${printZoneObjects.length}`);
        printZoneObjects.forEach((zone, index) => {
            console.log(`  🎯 Print Zone ${index + 1}:`, {
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
                actualBounds: zone.getBoundingRect(),
                stroke: zone.stroke,
                fill: zone.fill
            });
        });

        // 5. Position Verification vs Expected
        console.log('🔍 POSITION VERIFICATION ANALYSIS:');
        console.log('  📊 Expected position (SSOT calculation):');
        console.log(`    Left: ${calculatedLeft}px (${view.safeZone.left}% of ${this.fabricCanvas.width}px)`);
        console.log(`    Top: ${calculatedTop}px (${view.safeZone.top}% of ${this.fabricCanvas.height}px)`);
        console.log(`    Width: ${calculatedWidth}px (direct pixel value)`);
        console.log(`    Height: ${calculatedHeight}px (direct pixel value)`);

        if (printZoneObjects.length > 0) {
            const actualZone = printZoneObjects[0];
            const leftDiff = actualZone.left - calculatedLeft;
            const topDiff = actualZone.top - calculatedTop;
            console.log('  📏 Position difference (actual vs expected):');
            console.log(`    Left diff: ${leftDiff}px`);
            console.log(`    Top diff: ${topDiff}px`);
            console.log(`    ${leftDiff === 0 && topDiff === 0 ? '✅ Position matches' : '❌ Position mismatch'}`);
        }

        // 6. Canvas Context Analysis
        console.log('🖼️ CANVAS CONTEXT VERIFICATION:');
        const canvasElement = this.fabricCanvas.getElement();
        const canvasRect = canvasElement.getBoundingClientRect();
        console.log('  - Canvas DOM position:', {
            left: canvasRect.left,
            top: canvasRect.top,
            width: canvasRect.width,
            height: canvasRect.height
        });
        console.log('  - Fabric canvas dimensions:', {
            width: this.fabricCanvas.width,
            height: this.fabricCanvas.height
        });
        console.log('  - Canvas viewport transform:', this.fabricCanvas.viewportTransform);

        console.log('=== END ENHANCED CANVAS STATE ANALYSIS ===');
        console.log('=== 🎯 SSOT CALCULATION COMPLETE ===');

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

        // Debug the created element
        console.log('✅ Print zone element created:');
        console.log('  - Final position:', this.printingZoneElement.left, ',', this.printingZoneElement.top);
        console.log('  - Final size:', this.printingZoneElement.width, 'x', this.printingZoneElement.height);
        console.log('  - Style properties:', {
            fill: this.printingZoneElement.fill,
            stroke: this.printingZoneElement.stroke,
            strokeWidth: this.printingZoneElement.strokeWidth
        });
        console.log('🔍 PRINT ZONE DEBUG END');

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
                const template = this.templates.get(this.activeTemplateId);
                const variation = template.variations.get(this.currentVariation.toString());
                const view = variation.views.get(this.currentView);
                const safeZone = view.safeZone;

                const scaleX = safeZone.width / img.width;
                const scaleY = safeZone.height / img.height;
                const scale = Math.min(scaleX, scaleY, 1);

                img.set({
                    left: this.fabricCanvas.width / 2,
                    top: this.fabricCanvas.height / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scale,
                    scaleY: scale,
                    // Remove other styling properties that will be set in configureAndLoadFabricImage
                });

                // Generate unique ID for the image
                const imageId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                img.data = { imageId };

                // Store the image in our data structure
                this.storeViewImage(imageUrl, img);

                // Instead of adding directly to canvas, use our loading method
                // which will properly apply all styles, filters, and clipping
                this.loadViewImage();

                // After loading, find and select this image
                const key = `${this.currentVariation}_${this.currentView}`;
                const imagesArray = this.variationImages.get(key) || [];
                const addedImageData = imagesArray.find(data => data.id === imageId);

                if (addedImageData && addedImageData.fabricImage) {
                    this.fabricCanvas.setActiveObject(addedImageData.fabricImage);
                    this.fabricCanvas.renderAll();
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
            transform: {
                left: fabricImage.left,
                top: fabricImage.top,
                scaleX: fabricImage.scaleX,
                scaleY: fabricImage.scaleY,
                angle: fabricImage.angle,
                width: fabricImage.width,
                height: fabricImage.height
            },
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
        imagesArray.forEach(imageData => {
            // Skip if we already have this image on canvas (avoids duplicates)
            if (imageData.fabricImage && this.fabricCanvas.contains(imageData.fabricImage)) {
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
        
        // Reset filters
        img.filters = [];
        
        if (isDarkShirt) {
            // Settings for dark shirts (keep existing logic)
            img.filters.push(
                new fabric.Image.filters.Contrast({ contrast: 0.15 }),
                new fabric.Image.filters.BlendColor({
                    color: '#ffffff',
                    mode: 'screen',
                    alpha: 0.1
                })
            );
    
            img.applyFilters();
            
            img.set({
                ...imageData.transform,
                cornerSize: 10,
                cornerStyle: 'circle',
                transparentCorners: false,
                cornerColor: '#007cba',
                borderColor: '#007cba',
                cornerStrokeColor: '#fff',
                padding: 5,
                globalCompositeOperation: 'screen',
                preserveAspectRatio: true,
                clipPath: this.clipMask,
                opacity: 0.95,
                visible: imageData.visible !== undefined ? imageData.visible : true
            });
        } else {
            // Settings for light shirts (keep existing logic)
            img.filters.push(
                new fabric.Image.filters.Brightness({ brightness: -0.05 }),
                new fabric.Image.filters.Contrast({ contrast: 0.1 }),
                new fabric.Image.filters.BlendColor({
                    color: '#ffffff',
                    mode: 'multiply',
                    alpha: 0.9
                })
            );
    
            img.applyFilters();
            
            img.set({
                ...imageData.transform,
                cornerSize: 10,
                cornerStyle: 'circle',
                transparentCorners: false,
                cornerColor: '#007cba',
                borderColor: '#007cba',
                cornerStrokeColor: '#fff',
                padding: 5,
                globalCompositeOperation: 'multiply',
                preserveAspectRatio: true,
                clipPath: this.clipMask,
                opacity: 0.8,
                visible: imageData.visible !== undefined ? imageData.visible : true
            });
        }
    
        // Bind events to this image
        this.bindImageEvents(img);
        
        // Add to canvas
        this.fabricCanvas.add(img);
        img.setCoords();
        
        // Render canvas
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
            // Update transform data
            imageData.transform = {
                left: img.left,
                top: img.top,
                scaleX: img.scaleX,
                scaleY: img.scaleY,
                angle: img.angle,
                width: img.width,
                height: img.height
            };
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
        // Call original save function but handle redirect differently
        const originalSaveResult = await this.saveDesignInternal();

        // Show PNG display instead of redirect
        if (originalSaveResult && this._savedPNGs) {
            this.showPNGDisplay(this._savedPNGs);
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

    async loadDesign(designId) {
        // Skip for non-logged users
        if (!this.isLoggedIn) {
            this.showLoginModal();
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('action', 'load_design');
            formData.append('nonce', octoPrintDesigner.nonce);
            formData.append('design_id', designId);

            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
            if (data.success) {
                this.toastManager.show('Design loaded', 'success');
                await this.applyDesignState(data.data);
            } else {
                throw new Error(data.data.message || 'Error loading design');
            }
        } catch (error) {
            this.toastManager.show('Error loading the design', 'error');
            console.error('Error loading design:', error);
            alert('Failed to load design: ' + error.message);
        }
    }

    collectDesignState() {
        // Create an object representing the current state of the design
        const state = {
            templateId: this.activeTemplateId,
            currentVariation: this.currentVariation,
            variationImages: {}
        };
    
        // Convert the variationImages Map to a plain object with arrays
        for (const [key, imagesArray] of this.variationImages) {
            if (!imagesArray || imagesArray.length === 0) continue;
            
            state.variationImages[key] = imagesArray.map(imageData => {
                // Create a clean version without circular references
                return {
                    id: imageData.id,
                    url: imageData.url,
                    transform: {
                        left: imageData.transform.left,
                        top: imageData.transform.top,
                        scaleX: imageData.transform.scaleX,
                        scaleY: imageData.transform.scaleY,
                        angle: imageData.transform.angle,
                        width: imageData.transform.width || imageData.fabricImage.width,
                        height: imageData.transform.height || imageData.fabricImage.height
                    },
                    visible: imageData.visible !== undefined ? imageData.visible : true
                };
            });
        }
    
        return state;
    }

    async applyDesignState(design) {
        const designData = JSON.parse(design.design_data);
        
        // Load the template first
        await this.loadTemplate(designData.templateId);
        
        // Clear existing images
        this.variationImages.clear();
        
        // Restore variation images - handle both formats
        for (const [key, value] of Object.entries(designData.variationImages || {})) {
            const [variationId, viewId] = key.split('_');
            
            if (Array.isArray(value)) {
                // New format: array of images
                for (const imageData of value) {
                    await this.restoreViewImage(variationId, viewId, imageData);
                }
            } else {
                // Old format: single image object - convert to array format
                await this.restoreViewImage(variationId, viewId, value);
            }
        }
    
        // Load the template again to refresh the view
        this.loadTemplate(designData.templateId);
    
        // Store the current design ID
        this.currentDesignId = design.id;
        this.modalNameInput.value = design.name;
        this.modalDesignId.value = design.id;
    }

    async restoreViewImage(variationId, viewId, imageData) {
        try {
            const img = await Image.fromURL(imageData.url);
            
            // Set image properties
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
                centeredScaling: true,
                preserveAspectRatio: true,
                ...imageData.transform
            });
            
            // Store image ID in fabric object for reference
            img.data = {
                imageId: imageData.id || `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            };
            
            // Get or create key in variationImages map
            const key = `${variationId}_${viewId}`;
            if (!this.variationImages.has(key)) {
                this.variationImages.set(key, []);
            }
            
            // Add image to the array
            this.variationImages.get(key).push({
                id: img.data.imageId,
                url: imageData.url,
                transform: imageData.transform,
                fabricImage: img,
                visible: imageData.visible !== undefined ? imageData.visible : true
            });
            
            // Bind events to the image
            this.bindImageEvents(img);
            
            return img;
        } catch (error) {
            console.error('Error restoring image:', error);
            return null;
        }
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
            
            // Calculate position adjustment factors
            const widthRatio = tempCanvas.width / this.fabricCanvas.width;
            const heightRatio = tempCanvas.height / this.fabricCanvas.height;
    
            // Create clipPath with adjusted dimensions
            const clipPath = new fabric.Rect({
                left: view.safeZone.left * tempCanvas.width / 100,
                top: view.safeZone.top * tempCanvas.height / 100,
                width: view.safeZone.width * tempCanvas.width / 100,
                height: view.safeZone.height * tempCanvas.height / 100,
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

                // Set position and transformation
                userImage.set({
                    left: imageData.transform.left * widthRatio,
                    top: imageData.transform.top * heightRatio,
                    scaleX: imageData.transform.scaleX,
                    scaleY: imageData.transform.scaleY,
                    angle: imageData.transform.angle || 0,
                    originX: 'center',
                    originY: 'center',
                    clipPath: clipPath
                });
                
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
        console.log(template);
        if (!template) return {};
        
        const variation = template.variations.get(this.currentVariation.toString());
        console.log(variation); 
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
            width: view.safeZone.width * this.fabricCanvas.width / 100,
            height: view.safeZone.height * this.fabricCanvas.height / 100,
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