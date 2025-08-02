const CONFIG = {
    LAYOUTS: {
        'strip-4': {
            count: 4,
            label: 'Classic Strip',
            poses: '4 photos',
            preview: 'images/layout-a.png'
        },
        'strip-3': {
            count: 3,
            label: 'Vertical Strip',
            poses: '3 photos',
            preview: 'images/layout-b.png'
        },
        'strip-2': {
            count: 2,
            label: 'Duo',
            poses: '2 photos',
            preview: 'images/layout-c.png'
        },
        'grid-6': {
            count: 6,
            label: 'Grid',
            poses: '6 photos',
            preview: 'images/layout-d.png'
        }
    },
    FILTERS: {
        'none': 'Normal',
        'grayscale': 'B&W',
        'sepia': 'Sepia',
        'vintage': 'Vintage',
        'soft': 'Soft',
        'vivid': 'Vivid'
    },
    FRAME_COLORS: [
        '#FFFFFF', '#000000', '#FBCFE8', '#A7F3D0', '#BFDBFE', 
        '#FDE68A', '#C7D2FE', '#FECACA', '#6B7280', '#9F1239'
    ],
    STICKER_TEMPLATES: {
        'none': {
            name: 'None',
            icon: '✕',
            overlay: null
        },
        'cute': {
            name: 'Cute',
            icon: '🌸',
            overlay: 'https://i.imgur.com/JQ6Y3zD.png'
        },
        'girlypop': {
            name: 'Girlypop',
            icon: '💖',
            overlay: 'https://i.imgur.com/8X9ZQYF.png'
        },
        'jellycat': {
            name: 'Jellycat',
            icon: '🐱',
            overlay: 'https://i.imgur.com/3vJ7R9T.png'
        },
        'mofusand': {
            name: 'Mofusand',
            icon: '🐾',
            overlay: 'https://i.imgur.com/5X9ZQYF.png'
        },
        'shinchan': {
            name: 'Shin Chan',
            icon: '👦',
            overlay: 'https://i.imgur.com/7X9ZQYF.png'
        },
        'miffy': {
            name: 'Miffy',
            icon: '🐰',
            overlay: 'https://i.imgur.com/9X9ZQYF.png'
        },
        'marksdebut': {
            name: "Mark's Debut",
            icon: '🌟',
            overlay: 'https://i.imgur.com/1X9ZQYF.png'
        },
        'happyimaniday': {
            name: 'Happy Imani Day',
            icon: '🎉',
            overlay: 'https://i.imgur.com/2X9ZQYF.png'
        }
    }
};

let state = {
    stream: null,
    selectedLayoutKey: null,
    countdownTime: 3,
    photos: [],
    frameColor: '#FBCFE8',
    stickerTemplateKey: 'none',
    currentFilter: 'none',
    framePadding: 5,
    mirrorMode: true,
    uploadedPhotos: [],
    activeSticker: null
};

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    layout: document.getElementById('layout-screen'),
    camera: document.getElementById('camera-screen'),
    preview: document.getElementById('preview-screen')
};
const getStartedBtn = document.getElementById('get-started-btn');
const layoutOptionsContainer = document.getElementById('layout-options');
const continueLayoutBtn = document.getElementById('continue-layout-btn');
const video = document.getElementById('video');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownSelect = document.getElementById('countdown-select');
const startCaptureBtn = document.getElementById('start-capture-btn');
const filterBar = document.getElementById('filter-bar');
const previewCanvas = document.getElementById('preview-canvas');
const frameColorSwatches = document.getElementById('frame-color-swatches');
const frameColorPicker = document.getElementById('frame-color-picker');
const stickerTemplatesContainer = document.getElementById('sticker-templates');
const downloadBtn = document.getElementById('download-btn');
const retakeBtn = document.getElementById('retake-btn');
const previewLayoutInfo = document.getElementById('preview-layout-info');
const framePaddingSlider = document.getElementById('frame-padding-slider');
const framePaddingValue = document.getElementById('frame-padding-value');
const toggleMirrorBtn = document.getElementById('toggle-mirror-btn');
const backToWelcomeBtn = document.getElementById('back-to-welcome-btn');
const backToLayoutBtn = document.getElementById('back-to-layout-btn');
const imageUpload = document.getElementById('image-upload');
const uploadPreview = document.getElementById('upload-preview');
const uploadInfo = document.getElementById('upload-info');

