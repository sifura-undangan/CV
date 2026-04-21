lucide.createIcons();
let store = { work: [], edu: [], org: [], cert: [] };
let isDemoActive = false;
let photo = null;
let docs = [
    { id: 1, label: "Surat Lamaran Kerja", files: [], checked: true },
    { id: 2, label: "CV / Daftar Riwayat Hidup", files: [], checked: true },
    { id: 3, label: "KTP", files: [], checked: true },
    { id: 4, label: "NPWP", files: [], checked: true },
    { id: 5, label: "Surat Keterangan Dokter", files: [], checked: true },
    { id: 6, label: "Ijazah", files: [], checked: true },
    { id: 7, label: "Transkrip Nilai", files: [], checked: true },
    { id: 8, label: "SKCK", files: [], checked: true },
    { id: 9, label: "Akta Kelahiran", files: [], checked: true },
    { id: 10, label: "Kartu Keluarga", files: [], checked: true },
    { id: 11, label: "Kartu Tanda Pencari Kerja / AK1", files: [], checked: true },
    { id: 12, label: "Paklaring", files: [], checked: true },
    { id: 13, label: "Sertifikat Vaksin Covid-19", files: [], checked: true }
];

// Konfigurasi Harga
const PRICE_MAP = {
    'cl': 15000,
    'cv': 15000,
    'docs': 15000,
    'cl+cv': 25000,
    'cl+docs': 20000,
    'cv+docs': 25000,
    'all': 30000
};

function openDownloadModal() {
    const isSurat = document.getElementById('cl-toggle').checked;
    const isCV = document.getElementById('cv-toggle').checked;
    const isBerkas = document.getElementById('docs-toggle').checked;
    
    let key = "";
    if (isSurat && isCV && isBerkas) key = "all";
    else if (isSurat && isCV) key = "cl+cv";
    else if (isCV && isBerkas) key = "cv+docs";
    else if (isSurat && isBerkas) key = "cl+docs";
    else if (isSurat) key = "cl";
    else if (isCV) key = "cv";
    else if (isBerkas) key = "docs";

    const finalPrice = PRICE_MAP[key] || 0;
    
    // Update UI Modal
    document.getElementById('price-tag').innerText = `Rp ${finalPrice.toLocaleString('id-ID')}`;
    const bonusEl = document.getElementById('premium-bonus');
    if (key === 'all') bonusEl.classList.remove('hidden');
    else bonusEl.classList.add('hidden');

    document.getElementById('download-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeDownloadModal() {
    document.getElementById('download-modal').classList.add('hidden');
}

// Integrasi Pembayaran Midtrans Professional
async function initiatePayment() {
    const { price } = getActivePackageInfo(); // Fungsi helper untuk ambil data
    
    // Tampilkan Loading State pada tombol
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memproses...`;
    lucide.createIcons();

    try {
        /* CATATAN PENTING: 
           Anda harus memanggil API Backend Anda sendiri di sini.
           Contoh: const response = await fetch('/api/create-transaction', { method: 'POST', body: JSON.stringify({ amount: price }) });
           const data = await response.json();
           snap.pay(data.token);
        */
        
        // Simulasi proses delay server
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert("Sistem Pembayaran Terhubung ke Midtrans.");
        
        // Simulasi Pembayaran Berhasil
        const success = confirm("Simulasi: Apakah pembayaran berhasil?");
        if (success) {
            btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Pembayaran Berhasil!`;
            setTimeout(() => {
                downloadPDF('premium');
                closeDownloadModal();
            }, 1000);
        } else {
            btn.innerHTML = originalText;
            lucide.createIcons();
        }

    } catch (error) {
        alert("Gagal terhubung ke sistem pembayaran.");
        btn.innerHTML = originalText;
        lucide.createIcons();
    }
}

function getActivePackageInfo() {
    // Helper untuk mengambil harga saat ini
    const priceText = document.getElementById('price-tag').innerText;
    return {
        price: parseInt(priceText.replace(/[^0-9]/g, ""))
    };
}

