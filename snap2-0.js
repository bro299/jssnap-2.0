const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuClose = document.getElementById('mobileMenuClose');
        const mobileMenu = document.getElementById('mobileMenu');

        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('mobile-menu-active');
        });

        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('mobile-menu-active');
        });

        // Tutup menu mobile saat mengklik tautan
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('mobile-menu-active');
            });
        });

        // Animasi GSAP
        gsap.from("#landing h1", {opacity: 0, y: -50, duration: 1, ease: "power3.out"});
        gsap.from("#landing p", {opacity: 0, y: -30, duration: 1, delay: 0.3, ease: "power3.out"});
        gsap.from("#landing a", {opacity: 0, y: 30, duration: 1, delay: 0.6, ease: "power3.out", stagger: 0.2});
        gsap.from(".mobile-app-mockup", {opacity: 0, y: 50, duration: 1, delay: 0.9, ease: "power3.out"});

        // Scroll halus
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        const actionSelect = document.getElementById('actionSelect');
        const uploadForm = document.getElementById('uploadForm');
        const fileInput = document.getElementById('fileInput');
        const fileInputLabel = document.getElementById('fileInputLabel');
        const ocrOptions = document.getElementById('ocrOptions');
        const chooseFileBtn = document.getElementById('chooseFileBtn');
        const capturePhotoBtn = document.getElementById('capturePhotoBtn');
        const cameraPreview = document.getElementById('cameraPreview');
        const captureCanvas = document.getElementById('captureCanvas');
        const captureControls = document.getElementById('captureControls');
        const retakeButton = document.getElementById('retakeButton');
        const uploadCapturedImage = document.getElementById('uploadCapturedImage');
        const resultDiv = document.getElementById('result');
        const loadingAnimation = document.getElementById('loadingAnimation');

        let stream;
        let capturedImage;

        actionSelect.addEventListener('change', function() {
            if (this.value === 'ocr') {
                ocrOptions.classList.remove('hidden');
                fileInputLabel.classList.add('hidden');
                aiReminiOptions.classList.add('hidden');
            } else if (this.value === 'aiRemini') {
                ocrOptions.classList.add('hidden');
                fileInputLabel.classList.remove('hidden');
                aiReminiOptions.classList.remove('hidden');
            } else {
                ocrOptions.classList.add('hidden');
                fileInputLabel.classList.remove('hidden');
                aiReminiOptions.classList.add('hidden');
            }
        });

        chooseFileBtn.addEventListener('click', function() {
            fileInput.click();
        });


        function showLoading() {
            loadingAnimation.classList.remove('hidden');
        }

        function hideLoading() {
            loadingAnimation.classList.add('hidden');
        }

        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();
            resultDiv.innerHTML = '';
            resultDiv.classList.add('hidden');

            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            try {
                // Step 1: Upload the file
                const uploadResponse = await fetch('https://itzpire.com/tools/upload', {
                    method: 'POST',
                    headers: {
                        'accept': '*/*',
                    },
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();

                if (uploadResponse.ok && uploadResult.status === "success") {
                    const fileUrl = uploadResult.fileInfo.url;

                    // Step 2: Process the file based on the selected action
                    let processUrl, processResponse, processResult;

                    switch (actionSelect.value) {
                        case 'convert':
                            processUrl = `https://api.nyxs.pw/tools/hd?url=${encodeURIComponent(fileUrl)}`;
                            break;
                        case 'ocr':
                            processUrl = `https://api.nyxs.pw/tools/ocr?url=${encodeURIComponent(fileUrl)}`;
                            break;
                        case 'wordToPdf':
                            processUrl = `https://api.nyxs.pw/converter/word-to-pdf?url=${encodeURIComponent(fileUrl)}`;
                            break;
                        case 'pdfToWord':
                            processUrl = `https://api.nyxs.pw/converter/pdf-to-word?url=${encodeURIComponent(fileUrl)}`;
                            break;
                        case 'aiRemini':
                            const method = document.getElementById('reminiMethod').value;
                            processUrl = `https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(fileUrl)}&method=${method}`;
                            break;
                    }

                    processResponse = await fetch(processUrl, {
                        method: 'GET',
                        headers: {
                            'accept': actionSelect.value === 'aiRemini' ? 'image/jpeg' : 'application/json',
                        },
                    });

                    if (actionSelect.value === 'aiRemini') {
                        processResult = await processResponse.blob();
                    } else {
                        processResult = await processResponse.json();
                    }

                    // Step 3: Display the result
                    if (processResponse.ok) {
                        switch (actionSelect.value) {
                            case 'convert':
                                resultDiv.innerHTML = `
                                    <p class="mb-4 font-bold text-lg">Gambar berhasil dikonversi!</p>
                                    <div class="bg-dark-400 p-4 rounded-lg">
                                        <img src="${processResult.result}" alt="Gambar HD" class="result-image"/>
                                        <a href="${processResult.result}" download class="mt-4 inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition duration-300">
                                            <i class="fas fa-download mr-2"></i>Unduh Gambar HD
                                        </a>
                                    </div>
                                `;
                                break;
                            case 'ocr':
                                resultDiv.innerHTML = `
                                    <p class="mb-4 font-bold text-lg">Teks berhasil diekstrak!</p>
                                    <div class="bg-dark-400 p-4 rounded-lg">
                                        <h3 class="text-lg font-semibold mb-2">Hasil Ekstraksi Teks:</h3>
                                        <pre class="result-text">${processResult.result}</pre>
                                        <button onclick="copyToClipboard(this.previousElementSibling.textContent)" class="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition duration-300">
                                            <i class="fas fa-copy mr-2"></i>Salin Teks
                                        </button>
                                    </div>
                                `;
                                break;
                            case 'wordToPdf':
                            case 'pdfToWord':
                                const fileType = actionSelect.value === 'wordToPdf' ? 'PDF' : 'Word';
                                resultDiv.innerHTML = `
                                    <p class="mb-4 font-bold text-lg">File berhasil dikonversi!</p>
                                    <div class="bg-dark-400 p-4 rounded-lg">
                                        <p class="font-semibold mb-2">URL File ${fileType}:</p>
                                        <div class="flex items-center justify-between">
                                            <a href="${processResult.result}" target="_blank" class="text-blue-400 hover:underline text-sm break-all">${processResult.result}</a>
                                            <button onclick="copyToClipboard('${processResult.result}')" class="ml-2 text-gray-300 hover:text-white transition-colors duration-300">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                        <a href="${processResult.result}" download class="mt-4 inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition duration-300">
                                            <i class="fas fa-download mr-2"></i>Unduh File ${fileType}
                                        </a>
                                    </div>
                                `;
                                break;
                            case 'aiRemini':
                                const imageUrl = URL.createObjectURL(processResult);
                                resultDiv.innerHTML = `
                                    <p class="mb-4 font-bold text-lg">Gambar berhasil diproses dengan AI Remini!</p>
                                    <div class="bg-dark-400 p-4 rounded-lg">
                                        <img src="${imageUrl}" alt="AI Remini Result" class="result-image"/>
                                        <a href="${imageUrl}" download="ai_remini_result.jpg" class="mt-4 inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition duration-300">
                                            <i class="fas fa-download mr-2"></i>Unduh Gambar Hasil AI Remini
                                        </a>
                                    </div>
                                `;
                                break;
                        }
                    } else {
                        resultDiv.innerHTML = `<p class="text-red-400">Error: ${processResult.message || 'Terjadi kesalahan yang tidak diketahui'}</p>`;
                    }
                } else {
                    resultDiv.innerHTML = `<p class="text-red-400">Error during upload: ${uploadResult.message || 'Terjadi kesalahan yang tidak diketahui'}</p>`;
                }
            } catch (error) {
                resultDiv.innerHTML = `<p class="text-red-400">Error: ${error.message}</p>`;
            } finally {
                hideLoading();
                resultDiv.classList.remove('hidden');
            }
        });

        // CS Image Input
        const csImageInput = document.getElementById('csImageInput');
        const csImage = document.getElementById('csImage');

        csImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    csImage.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });

        // Accordion functionality
        const accordions = document.querySelectorAll('.accordion');
        accordions.forEach(accordion => {
            accordion.addEventListener('click', function() {
                this.classList.toggle('active');
                const panel = this.nextElementSibling;
                const icon = this.querySelector('.fas.fa-chevron-down');
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });

        // Function to copy text to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Text copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