// Utility Functions
const showScreen = (screenName) => {
    Object.values(screens).forEach(s => s.classList.replace('active', 'hidden'));
    screens[screenName].classList.replace('hidden', 'active');
};

const initializeUI = () => {
    // Layout options
    layoutOptionsContainer.innerHTML = '';
    for (const key in CONFIG.LAYOUTS) {
        const layout = CONFIG.LAYOUTS[key];
        const option = document.createElement('div');
        option.className = 'flex flex-col items-center cursor-pointer group animate-fadein';
        option.dataset.layoutKey = key;

        const previewContainer = document.createElement('div');
        previewContainer.className = 'relative w-full aspect-[3/2] bg-gray-50 rounded-xl overflow-hidden border-2 border-transparent hover:border-pink-200 transition-all flex items-center justify-center shadow-sm hover:shadow-md';

        const preview = document.createElement('div');
        preview.className = 'w-full h-full flex items-center justify-center bg-gray-100';
        preview.innerHTML = `<img src="${layout.preview}" alt="${layout.label}" class="h-full w-auto object-contain">`;

        const label = document.createElement('div');
        label.className = 'text-center mt-3 space-y-1';
        label.innerHTML = `
            <div class="font-semibold text-gray-800">${layout.label}</div>
            <div class="text-gray-500 text-sm">${layout.poses}</div>
        `;

        previewContainer.appendChild(preview);
        option.appendChild(previewContainer);
        option.appendChild(label);
        layoutOptionsContainer.appendChild(option);

        option.addEventListener('click', () => {
            document.querySelectorAll('#layout-options > div').forEach(el => {
                el.firstChild.classList.remove('border-pink-500', 'ring-2', 'ring-pink-200');
            });
            previewContainer.classList.add('border-pink-500', 'ring-2', 'ring-pink-200');
            state.selectedLayoutKey = key;
            continueLayoutBtn.disabled = false;
        });
    }

    // Filter options
    filterBar.innerHTML = '';
    for (const key in CONFIG.FILTERS) {
        const btn = document.createElement('button');
        btn.className = 'filter-btn flex-shrink-0 bg-white border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all text-sm cursor-pointer hover:border-pink-300 hover:shadow-sm';
        if (key === 'none') btn.classList.add('bg-pink-100', 'border-pink-300', 'text-pink-700');
        btn.dataset.filter = key;
        btn.textContent = CONFIG.FILTERS[key];
        filterBar.appendChild(btn);
    }

    // Frame color swatches
    frameColorSwatches.innerHTML = '';
    CONFIG.FRAME_COLORS.forEach(color => {
        const swatch = document.createElement('button');
        swatch.className = 'color-swatch w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300 transition-all shadow-sm';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatch.onclick = () => {
            state.frameColor = color;
            frameColorPicker.value = color;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            drawFinalResult();
        };
        if (color === state.frameColor) swatch.classList.add('selected');
        frameColorSwatches.appendChild(swatch);
    });

    // Frame color picker
    frameColorPicker.addEventListener('input', (e) => {
        state.frameColor = e.target.value;
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        drawFinalResult();
    });

    // Frame padding slider
    framePaddingSlider.addEventListener('input', function() {
        state.framePadding = parseInt(this.value);
        framePaddingValue.textContent = `${state.framePadding}%`;
        drawFinalResult();
    });

    // Sticker templates
    stickerTemplatesContainer.innerHTML = '';
    for (const key in CONFIG.STICKER_TEMPLATES) {
        const template = CONFIG.STICKER_TEMPLATES[key];
        const btn = document.createElement('button');
        btn.className = 'sticker-option flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 hover:border-pink-300 transition-all text-sm font-medium';
        if (key === 'none') btn.classList.add('bg-pink-50', 'border-pink-300', 'text-pink-700');
        btn.dataset.templateKey = key;

        btn.innerHTML = `
            <span class="text-xl mb-1">${template.icon || '✕'}</span>
            <span>${template.name}</span>
        `;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.sticker-option').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            state.stickerTemplateKey = key;
            state.activeSticker = template.overlay;
            drawFinalResult();
        });

        stickerTemplatesContainer.appendChild(btn);
    }

    // Mirror mode toggle
    toggleMirrorBtn.addEventListener('click', () => {
        state.mirrorMode = !state.mirrorMode;
        if (state.mirrorMode) {
            video.classList.add('mirror');
            toggleMirrorBtn.textContent = 'On';
            toggleMirrorBtn.classList.add('bg-pink-500', 'text-white');
            toggleMirrorBtn.nextElementSibling.classList.remove('bg-pink-500', 'text-white');
        } else {
            video.classList.remove('mirror');
            toggleMirrorBtn.textContent = 'Off';
            toggleMirrorBtn.classList.remove('bg-pink-500', 'text-white');
            toggleMirrorBtn.nextElementSibling.classList.add('bg-pink-500', 'text-white');
        }
    });

    toggleMirrorBtn.nextElementSibling.addEventListener('click', () => {
        state.mirrorMode = false;
        video.classList.remove('mirror');
        toggleMirrorBtn.textContent = 'Off';
        toggleMirrorBtn.classList.remove('bg-pink-500', 'text-white');
        toggleMirrorBtn.nextElementSibling.classList.add('bg-pink-500', 'text-white');
    });
};