async function downloadPDF(mode) {
    const element = document.getElementById('preview-panel');
    const watermarks = document.querySelectorAll('.watermark');
    
    // Handle Watermark
    if (mode === 'premium') {
        watermarks.forEach(wm => wm.style.opacity = '0');
    } else {
        watermarks.forEach(wm => wm.style.opacity = '0.06');
    }

    const opt = {
        margin: 0,
        filename: mode === 'premium' ? `SIFURA_PRO_${Date.now()}.pdf` : `SIFURA_FREE_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 3, // Skala lebih tinggi untuk kualitas cetak profesional
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } finally {
        // Kembalikan ke tampilan normal
        watermarks.forEach(wm => wm.style.opacity = '0.06');
    }
}
// Update fungsi tab untuk mendukung 'template'
function tab(n, b) {
    // 1. Hapus status active dari semua tombol navigasi
    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
    
    // 2. Tambahkan status active ke tombol yang sedang diklik
    if (b) b.classList.add('active');

    // 3. SEMBUNYIKAN SEMUA TAB (Pastikan semua ID ada di sini)
    const allTabs = ['data', 'template', 'surat', 'berkas'];
    allTabs.forEach(id => {
        const el = document.getElementById('tab-' + id);
        if (el) {
            el.classList.add('hidden');
        }
    });

    // 4. TAMPILKAN TAB YANG DIPILIH
    const targetTab = document.getElementById('tab-' + n);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // 5. Logika tambahan untuk tab tertentu
    if (n === 'berkas') {
        renderChecklist();
    }
    
    // Render ulang icon Lucide agar muncul di tab yang baru dibuka
    lucide.createIcons(); 
}

// Fungsi baru untuk sinkronisasi antar dropdown template
function updateTemplateSelection(el) {
    // Set value ke hidden master input agar fungsi sync() tetap bekerja tanpa merubah kodenya
    document.getElementById('cv-template').value = el.value;
    
    // Reset visual dropdown satunya agar tidak membingungkan
    if (el.id === 'cv-template-ats') {
        document.getElementById('cv-template-creative').selectedIndex = -1;
    } else {
        document.getElementById('cv-template-ats').selectedIndex = -1;
    }
    
    sync(); // Jalankan render preview
}
function clearAllFiles() {
    if (confirm("Apakah Anda yakin ingin menghapus SEMUA berkas yang telah diunggah? Tindakan ini tidak dapat dibatalkan.")) {
        docs.forEach(doc => {
            if (doc.files && doc.files.length > 0) {
                doc.files.forEach(file => URL.revokeObjectURL(file.data));
                doc.files = [];
            }
        });
        unmatchedFiles = [];
        renderChecklist();
        renderUnmatched();
        sync();
        console.log("Semua berkas telah berhasil dihapus.");
    }
}


function toggleMobileView(m, btn) {
    document.querySelectorAll('.mobile-nav button').forEach(b => b.classList.remove('active-mobile'));
    btn.classList.add('active-mobile');
    const e = document.getElementById('editor-controls'), p = document.getElementById('preview-panel');
    if (m === 'edit') { e.style.display = 'flex'; p.style.display = 'none'; }
    else { e.style.display = 'none'; p.style.display = 'flex'; sync(); }
    lucide.createIcons();
}

function add(type) { store[type].push({ id: Date.now(), t: '', sub: '', s: '', extra: '', d: '' }); renderLists(type); }
function update(type, id, k, v) { const item = store[type].find(x => x.id === id); if (item) { item[k] = v; sync(); } }
function del(type, id) { store[type] = store[type].filter(x => x.id !== id); renderLists(type); sync(); }
function formatTanggalIndo(dateStr) { if (!dateStr) return ""; const d = new Date(dateStr); return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }

function handlePhoto(input) {
    if (input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { photo = e.target.result; sync(); };
        r.readAsDataURL(input.files[0]);
    }
}

let unmatchedFiles = [];

function handleSmartUpload(input) {
    if (!input.files || input.files.length === 0) return;

    const uploadedFiles = Array.from(input.files);
    let matchCount = 0;
    unmatchedFiles = [];

    uploadedFiles.forEach(file => {
        const fileName = file.name.toLowerCase();
        let matched = false;

        docs.forEach(doc => {
            const labelLower = doc.label.toLowerCase();
            const isProtected = labelLower.includes("surat lamaran") ||
                labelLower.includes("cv") ||
                labelLower.includes("riwayat hidup");
            if (isProtected) return;

            const stopWords = ["surat", "keterangan", "kartu", "tanda", "dokumen", "berkas"];
            const keywords = labelLower
                .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ')
                .split(/\s+/)
                .filter(k => k.length > 2 && !stopWords.includes(k));

            const isMatch = keywords.some(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                return regex.test(fileName);
            });

            if (isMatch && file.type.startsWith('image/')) {
                doc.files.push({
                    name: file.name,
                    data: URL.createObjectURL(file),
                    type: file.type
                });
                matched = true;
                matchCount++;
            }
        });

        if (!matched) {
            unmatchedFiles.push({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB'
            });
        }
    });

    renderChecklist();
    renderUnmatched();
    sync();
    input.value = '';
}

function renderUnmatched() {
    const container = document.getElementById('unmatched-container');
    const list = document.getElementById('unmatched-list');

    if (unmatchedFiles.length > 0) {
        container.classList.remove('hidden');
        list.innerHTML = unmatchedFiles.map((f, i) => `
            <div class="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-rose-100 shadow-sm">
                <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-rose-700 truncate max-w-[200px]">${f.name}</span>
                    <span class="text-[8px] text-rose-400 uppercase font-black">${f.size}</span>
                </div>
                <button onclick="removeUnmatched(${i})" class="text-rose-400 hover:text-rose-600 p-1">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
    } else {
        container.classList.add('hidden');
    }
    lucide.createIcons();
}

function removeUnmatched(index) {
    unmatchedFiles.splice(index, 1);
    renderUnmatched();
}

