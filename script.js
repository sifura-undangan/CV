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

function tab(n, b) {
    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
    if (b) b.classList.add('active');
    ['data', 'surat', 'berkas'].forEach(id => {
        const el = document.getElementById('tab-' + id);
        if (el) el.classList.add('hidden');
    });
    document.getElementById('tab-' + n).classList.remove('hidden');
    if (n === 'berkas') renderChecklist();
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
    
    // AMBIL TEMA DARI DROPDOWN SEBELUM HALAMAN DIBUAT
    const activeTheme = document.getElementById('cv-template').value;
    p.setAttribute('data-theme', activeTheme);
    
    // Logika watermark dan vessel tetap sama
    p.innerHTML = `<div class="vessel"></div>`;
    // ... (Watermark Logic) ...
    
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

function parseBullets(text) {
    if (!text || !text.trim()) return "";
    const items = text.split('\n').filter(line => line.trim() !== "");
    
    // Memberikan inline style untuk menjamin ukuran 11pt
    return `<ul class="cv-list">${items.map(i => {
        let cleanText = i.replace(/^•\s*/, '').trim();
        let formattedText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
        return `<li style="font-size: 11pt !important;">${formattedText}</li>`;
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

async function sync() {
    
    const selectedTheme = document.getElementById('cv-template').value;
    // ... (Logika render data seperti biasa) ...

    // FORCE UPDATE: Pastikan semua halaman (Halaman 1, 2, dst) punya atribut tema yang sama
    document.querySelectorAll('.page').forEach(page => {
        page.setAttribute('data-theme', selectedTheme);
    });const preview = document.getElementById('preview-panel'); preview.innerHTML = "";
    const nameVal = document.getElementById('in-name').value;

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

    if (document.getElementById('cv-toggle').checked) {
        currentVessel = createPage('cv');
        
        const isPhotoActive = document.getElementById('photo-toggle').checked;
        const infoParts = [];
        const pob = document.getElementById('in-pob').value;
        const dob = document.getElementById('in-dob').value;
        const dStr = dob ? new Date(dob).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

        if (pob || dStr) infoParts.push(`${pob || ''}${pob && dStr ? ', ' : ''}${dStr}`);
        if (document.getElementById('in-tb').value) infoParts.push(`TB: ${document.getElementById('in-tb').value}cm`);
        if (document.getElementById('in-bb').value) infoParts.push(`BB: ${document.getElementById('in-bb').value}kg`);
        if (document.getElementById('in-status').value) infoParts.push(document.getElementById('in-status').value);

        let headerHtml = `<div style="display:flex; ${isPhotoActive ? 'flex-direction:row;' : 'flex-direction:column;'} align-items:center; gap:25px; margin-bottom:12px; width:100%;">
    ${isPhotoActive ? `<div style="width:30mm; height:40mm; background:#fafafa; border:1px solid #eee; overflow:hidden; flex-shrink:0;">${photo ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover">` : ''}</div>` : ''}
    <div style="flex:1; display:flex; flex-direction:column; ${isPhotoActive ? 'text-align:left; align-items:flex-start' : 'text-align:center; align-items:center'}; width:100%;">
        <h1 style="font-size:26pt; font-weight:900; margin-top:-5px; margin-bottom:4px; color:#0f172a;">${nameVal || ''}</h1>
        <div style="font-size:11pt; color:#64748b; font-weight:600; margin-bottom:8px;">${infoParts.join(' • ')}</div>
        
        <div style="display:flex; flex-direction:column; gap:4px; ${isPhotoActive ? 'align-items:flex-start' : 'align-items:center'};">
            <div style="display:flex; flex-wrap:wrap; gap:15px; ${isPhotoActive ? '' : 'justify-content:center'}">
                ${document.getElementById('in-wa').value ? `
                    <div class="contact-item">
                        <i data-lucide="phone" class="cv-icon"></i>
                        <span>${document.getElementById('in-wa').value}</span>
                    </div>` : ''}
                
                ${document.getElementById('in-email').value ? `
                    <div class="contact-item">
                        <i data-lucide="mail" class="cv-icon"></i>
                        <span>${document.getElementById('in-email').value}</span>
                    </div>` : ''}
            </div>

            ${document.getElementById('in-address').value ? `
                <div class="contact-item">
                    <i data-lucide="map-pin" class="cv-icon"></i>
                    <span>${document.getElementById('in-address').value}</span>
                </div>` : ''}
        </div>
    </div>
</div>`;
        currentVessel.innerHTML = headerHtml;

        if (document.getElementById('in-about').value) appendSmart(`<div class="section-title">Profil Profesional</div><div style="text-align:justify;">${document.getElementById('in-about').value}</div>`);
        const cats = [{ k: 'edu', l: 'Pendidikan' }, { k: 'work', l: 'Pengalaman Kerja' }, { k: 'org', l: 'Organisasi' }, { k: 'cert', l: 'Sertifikasi' }];
        cats.forEach(c => {
            if (store[c.k].length > 0) {
                appendSmart(`<div class="section-title">${c.l}</div>`);
                store[c.k].forEach(i => {
                    appendSmart(`<div style="margin-bottom:1px; page-break-inside:avoid;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><div style="font-weight:800; font-size:11pt;">${i.t}</div> <span style="font-size:9pt; font-weight:700; color:#64748b;">${i.s}</span></div><div style="color:#4f46e5; font-weight:700; font-size:10.5pt; margin-top:-1px;">${i.sub} ${i.extra ? '| ' + i.extra : ''}</div></div>` + parseBullets(i.d));
                });
            }
        });
        if (document.getElementById('in-skills').value) appendSmart(`<div class="section-title">Keahlian</div>` + parseBullets(document.getElementById('in-skills').value));
        if (document.getElementById('in-langs').value) appendSmart(`<div class="section-title">Bahasa</div>` + parseBullets(document.getElementById('in-langs').value));
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
        document.getElementById('in-name').value = "HERI ARIYANTO, S.KOM.";
        document.getElementById('in-pob').value = "Pemalang";
        document.getElementById('in-dob').value = "1945-08-17";
        document.getElementById('in-tb').value = "172";
        document.getElementById('in-bb').value = "64";
        document.getElementById('in-status').value = "Belum Menikah";
        document.getElementById('in-wa').value = "0812-3456-7890";
        document.getElementById('in-email').value = "yangbeneraja@email.com";
        document.getElementById('in-address').value = "Jl. Jalan ke Pemalang No. 12, Kel. Taman, Kec. Taman, Jawa Tengah";
        document.getElementById('in-about').value = "Lulusan SMK Jurusan Teknik Komputer dan Jaringan yang berdedikasi tinggi dengan keahlian teknis dalam infrastruktur jaringan dan administrasi server. Memiliki pengalaman Praktik Kerja Lapangan (PKL) yang solid dalam menangani troubleshooting perangkat keras dan lunak di lingkungan korporat. Terbiasa bekerja dengan target waktu yang ketat, memiliki kemampuan komunikasi yang baik, serta jujur dan disiplin dalam menjalankan tugas profesional.";

        document.getElementById('cv-toggle').checked = true;
        document.getElementById('cl-toggle').checked = true;
        document.getElementById('docs-toggle').checked = true;

        document.getElementById('cl-city').value = "Pemalang";
        document.getElementById('cl-date-toggle').checked = true;
        applyLetterTemplate();

        store.edu = [{
            id: Date.now() + 1,
            t: 'SMK PGRI 2 Taman',
            sub: 'Teknik Komputer dan Jaringan (TKJ)',
            s: '2023 - 2026',
            extra: 'Nilai Rata-rata: 100',
            d: '• Fokus Studi: Administrasi Sistem Jaringan, Teknologi Layanan Jaringan, dan Keamanan Jaringan.\n• Peringkat 3 Besar Paralel selama 5 semester berturut-turut.\n• Aktif sebagai asisten laboratorium komputer untuk membantu instalasi praktikum siswa kelas 10.'
        }];

        store.work = [{
            id: Date.now() + 2,
            t: 'PT. Teknologi Digital Nusantara (Program PKL)',
            sub: 'Junior Network Technician',
            s: 'Januari 2025 - April 2025',
            d: '• Melakukan instalasi dan konfigurasi 45+ titik akses jaringan kabel (UTP) dan nirkabel (Wi-Fi).\n• Membantu tim infrastruktur dalam migrasi data server lokal ke sistem cloud secara bertahap.\n• Melakukan perawatan rutin (preventive maintenance) pada unit PC, laptop, dan printer di seluruh divisi.\n• Mendokumentasikan inventaris perangkat IT perusahaan menggunakan sistem database internal.\n• Berhasil menyelesaikan 95% tiket komplain pengguna terkait masalah konektivitas dalam waktu kurang dari 2 jam.'
        }, {
            id: Date.now() + 3,
            t: 'Lab Komputer SMKN 1 Pemalang',
            sub: 'Technical Support Intern',
            s: 'Mei 2024 - Desember 2024',
            d: '• Bertanggung jawab atas ketersediaan koneksi internet di 3 laboratorium komputer utama.\n• Melakukan instalasi perangkat lunak standar pendidikan dan pembaruan sistem keamanan (Antivirus/Patch).\n• Mengatur manajemen kabel (cable management) agar ruang server tetap rapi dan mudah diakses.'
        }];

        store.org = [{
            id: Date.now() + 4,
            t: 'OSIS SMKN 1 Pemalang',
            sub: 'Ketua Seksi Teknologi Informasi',
            s: '2024 - 2025',
            d: '• Memimpin tim untuk digitalisasi sistem pendaftaran kegiatan ekstrakurikuler sekolah.\n• Mengelola akun media sosial resmi sekolah dan meningkatkan engagement sebesar 40%.\n• Menjadi koordinator teknis dalam acara seminar karir sekolah yang dihadiri 500+ peserta.'
        }, {
            id: Date.now() + 5,
            t: 'Pramuka Penegak',
            sub: 'Anggota Aktif',
            s: '2023 - 2024',
            d: '• Mengembangkan kedisiplinan, kerjasama tim, dan kemampuan problem-solving di lapangan.'
        }];

        store.cert = [{
            id: Date.now() + 6,
            t: 'LSP (Lembaga Sertifikasi Profesi) P1',
            sub: 'Sertifikasi Kompetensi - Teknisi Jaringan Junior',
            s: 'Maret 2026',
            d: 'Dinyatakan KOMPETEN pada skema instalasi jaringan lokal dan administrasi server dasar.'
        }, {
            id: Date.now() + 7,
            t: 'MikroTik Academy',
            sub: 'MTCNA (MikroTik Certified Network Associate)',
            s: '2025',
            d: 'Sertifikasi keahlian dalam konfigurasi routing dan switching menggunakan perangkat MikroTik.'
        }];

        document.getElementById('in-skills').value = "MikroTik & Cisco Configuration\nWindows Server & Linux Administration\nNetwork Security & Firewall\nFiber Optic Splicing & Testing\nMicrosoft Excel (Data Entry & Pivot)\nTroubleshooting Hardware & Software";
        document.getElementById('in-langs').value = "Bahasa Indonesia (Sangat Aktif)\nBahasa Inggris (Teknis/Pasif)";

        btn.innerText = "Hapus Contoh";
        btn.classList.replace('bg-indigo-600', 'bg-rose-600');
        isDemoActive = true;

        renderLists('edu');
        renderLists('work');
        renderLists('org');
        renderLists('cert');
        sync();
    } else {
        location.reload();
    }
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