// Camera Functions
const startCamera = async () => {
    try {
        if (state.stream) state.stream.getTracks().forEach(track => track.stop());

        const constraints = {
            video: {
                facingMode: 'user',
                width: { ideal: 3840 },
                height: { ideal: 2560 },
                aspectRatio: 1.5
            },
            audio: false
        };

        state.stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = state.stream;
        await video.play();

        if (state.mirrorMode) {
            video.classList.add('mirror');
            toggleMirrorBtn.textContent = 'On';
            toggleMirrorBtn.classList.add('bg-pink-500', 'text-white');
            toggleMirrorBtn.nextElementSibling.classList.remove('bg-pink-500', 'text-white');
        } else {
            video.classList.remove('mirror');
            toggleMirrorBtn.textContent = 'Off';
            toggleMirrorBtn.classList.remove('bg-pink-500', 'text-white');
            toggleMirrorBtn.nextElementSibling.classList.add('bg-pink-500', 'text-white');
        }
    } catch (err) {
        console.error('Camera error:', err);
        alert('Cannot access camera. Please make sure you have granted camera permissions.');
        showScreen('welcome');
    }
};

const runCountdown = (seconds) => new Promise(resolve => {
    countdownOverlay.classList.remove('hidden');
    countdownOverlay.classList.add('flex');
    let counter = seconds;
    countdownOverlay.textContent = counter;
    const interval = setInterval(() => {
        counter--;
        if (counter > 0) countdownOverlay.textContent = counter;
        else {
            clearInterval(interval);
            countdownOverlay.classList.add('hidden');
            countdownOverlay.classList.remove('flex');
            resolve();
        }
    }, 1000);
});

const flashEffect = () => {
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white opacity-80 z-20 animate-pulse';
    video.parentElement.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
};

const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const targetWidth = video.videoWidth;
    const targetHeight = Math.round(targetWidth * (4 / 6));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    const sourceAspect = video.videoWidth / video.videoHeight;
    const targetAspect = 1.5;

    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

    if (sourceAspect > targetAspect) {
        sw = video.videoHeight * targetAspect;
        sx = (video.videoWidth - sw) / 2;
    } else {
        sh = video.videoWidth / targetAspect;
        sy = (video.videoHeight - sh) / 2;
    }

    ctx.filter = getComputedStyle(video).filter;

    if (state.mirrorMode) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/jpeg', 0.92);
};