function renderLists(type) {
    const container = document.getElementById(`list-${type}`);
    container.innerHTML = store[type].map(item => {
        const subPlaceholder = (type === 'edu') ? 'Jurusan (Kosongkan buat isi SD/SMP)' : 'Posisi';
        const infoBox = (type === 'edu')
            ? `<input type="text" class="input-ui mb-2" placeholder="Nilai" value="${item.extra}" oninput="update('${type}',${item.id},'extra',this.value)">`
            : '';
        const gridClass = (type === 'edu') ? 'grid grid-cols-2 gap-2' : 'block';
        const titleCase = "this.value = this.value.replace(/(^\\w|\\s\\w)/g, m => m.toUpperCase())";
        const sentenceCase = "this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1)";

        return `
            <div class="card-item border-l-4 border-indigo-500 bg-white shadow-sm">
                <input type="text" class="input-ui mb-2 font-bold" placeholder="Instansi" 
                       value="${item.t}" 
                       oninput="${titleCase}; update('${type}',${item.id},'t',this.value)">
                
                <input type="text" class="input-ui mb-2 text-indigo-600" placeholder="${subPlaceholder}" 
                       value="${item.sub}" 
                       oninput="${sentenceCase}; update('${type}',${item.id},'sub',this.value)">
                
                <div class="${gridClass}">
                    <input type="text" class="input-ui mb-2" placeholder="Periode" 
                           value="${item.s}" 
                           oninput="${titleCase}; update('${type}',${item.id},'s',this.value)">
                    ${infoBox}
                </div>

                <textarea class="input-ui text-xs bg-slate-50" placeholder="Detail..." oninput="update('${type}',${item.id},'d',this.value)">${item.d}</textarea>
                <button onclick="del('${type}',${item.id})" class="text-rose-500 text-[10px] font-bold uppercase mt-1">Hapus</button>
            </div>`;
    }).join('');
}

function createPage(type = 'cv') {
    const p = document.createElement('div'); 
    p.className = `page ${type}-page`;
    
    // Ambil tema aktif
    const activeTheme = document.getElementById('cv-template').value;
    p.setAttribute('data-theme', activeTheme);
    
    // 1. Buat Container Watermark
    const wm = document.createElement('div');
    wm.className = 'watermark';
    
    // 2. Isi Watermark (Contoh: SIFURA CV)
    // Anda bisa menyesuaikan jumlah baris dan teks di sini
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'wm-row';
        row.innerHTML = `
            <span class="wm-text">SIFURA CV</span>
            <span class="wm-text">SIFURA CV</span>
            <span class="wm-text">SIFURA CV</span>
        `;
        wm.appendChild(row);
    }
    
    // 3. Masukkan Watermark dan Vessel ke dalam Page
    p.appendChild(wm);
    p.innerHTML += `<div class="vessel"></div>`;
    
    document.getElementById('preview-panel').appendChild(p);
    return p.querySelector('.vessel');
}

let currentVessel;
const PAGE_MAX_PX = 1055;

function appendSmart(html) {
    const wrapper = document.createElement('div'); wrapper.innerHTML = html;
    const elements = Array.from(wrapper.childNodes);
    elements.forEach(el => {
        if (el.nodeName === 'UL') {
            const listItems = Array.from(el.querySelectorAll('li'));
            let newList = document.createElement('ul'); newList.className = 'cv-list'; currentVessel.appendChild(newList);
            listItems.forEach(li => {
                newList.appendChild(li);
                if (currentVessel.offsetHeight > PAGE_MAX_PX) {
                    newList.removeChild(li); currentVessel = createPage('cv');
                    newList = document.createElement('ul'); newList.className = 'cv-list'; currentVessel.appendChild(newList); newList.appendChild(li);
                }
            });
        } else if (el.nodeType === 1) {
            currentVessel.appendChild(el);
            if (currentVessel.offsetHeight > PAGE_MAX_PX) {
                currentVessel.removeChild(el); currentVessel = createPage('cv'); currentVessel.appendChild(el);
            }
        }
    });
}

// Update fungsi parseBullets di script.js
function parseBullets(text) {
    if (!text || !text.trim()) return "";
    const items = text.split('\n').filter(line => line.trim() !== "");
    
    // Gunakan class agar mengikuti aturan di style.css
    return `<ul class="cv-list">${items.map(i => {
        let cleanText = i.replace(/^•\s*/, '').trim();
        let formattedText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
        return `<li>${formattedText}</li>`;
    }).join('')}</ul>`;
}

function addManualDoc() {
    const input = document.getElementById('manual-file-name');
    if (!input.value.trim()) return;
    docs.push({ id: Date.now(), label: input.value, files: [], checked: true });
    input.value = "";
    renderChecklist();
    sync();
}
function updateLayout(val) {
    document.getElementById('cv-layout').value = val;
    document.querySelectorAll('.layout-btn').forEach(b => {
        b.classList.remove('active', 'border-indigo-600', 'bg-indigo-50');
    });
    const activeBtn = document.getElementById(`btn-${val}`);
    activeBtn.classList.add('active', 'border-indigo-600', 'bg-indigo-50');
    sync();
}

