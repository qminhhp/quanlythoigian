-- Tạo bảng người dùng
CREATE TABLE nguoi_dung (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    ten TEXT,
    mat_khau TEXT NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cap_do INTEGER DEFAULT 1,
    kinh_nghiem INTEGER DEFAULT 0,
    huy_hieu TEXT[] DEFAULT '{}',
    avatar_url TEXT
);

-- Tạo bảng công việc
CREATE TABLE cong_viec (
    id TEXT PRIMARY KEY,
    nguoi_dung_id TEXT REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    tieu_de TEXT NOT NULL,
    mo_ta TEXT,
    hoan_thanh BOOLEAN DEFAULT FALSE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nguoi_duoc_giao_id TEXT REFERENCES nguoi_dung(id),
    ngay_den_han TIMESTAMP,
    tan_suat TEXT CHECK (tan_suat IN ('none', 'daily', 'weekly', 'monthly')),
    khan_cap BOOLEAN DEFAULT FALSE,
    quan_trong BOOLEAN DEFAULT FALSE,
    danh_muc TEXT
);

-- Tạo bảng thói quen
CREATE TABLE thoi_quen (
    id TEXT PRIMARY KEY,
    nguoi_dung_id TEXT REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    tieu_de TEXT NOT NULL,
    mo_ta TEXT,
    tan_suat TEXT CHECK (tan_suat IN ('daily', 'weekly', 'monthly')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_luu_tru TIMESTAMP,
    danh_muc TEXT,
    chuoi_ngay INTEGER DEFAULT 0,
    chuoi_dai_nhat INTEGER DEFAULT 0,
    lan_cuoi_hoan_thanh TIMESTAMP
);

-- Tạo bảng hoàn thành thói quen
CREATE TABLE hoan_thanh_thoi_quen (
    id TEXT PRIMARY KEY,
    thoi_quen_id TEXT REFERENCES thoi_quen(id) ON DELETE CASCADE,
    ngay_hoan_thanh TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng bình luận
CREATE TABLE binh_luan (
    id TEXT PRIMARY KEY,
    nguoi_dung_id TEXT REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    noi_dung TEXT NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cong_viec_id TEXT REFERENCES cong_viec(id) ON DELETE CASCADE
);

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX idx_cong_viec_nguoi_dung ON cong_viec(nguoi_dung_id);
CREATE INDEX idx_thoi_quen_nguoi_dung ON thoi_quen(nguoi_dung_id);
CREATE INDEX idx_binh_luan_cong_viec ON binh_luan(cong_viec_id);