// Image Upload Functions
const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const layout = CONFIG.LAYOUTS[state.selectedLayoutKey];
    const requiredPhotos = layout.count;
    
    if (state.uploadedPhotos.length + files.length > requiredPhotos) {
        state.uploadedPhotos = [];
        uploadPreview.innerHTML = '';
    }
    
    Array.from(files).slice(0, requiredPhotos - state.uploadedPhotos.length).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            state.uploadedPhotos.push(event.target.result);
            updatePhotoPreview();
            
            if (state.uploadedPhotos.length === requiredPhotos) {
                state.photos = [...state.uploadedPhotos];
                setTimeout(() => {
                    drawFinalResult();
                    showScreen('preview');
                }, 500);
            }
        };
        reader.readAsDataURL(file);
    });
};

const updatePhotoPreview = () => {
    uploadPreview.innerHTML = '';
    state.uploadedPhotos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo;
        img.className = 'w-10 h-10 object-cover rounded-md border-2 border-pink-300';
        img.title = `Foto ${index + 1}`;
        uploadPreview.appendChild(img);
    });
    
    const layout = CONFIG.LAYOUTS[state.selectedLayoutKey];
    uploadInfo.textContent = `Uploaded ${state.uploadedPhotos.length} of ${layout.count} photos for ${layout.label}`;
};

// Image Processing
const drawFinalResult = async () => {
    const layoutConfig = CONFIG.LAYOUTS[state.selectedLayoutKey];
    const canvas = previewCanvas;
    const ctx = canvas.getContext('2d');

    const promises = state.photos.map(src => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
    }));
    const loadedImages = await Promise.all(promises);

    const baseWidth = 600;
    const footerHeight = 60;
    const outerPadding = baseWidth * (state.framePadding / 100);
    const innerPadding = outerPadding * 0.5;
    const photoAreaWidth = baseWidth - (outerPadding * 2);
    const photoAspectRatio = 0.6667;

    let totalPhotoHeight = 0;
    if (state.selectedLayoutKey.includes('grid')) {
        const cols = 2;
        const rows = Math.ceil(layoutConfig.count / cols);
        const photoWidth = (photoAreaWidth - innerPadding * (cols - 1)) / cols;
        const photoHeight = photoWidth * photoAspectRatio;
        totalPhotoHeight = (photoHeight * rows) + (innerPadding * (rows - 1));
    } else {
        const photoHeight = photoAreaWidth * photoAspectRatio;
        totalPhotoHeight = (photoHeight * layoutConfig.count) + (innerPadding * (layoutConfig.count - 1));
    }

    const canvasHeight = totalPhotoHeight + footerHeight + (outerPadding * 2);
    canvas.width = baseWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = state.frameColor;
    ctx.fillRect(0, 0, canvas.width, canvasHeight);

    if (state.selectedLayoutKey.includes('grid')) {
        const cols = 2;
        const photoWidth = (photoAreaWidth - innerPadding * (cols - 1)) / cols;
        const photoHeight = photoWidth * photoAspectRatio;
        loadedImages.forEach((img, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = outerPadding + col * (photoWidth + innerPadding);
            const y = outerPadding + row * (photoHeight + innerPadding);
            ctx.drawImage(img, x, y, photoWidth, photoHeight);
        });
    } else {
        const photoHeight = photoAreaWidth * photoAspectRatio;
        loadedImages.forEach((img, i) => {
            const y = outerPadding + i * (photoHeight + innerPadding);
            ctx.drawImage(img, outerPadding, y, photoAreaWidth, photoHeight);
        });
    }

    // Draw active sticker if exists
    if (state.activeSticker) {
        const stickerImg = await new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = state.activeSticker;
        });

        // Draw sticker as overlay covering the whole canvas
        ctx.globalAlpha = 0.8; // Adjust opacity as needed
        ctx.drawImage(stickerImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    // Add footer text
    const now = new Date();
    const date = now.toLocaleDateString('en-GB');
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const footerTextY = canvasHeight - (footerHeight / 2) + 8;

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText(`Frameify • ${date} • ${time}`, canvas.width / 2, footerTextY);

    ctx.font = '12px Poppins';
    ctx.textAlign = 'right';
    ctx.fillText(`© ${now.getFullYear()}`, canvas.width - (outerPadding / 2), footerTextY);

    // Update download link
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        downloadBtn.href = url;
        downloadBtn.download = `frameify-${Date.now()}.png`;
    }, 'image/png', 1.0);
};