async function sync() {
    const layout = document.getElementById('cv-layout').value;
    const selectedTheme = document.getElementById('cv-template').value;
    const preview = document.getElementById('preview-panel'); 
    preview.innerHTML = "";
    const nameVal = document.getElementById('in-name').value;

    // --- 1. HALAMAN SURAT ---
    if (document.getElementById('cl-toggle').checked) {
        let v = createPage('surat');
        const city = document.getElementById('cl-city').value;
        const dateStr = document.getElementById('cl-date-toggle').checked ? formatTanggalIndo(new Date()) : '';
        v.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:40px">
                <div>Hal: Lamaran Pekerjaan</div>
                <div>${city ? city + ', ' : ''}${dateStr}</div>
            </div>
            <div style="white-space:pre-line; text-align:justify;">${document.getElementById('cl-body').value || ''}</div>
            <div style="margin-top:60px">Hormat saya,<br><br><br><br><b>${nameVal || '(Nama Lengkap)'}</b></div>
        `;
    }

    // --- 2. HALAMAN CV ---
    if (document.getElementById('cv-toggle').checked) {
        // Reset state awal
        const isPhotoActive = document.getElementById('photo-toggle').checked;
        const nameVal = document.getElementById('in-name').value;
        const pob = document.getElementById('in-pob').value;
        const dob = document.getElementById('in-dob').value;
        const dStr = dob ? new Date(dob).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        
        const infoParts = [];
        if (pob || dStr) infoParts.push(`${pob || ''}${pob && dStr ? ', ' : ''}${dStr}`);
        if (document.getElementById('in-tb').value) infoParts.push(`TB: ${document.getElementById('in-tb').value}cm`);
        if (document.getElementById('in-bb').value) infoParts.push(`BB: ${document.getElementById('in-bb').value}kg`);
        if (document.getElementById('in-status').value) infoParts.push(document.getElementById('in-status').value);

        // Template HTML Header (Hanya didefinisikan satu kali)
        const commonHeaderHtml = `
            <div id="cv-header-section" style="display:flex; ${isPhotoActive ? 'flex-direction:row;' : 'flex-direction:column;'} align-items:center; gap:25px; margin-bottom:20px; width:100%;">
                ${isPhotoActive ? `<div style="width:30mm; height:40mm; background:#fafafa; border:1px solid #eee; overflow:hidden; flex-shrink:0;">${photo ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover">` : ''}</div>` : ''}
                <div style="flex:1; display:flex; flex-direction:column; ${isPhotoActive ? 'text-align:left; align-items:flex-start' : 'text-align:center; align-items:center'}; width:100%;">
                    <h1 style="font-family: 'Times New Roman', serif !important; font-size:24pt !important; font-weight:bold; margin-bottom:4px; color:#000;">${nameVal || ''}</h1>
                    <div style="font-family: 'Times New Roman', serif !important; font-size:11pt !important; color:#000; margin-bottom:8px;">${infoParts.join(' • ')}</div>
                    <div style="display:flex; flex-direction:column; gap:4px; ${isPhotoActive ? 'align-items:flex-start' : 'align-items:center'};">
                        <div style="display:flex; flex-wrap:wrap; gap:15px; ${isPhotoActive ? '' : 'justify-content:center'}">
                            ${document.getElementById('in-wa').value ? `<div class="contact-item"><span>${document.getElementById('in-wa').value}</span></div>` : ''}
                            ${document.getElementById('in-email').value ? `<div class="contact-item"><span>${document.getElementById('in-email').value}</span></div>` : ''}
                        </div>
                        ${document.getElementById('in-address').value ? `<div class="contact-item"><span>${document.getElementById('in-address').value}</span></div>` : ''}
                    </div>
                </div>
            </div>`;

        if (layout === '2-col') {
            let pages = [];
            
            const getPageVessel = (idx) => {
                if (pages[idx]) return pages[idx];
                
                const vesselEl = createPage('cv');
                vesselEl.closest('.page').setAttribute('data-layout', '2-col');
                vesselEl.closest('.page').setAttribute('data-theme', selectedTheme);
                vesselEl.innerHTML = ""; 

                // Header hanya muncul di Halaman 1 (idx 0)
                if (idx === 0) {
                    vesselEl.innerHTML = commonHeaderHtml;
                }

                const grid = document.createElement('div');
                grid.className = 'cv-grid-container';
                grid.style.marginTop = "0";
                
                const leftCol = document.createElement('div');
                leftCol.className = 'cv-col-left';
                const rightCol = document.createElement('div');
                rightCol.className = 'cv-col-right';
                
                grid.appendChild(leftCol);
                grid.appendChild(rightCol);
                vesselEl.appendChild(grid);
                
                pages[idx] = { vessel: vesselEl, left: leftCol, right: rightCol };
                return pages[idx];
            };

            const getContentHeight = (pageObj) => {
                let total = 0;
                Array.from(pageObj.vessel.children).forEach(child => {
                    total += child.getBoundingClientRect().height;
                });
                return total;
            };

           const smartFill = (html, targetSide) => {
    let currentPageIdx = 0;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const elements = Array.from(wrapper.childNodes);

    elements.forEach(el => {
        let page = getPageVessel(currentPageIdx);
        let targetCol = page[targetSide];

        if (el.nodeName === 'UL') {
            // Jika elemen adalah list, pecah itemnya satu per satu
            const items = Array.from(el.querySelectorAll('li'));
            let newList = document.createElement('ul');
            newList.className = 'cv-list';
            targetCol.appendChild(newList);

            items.forEach(li => {
                newList.appendChild(li);
                // Cek jika setelah tambah satu LI, halaman penuh
                if (getContentHeight(page) > 1030) {
                    newList.removeChild(li); // Tarik kembali
                    currentPageIdx++; // Pindah halaman
                    page = getPageVessel(currentPageIdx);
                    targetCol = page[targetSide];
                    
                    // Buat UL baru di halaman baru
                    newList = document.createElement('ul');
                    newList.className = 'cv-list';
                    targetCol.appendChild(newList);
                    newList.appendChild(li);
                }
            });
        } else if (el.nodeType === 1) {
            // Untuk elemen biasa (seperti judul atau teks profil)
            targetCol.appendChild(el);
            if (getContentHeight(page) > 1030) {
                targetCol.removeChild(el);
                currentPageIdx++;
                page = getPageVessel(currentPageIdx);
                page[targetSide].appendChild(el);
            }
        }
    });
};

            // Isi Konten Kolom Kiri
            let leftHtml = "";
            if (document.getElementById('in-about').value) {
                leftHtml += `<div class="section-title" style="margin-top:0;">Profil</div><div class="cv-profile-text">${document.getElementById('in-about').value}</div>`;
            }
            if (document.getElementById('in-skills').value) {
                leftHtml += `<div class="section-title">Keahlian</div>` + parseBullets(document.getElementById('in-skills').value);
            }
            if (document.getElementById('in-langs').value) {
                leftHtml += `<div class="section-title">Bahasa</div>` + parseBullets(document.getElementById('in-langs').value);
            }
            smartFill(leftHtml, 'left');

            // Isi Konten Kolom Kanan
            let rightHtml = "";
            const cats = [{ k: 'edu', l: 'Pendidikan' }, { k: 'work', l: 'Pengalaman Kerja' }, { k: 'org', l: 'Organisasi' }, { k: 'cert', l: 'Sertifikasi' }];
            cats.forEach(c => {
                if (store[c.k].length > 0) {
                    rightHtml += `<div class="section-title">${c.l}</div>`;
                    store[c.k].forEach(i => {
                        rightHtml += `<div style="margin-bottom:12px; page-break-inside:avoid;">
                            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                <div style="font-weight:800; font-size:11pt;">${i.t}</div> 
                                <span style="font-size:11pt; font-weight:700; color:#64748b;">${i.s}</span>
                            </div>
                            <div class="sub-title-italic" style="font-weight:700; font-size:11pt; font-style: italic; margin-top:-1px;">${i.sub} ${i.extra ? '| ' + i.extra : ''}</div>
                            ${parseBullets(i.d)}
                        </div>`;
                    });
                }
            });
            smartFill(rightHtml, 'right');

        } else {
            // Layout 1 Kolom (Standar)
            currentVessel = createPage('cv');
            currentVessel.closest('.page').setAttribute('data-layout', '1-col');
            currentVessel.closest('.page').setAttribute('data-theme', selectedTheme);
            currentVessel.innerHTML = commonHeaderHtml;

            if (document.getElementById('in-about').value) {
                appendSmart(`<div class="section-title">Profil Profesional</div><div class="cv-profile-text">${document.getElementById('in-about').value}</div>`);
            }
            const cats = [{ k: 'edu', l: 'Pendidikan' }, { k: 'work', l: 'Pengalaman Kerja' }, { k: 'org', l: 'Organisasi' }, { k: 'cert', l: 'Sertifikasi' }];
            cats.forEach(c => {
                if (store[c.k].length > 0) {
                    appendSmart(`<div class="section-title">${c.l}</div>`);
                    store[c.k].forEach(i => {
                        appendSmart(`<div style="margin-bottom:1px; page-break-inside:avoid;">
                        <div style="display:flex; justify-content:space-between; align-items:baseline;">
                            <div style="font-weight:800; font-size:11pt;">${i.t}</div> 
                            <span style="font-size:11pt; font-weight:700; color:#64748b;">${i.s}</span>
                        </div>
                        <div class="sub-title-italic" style="font-weight:700; font-size:11pt; font-style: italic; margin-top:-1px;">${i.sub} ${i.extra ? '| ' + i.extra : ''}</div>
                    </div>` + parseBullets(i.d));
                    });
                }
            });
            if (document.getElementById('in-skills').value) appendSmart(`<div class="section-title">Keahlian</div>` + parseBullets(document.getElementById('in-skills').value));
            if (document.getElementById('in-langs').value) appendSmart(`<div class="section-title">Bahasa</div>` + parseBullets(document.getElementById('in-langs').value));
        }
    }

    if (document.getElementById('docs-toggle').checked) {
        docs.filter(d => {
            const isSystemPage = d.label.toLowerCase().includes("surat lamaran") ||
                d.label.toLowerCase().includes("cv") ||
                d.label.toLowerCase().includes("riwayat hidup");
            return d.checked && !isSystemPage;
        }).forEach(d => {
            if (d.files.length > 0) {
                d.files.forEach((file, index) => {
                    let v = createPage('cv');
                    let contentHtml = "";
                    if (file.type.startsWith('image/')) {
                        const labelHalaman = d.files.length > 1 ? ` (Halaman ${index + 1})` : "";
                        contentHtml = `
                        <div style="display:flex; align-items:center; justify-content:center; width:100%; min-height:850px; padding-top:10px;">
                            <img src="${file.data}" style="max-width:100%; max-height:950px; object-fit:contain; border:1px solid #e2e8f0; border-radius:4px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        </div>`;
                        v.innerHTML = `
                        <div class="section-title" style="border-left: 5px solid #4f46e5; padding-left:15px; margin-bottom:20px;">
                            ${d.label}${labelHalaman}
                        </div>
                        ${contentHtml}
                    `;
                    }
                });
            } else {
                let v = createPage('cv');
                v.innerHTML = `
                <div class="section-title" style="border-left: 5px solid #4f46e5; padding-left:15px; margin-bottom:25px;">
                    ${d.label}
                </div>
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:850px; border: 2px dashed #e2e8f0; border-radius:20px; background:#fafafa; color:#cbd5e1;">
                    <i data-lucide="file-text" style="width:60px; height:60px; margin-bottom:20px; opacity:0.2;"></i>
                    <h2 style="font-weight:900; font-size:22pt; text-transform:uppercase; letter-spacing:4px;">${d.label}</h2>
                    <p style="font-size:10pt; color:#94a3b8; font-weight:600; margin-top:10px;">BELUM ADA BERKAS YANG DIUNGGAH</p>
                </div>
            `;
                lucide.createIcons();
            }
        });
    }
}

