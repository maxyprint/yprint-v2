class PrintZonePNGGenerator {
    constructor() {
        this.dpi = 300;
        this.pixelsPerInch = this.dpi / 72; // 72 DPI to 300 DPI conversion
    }

    generatePrintZonePNG(fabricCanvas) {
        const printZone = this.getCurrentPrintZone(fabricCanvas);
        if (!printZone) {
            console.warn('No print zone found');
            return null;
        }

        const tempCanvas = this.createTemporaryCanvas(printZone);
        const designElements = this.filterDesignElements(fabricCanvas);
        this.copyElementsToPrintZone(designElements, tempCanvas, printZone);
        return this.exportPrintZonePNG(tempCanvas, printZone);
    }

    getCurrentPrintZone(fabricCanvas) {
        const printZoneRect = fabricCanvas.getObjects().find(obj =>
            obj.stroke === '#007cba' && obj.fill === 'transparent'
        );

        if (!printZoneRect) {
            return null;
        }

        return {
            left: printZoneRect.left,
            top: printZoneRect.top,
            width: printZoneRect.width * printZoneRect.scaleX,
            height: printZoneRect.height * printZoneRect.scaleY,
            angle: printZoneRect.angle || 0
        };
    }

    filterDesignElements(fabricCanvas) {
        return fabricCanvas.getObjects().filter(obj => {
            const isBackgroundImage = obj.type === 'image' && obj.selectable === false;
            const isPrintZoneRect = obj.stroke === '#007cba';
            const isSystemObject = obj.excludeFromExport === true;

            return obj.selectable !== false &&
                   !isBackgroundImage &&
                   !isPrintZoneRect &&
                   !isSystemObject;
        });
    }

    createTemporaryCanvas(printZone) {
        const scaleFactor = this.pixelsPerInch;
        const canvasWidth = Math.round(printZone.width * scaleFactor);
        const canvasHeight = Math.round(printZone.height * scaleFactor);

        const tempCanvas = new fabric.Canvas(null, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'transparent'
        });

        return tempCanvas;
    }

    copyElementsToPrintZone(elements, tempCanvas, printZone) {
        const scaleFactor = this.pixelsPerInch;

        elements.forEach(element => {
            if (this.isElementInPrintZone(element, printZone)) {
                const clonedElement = fabric.util.object.clone(element);

                // Transform coordinates relative to print zone
                clonedElement.left = (element.left - printZone.left) * scaleFactor;
                clonedElement.top = (element.top - printZone.top) * scaleFactor;

                // Scale the element for high DPI
                if (clonedElement.scaleX) clonedElement.scaleX *= scaleFactor;
                if (clonedElement.scaleY) clonedElement.scaleY *= scaleFactor;

                tempCanvas.add(clonedElement);
            }
        });

        tempCanvas.renderAll();
    }

    isElementInPrintZone(element, printZone) {
        const elementBounds = element.getBoundingRect();
        const printZoneBounds = {
            left: printZone.left,
            top: printZone.top,
            right: printZone.left + printZone.width,
            bottom: printZone.top + printZone.height
        };

        // Check if element overlaps with print zone
        return !(elementBounds.left > printZoneBounds.right ||
                elementBounds.left + elementBounds.width < printZoneBounds.left ||
                elementBounds.top > printZoneBounds.bottom ||
                elementBounds.top + elementBounds.height < printZoneBounds.top);
    }

    exportPrintZonePNG(tempCanvas, printZone) {
        const dataURL = tempCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1
        });

        const pngInfo = {
            dataURL: dataURL,
            width: tempCanvas.width,
            height: tempCanvas.height,
            dpi: this.dpi,
            printZone: printZone,
            sizeInches: {
                width: printZone.width / 72,
                height: printZone.height / 72
            }
        };

        // Clean up temporary canvas
        tempCanvas.dispose();

        return pngInfo;
    }

    showPNGPreview(pngInfo) {
        // 🚫 DEBUG UI DISABLED: No preview modals - return PNG info only
        console.log('🎯 PNG Generated - Preview disabled for clean operation');
        return pngInfo;
    }

    // Utility method to get print zone dimensions in various units
    getPrintZoneDimensions(printZone) {
        return {
            pixels: {
                width: printZone.width,
                height: printZone.height
            },
            inches: {
                width: printZone.width / 72,
                height: printZone.height / 72
            },
            mm: {
                width: (printZone.width / 72) * 25.4,
                height: (printZone.height / 72) * 25.4
            },
            highDPI: {
                width: Math.round(printZone.width * this.pixelsPerInch),
                height: Math.round(printZone.height * this.pixelsPerInch)
            }
        };
    }
}