// Event Listeners
getStartedBtn.addEventListener('click', () => showScreen('layout'));

backToWelcomeBtn.addEventListener('click', () => {
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
    showScreen('welcome');
});

backToLayoutBtn.addEventListener('click', () => {
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
    showScreen('layout');
});

continueLayoutBtn.addEventListener('click', async () => {
    if (!state.selectedLayoutKey) return;
    
    state.uploadedPhotos = [];
    uploadPreview.innerHTML = '';
    
    startCaptureBtn.textContent = `Capture ${CONFIG.LAYOUTS[state.selectedLayoutKey].count} Photos`;
    showScreen('camera');
    await startCamera();
    
    const layout = CONFIG.LAYOUTS[state.selectedLayoutKey];
    uploadInfo.textContent = `Upload ${layout.count} photos for ${layout.label}`;
});

filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (btn) {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-pink-100', 'border-pink-300', 'text-pink-700');
        });
        btn.classList.add('bg-pink-100', 'border-pink-300', 'text-pink-700');
        state.currentFilter = btn.dataset.filter;
        video.className = 'w-full h-full object-cover transition-all duration-300';
        if (state.currentFilter !== 'none') video.classList.add(state.currentFilter);
        if (state.mirrorMode) video.classList.add('mirror');
    }
});

countdownSelect.addEventListener('change', (e) => {
    state.countdownTime = parseInt(e.target.value, 10);
});

startCaptureBtn.addEventListener('click', async () => {
    if (!state.selectedLayoutKey) return;

    startCaptureBtn.disabled = true;
    startCaptureBtn.textContent = 'Preparing...';

    state.photos = [];
    const count = CONFIG.LAYOUTS[state.selectedLayoutKey].count;

    try {
        for (let i = 0; i < count; i++) {
            await runCountdown(state.countdownTime);
            flashEffect();
            state.photos.push(capturePhoto());

            startCaptureBtn.textContent = `Captured ${i+1} of ${count}`;

            if (i < count - 1) {
                await new Promise(r => setTimeout(r, 800));
            }
        }

        const layoutInfo = CONFIG.LAYOUTS[state.selectedLayoutKey];
        previewLayoutInfo.textContent = `${layoutInfo.label} • ${layoutInfo.poses}`;
        await drawFinalResult();
        showScreen('preview');
    } catch (error) {
        console.error('Error during capture:', error);
        alert('Something went wrong during capture. Please try again.');
    } finally {
        startCaptureBtn.disabled = false;
        startCaptureBtn.textContent = `Capture ${count} Photos`;
    }
});

imageUpload.addEventListener('change', handleImageUpload);

retakeBtn.addEventListener('click', () => {
    state = {
        stream: null,
        selectedLayoutKey: null,
        countdownTime: 3,
        photos: [],
        frameColor: '#FBCFE8',
        stickerTemplateKey: 'none',
        currentFilter: 'none',
        framePadding: 5,
        mirrorMode: true,
        uploadedPhotos: [],
        activeSticker: null
    };
    uploadPreview.innerHTML = '';
    continueLayoutBtn.disabled = true;
    document.querySelectorAll('#layout-options > div').forEach(el => {
        el.firstChild.classList.remove('border-pink-500', 'ring-2', 'ring-pink-200');
    });
    document.querySelectorAll('.sticker-option').forEach(btn => {
        btn.classList.remove('active');
    });
    showScreen('welcome');
});

// Initialize
initializeUI();