function applyLetterTemplate() {
    const name = document.getElementById('in-name').value || '(Nama Lengkap Anda)';
    const template = `Yth. Bapak/Ibu HRD Manager\nPT. Nama Perusahaan Tujuan / hapus jika untuk melamar banyak perusahaan\nDi Tempat / diganti dengan alamat perusahaan jika di isi nama instansi\n\nDengan hormat,\n\nMelalui surat ini, saya bermaksud untuk melamar pekerjaan di perusahaan yang Bapak/Ibu pimpin untuk posisi yang tersedia. Berdasarkan latar belakang pendidikan dan pengalaman kerja yang saya miliki, saya yakin dapat memberikan kontribusi positif bagi perusahaan.\n\nSaya memiliki memiliki motivasi tinggi untuk mempelajari hal baru. Saya adalah pribadi yang disiplin, jujur, serta mampu bekerja baik secara mandiri maupun dalam tim.\n\nBersama surat ini saya lampirkan Curriculum Vitae (CV) dan dokumen pendukung lainnya sebagai bahan pertimbangan. Besar harapan saya untuk diberikan kesempatan wawancara guna menjelaskan kualifikasi saya lebih mendalam.\n\nDemikian surat lamaran ini saya sampaikan. Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.`;
    document.getElementById('cl-body').value = template;
    sync();
}

function clearLetter() {
    document.getElementById('cl-body').value = "";
    sync();
}

function toggleDemoData() {
    const btn = document.getElementById('demo-toggle-btn');
    
    if (!isDemoActive) {
        // --- 1. DATA IDENTITAS ---
        document.getElementById('in-name').value = "HERI ARIYANTO, S.KOM.";
        document.getElementById('in-pob').value = "Pemalang";
        document.getElementById('in-dob').value = "1995-08-17";
        document.getElementById('in-tb').value = "175";
        document.getElementById('in-bb').value = "68";
        document.getElementById('in-status').value = "Belum Menikah";
        document.getElementById('in-wa').value = "0812-3456-7890";
        document.getElementById('in-email').value = "heri.ariyanto@email.com";
        document.getElementById('in-address').value = "Jl. Taman Selatan No. 45, RT 02/RW 05, Kelurahan Beji, Kecamatan Taman, Kabupaten Pemalang, Jawa Tengah 52361";
        
        // PROFIL PROFESIONAL (Dibuat sangat naratif dan teknis)
        document.getElementById('in-about').value = "Profesional Teknologi Informasi yang berdedikasi dengan pengalaman lebih dari 6 tahun dalam arsitektur jaringan, administrasi sistem server enterprise, dan manajemen keamanan siber. Memiliki rekam jejak yang terbukti dalam merancang solusi infrastruktur IT yang skalabel untuk mendukung pertumbuhan bisnis yang dinamis. Ahli dalam konfigurasi perangkat keras Cisco dan MikroTik, manajemen pusat data (Data Center), serta implementasi teknologi virtualisasi tingkat lanjut. Saya memiliki kemampuan kepemimpinan tim teknis yang kuat, komunikasi yang efektif untuk menjembatani kebutuhan teknis dengan tujuan bisnis, dan komitmen tinggi terhadap standar operasional prosedur yang ketat demi menjaga integritas data serta ketersediaan sistem selama 24/7.";

        // --- 2. SURAT LAMARAN (Otomatis Terisi) ---
        document.getElementById('cl-city').value = "Pemalang";
        document.getElementById('cl-date-toggle').checked = true;
        applyLetterTemplate();

        // --- 3. PENDIDIKAN (Dibuat 3 Entry agar memakan ruang) ---
        store.edu = [
            {
                id: Date.now() + 1,
                t: 'Universitas Dian Nuswantoro (UDINUS)',
                sub: 'Sarjana Komputer - Teknik Informatika',
                s: '2014 - 2018',
                extra: 'IPK: 3.88 / 4.00 (Cumlaude)',
                d: '• Konsentrasi pada Keamanan Informasi dan Manajemen Jaringan Komputer.\n• Ketua Himpunan Mahasiswa Teknik Informatika (HMTI) periode 2016-2017.\n• Meraih penghargaan skripsi terbaik tingkat fakultas dengan fokus penelitian pada optimasi protokol routing dinamis.\n• Aktif sebagai Asisten Laboratorium untuk mata kuliah Sistem Operasi dan Jaringan Komputer.'
            },
            {
                id: Date.now() + 2,
                t: 'SMK Negeri 1 Pemalang',
                sub: 'Teknik Komputer dan Jaringan (TKJ)',
                s: '2011 - 2014',
                extra: 'Peringkat 1 Umum',
                d: '• Juara 1 Lomba Kompetensi Siswa (LKS) IT Network System Administration tingkat Provinsi Jawa Tengah.\n• Tersertifikasi secara internasional melalui program Cisco Networking Academy (NetAcad).\n• Memimpin proyek peremajaan infrastruktur jaringan laboratorium sekolah sebagai bagian dari tugas akhir.'
            }
        ];

        // --- 4. PENGALAMAN KERJA (Sangat Detail untuk memaksa Page Break) ---
        store.work = [
            {
                id: Date.now() + 3,
                t: 'PT. Infrastruktur Digital Nusantara Tbk.',
                sub: 'Lead Network & Security Engineer',
                s: 'Januari 2021 - Sekarang',
                d: '• Bertanggung jawab penuh atas operasional dan keamanan jaringan backbone di 15 kantor operasional regional.\n• Merancang strategi Disaster Recovery Plan (DRP) yang berhasil mengurangi waktu pemulihan sistem (RTO) hingga 50%.\n• Mengelola anggaran pengadaan perangkat IT tahunan senilai Rp 2 Miliar dengan fokus pada efisiensi biaya vendor.\n• Mengimplementasikan teknologi Software-Defined Networking (SDN) untuk otomatisasi manajemen lalu lintas data.\n• Melakukan penetration testing secara berkala dan hardening pada lebih dari 50 server Linux dan Windows.\n• Mengawasi tim technical support tingkat 2 dan 3 dalam penyelesaian insiden jaringan berskala prioritas tinggi.'
            },
            {
                id: Date.now() + 4,
                t: 'Global Solution Technology Indonesia',
                sub: 'Senior Systems Administrator',
                s: 'Juni 2018 - Desember 2020',
                d: '• Mengelola manajemen server virtual menggunakan VMware vSphere dengan total 200+ Virtual Machines (VM).\n• Mengotomatisasi proses deployment aplikasi menggunakan Jenkins dan Docker untuk mempercepat siklus rilis produk.\n• Membangun sistem monitoring infrastruktur terpadu menggunakan Prometheus dan Grafana untuk deteksi dini masalah.\n• Mengelola infrastruktur cloud hybrid (AWS & On-Premise) untuk memastikan skalabilitas aplikasi selama jam sibuk.\n• Mengatur kebijakan backup data berkala dan pemulihan data untuk menjamin kelangsungan bisnis tanpa kehilangan data.'
            },
            {
                id: Date.now() + 5,
                t: 'PT. Media Data Komunika',
                sub: 'IT Support & Network Technician',
                s: 'Januari 2017 - Mei 2018',
                d: '• Melakukan instalasi kabel struktural (FO & UTP) serta konfigurasi perangkat end-user untuk klien korporat.\n• Memberikan dukungan teknis on-site dan remote untuk penyelesaian masalah konektivitas internet dan intranet.\n• Melakukan pemeliharaan rutin pada perangkat UPS dan sistem pendingin ruang server demi menjaga stabilitas hardware.'
            }
        ];

        // --- 5. ORGANISASI & SERTIFIKASI (Tambahan volume teks) ---
        store.org = [
            {
                id: Date.now() + 6,
                t: 'Asosiasi Teknisi Jaringan Indonesia (ATJI)',
                sub: 'Ketua Bidang Pengembangan Kompetensi',
                s: '2022 - Sekarang',
                d: '• Menyelenggarakan sertifikasi nasional bagi 500+ tenaga kerja IT di wilayah Jawa Tengah.'
            }
        ];
        store.cert = [
            {
                id: Date.now() + 7,
                t: 'Cisco Certified Network Professional (CCNP) Enterprise',
                sub: 'Cisco Systems Inc.',
                s: '2023',
                d: 'Sertifikasi tingkat profesional dalam desain dan implementasi jaringan skala luas (WAN).'
            },
            {
                id: Date.now() + 8,
                t: 'Certified Ethical Hacker (CEH)',
                sub: 'EC-Council',
                s: '2021',
                d: 'Validasi kemampuan dalam mengidentifikasi kerentanan dan mengamankan sistem dari serangan siber.'
            }
        ];

        // --- 6. KEAHLIAN & BAHASA ---
        document.getElementById('in-skills').value = "Advanced Networking (Cisco, Juniper, MikroTik)\nServer Virtualization (VMware, Proxmox, Hyper-V)\nCloud Infrastructure (AWS, Google Cloud, Azure)\nAutomation & Scripting (Python, Bash, Ansible)\nNetwork Security & Firewall Management\nDatabase Administration (SQL, NoSQL)\nIT Service Management (ITIL Foundation)";
        document.getElementById('in-langs').value = "Bahasa Indonesia (Lisan & Tulisan - Sangat Aktif)\nBahasa Inggris (Professional & Technical - Aktif)\nBahasa Jepang (Percakapan Dasar - Pasif)";

        // AKTIFKAN CHECKBOX
        document.getElementById('cv-toggle').checked = true;
        document.getElementById('cl-toggle').checked = true;
        document.getElementById('docs-toggle').checked = true;

        btn.innerText = "Hapus Contoh";
        btn.classList.replace('bg-indigo-600', 'bg-rose-600');
        isDemoActive = true;

    } else {
        // RESET TOTAL (Tanpa reload)
        const inputs = document.querySelectorAll('.input-ui, #cl-city');
        inputs.forEach(input => input.value = "");
        store = { work: [], edu: [], org: [], cert: [] };
        photo = null;
        
        document.getElementById('cv-toggle').checked = false;
    document.getElementById('cl-toggle').checked = false;
    document.getElementById('docs-toggle').checked = false;
    document.getElementById('photo-toggle').checked = false;
    document.getElementById('cl-date-toggle').checked = false;
        btn.innerText = "Isi Contoh";
        btn.classList.replace('bg-rose-600', 'bg-indigo-600');
        isDemoActive = false;
    }

    // UPDATE UI
    renderLists('edu');
    renderLists('work');
    renderLists('org');
    renderLists('cert');
    sync(); 
}

function uploadToCategory(index, input) {
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            docs[index].files.push({
                name: file.name,
                data: URL.createObjectURL(file),
                type: file.type
            });
        } else {
            alert(`File "${file.name}" ditolak. Sistem saat ini hanya mendukung format gambar (JPG/PNG).`);
        }
    });
    input.value = '';
    renderChecklist();
    sync();
}

function resetData() { if (confirm("Reset semua?")) location.reload(); }

function renderChecklist() {
    const container = document.getElementById('checklist-ui');
    container.innerHTML = docs.map((d, i) => {
        const isProtected = d.label.toLowerCase().includes("surat lamaran") || d.label.toLowerCase().includes("cv");
        const hasFiles = d.files.length > 0;
        return `
        <div class="p-5 border rounded-2xl bg-white shadow-sm transition-all ${d.checked ? 'border-indigo-200' : 'opacity-50'}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex gap-3">
                    <input type="checkbox" class="custom-checkbox mt-1" ${d.checked ? 'checked' : ''} 
                        onchange="docs[${i}].checked=this.checked; sync(); renderChecklist();">
                    <div>
                        <div class="text-[11px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                            ${d.label}
                            ${isProtected ? '<i data-lucide="lock" class="w-3 h-3 text-indigo-400"></i>' : ''}
                        </div>
                        <p class="text-[9px] font-bold ${isProtected ? 'text-indigo-400' : (hasFiles ? 'text-emerald-500' : 'text-slate-400')}">
                            ${isProtected ? 'Dihasilkan oleh sistem' : (hasFiles ? `✓ ${d.files.length} Berkas Berhasil Diunggah` : 'Belum ada dokumen')}
                        </p>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="moveDoc(${i}, -1)" class="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><i data-lucide="chevron-up" class="w-4 h-4"></i></button>
                    <button onclick="moveDoc(${i}, 1)" class="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><i data-lucide="chevron-down" class="w-4 h-4"></i></button>
                    ${!isProtected ? `<button onclick="removeDoc(${i})" class="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
                </div>
            </div>
            ${!isProtected ? `
                <div onclick="document.getElementById('file-input-${d.id}').click()" 
                     class="border-2 border-dashed ${hasFiles ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'} 
                            p-3 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                    <input type="file" id="file-input-${d.id}" class="hidden" multiple onchange="uploadToCategory(${i}, this)">
                    <div class="flex items-center justify-center gap-2">
                        <i data-lucide="upload-cloud" class="w-4 h-4 ${hasFiles ? 'text-emerald-400' : 'text-slate-400'} group-hover:text-indigo-500"></i>
                        <span class="text-[9px] font-black uppercase ${hasFiles ? 'text-emerald-600' : 'text-slate-500'} group-hover:text-indigo-600">
                            ${hasFiles ? 'Tambah Berkas Lagi' : 'Pilih Berkas Manual'}
                        </span>
                    </div>
                </div>
            ` : ''}
            ${!isProtected && hasFiles ? `
                <div class="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                    ${d.files.map((f, fi) => `
                        <div class="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200">
                            <i data-lucide="file-image" class="w-3 h-3 text-indigo-500"></i>
                            <span class="text-[8px] font-bold text-slate-600 truncate max-w-[120px]">${f.name}</span>
                            <button onclick="removeFile(${i}, ${fi})" class="hover:bg-rose-50 p-0.5 rounded text-rose-500">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>`;
    }).join('');
    lucide.createIcons();
}

function moveDoc(idx, step) {
    const target = idx + step;
    if (target >= 0 && target < docs.length) {
        [docs[idx], docs[target]] = [docs[target], docs[idx]];
        renderChecklist(); sync();
    }
}

function removeDoc(idx) {
    if (confirm("Hapus kategori ini?")) { docs.splice(idx, 1); renderChecklist(); sync(); }
}

function removeFile(dIdx, fIdx) {
    docs[dIdx].files.splice(fIdx, 1);
    renderChecklist(); sync();
}

sync();