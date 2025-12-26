import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

// 表示する都市（必要なら増やせます）
const CITY = {
    tokyo: { center: [139.767125, 35.681236], zoom: 12 },
    osaka: { center: [135.502253, 34.693725], zoom: 12 },
};

function getCityFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    return CITY[city] ? city : "tokyo";
}

function initMap() {
    const el = document.getElementById("map");
    if (!el) return;
    if (el.dataset.mapInitialized) return;
    el.dataset.mapInitialized = "1";

    const cityKey = getCityFromUrl();
    const { center, zoom } = CITY[cityKey];

    const map = new maplibregl.Map({
        container: "map",
        // OSMラスタタイルをMapLibreで表示
        style: {
            version: 8,
            sources: {
                osm: {
                    type: "raster",
                    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "&copy; OpenStreetMap contributors",
                },
            },
            layers: [
                {
                    id: "osm",
                    type: "raster",
                    source: "osm",
                },
            ],
        },
        center,
        zoom,
        hash: false, // 一時的に無効化（問題が解決したらtrueに戻せる）
    });

    // 地図の読み込み完了後にリサイズを実行
    map.on("load", () => {
        map.resize();
    });

    // ウィンドウリサイズ時にもリサイズ
    window.addEventListener("resize", () => {
        if (map) {
            map.resize();
        }
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    window.__map = map;
}

// モーダルを開く関数
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("hidden");
    }
}

// モーダルを閉じる関数
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("hidden");
    }
}

// モーダルの初期化
function initModal() {
    // ヘッダーのボタンにイベントリスナーを追加
    const aboutAppBtn = document.getElementById("about-app-btn");
    const howToUseBtn = document.getElementById("how-to-use-btn");
    const termsBtn = document.getElementById("terms-btn");
    const pinRegistrationBtn = document.getElementById("pin-registration-btn");
    const modalDeleteBtn = document.getElementById("modal-delete-btn");

    if (aboutAppBtn) {
        aboutAppBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("about-app-modal");
        });
    }

    if (howToUseBtn) {
        howToUseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("how-to-use-modal");
        });
    }

    if (termsBtn) {
        termsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("terms-modal");
        });
    }

    if (pinRegistrationBtn) {
        pinRegistrationBtn.addEventListener("click", () => {
            openModal("pin-registration-modal");
        });
    }

    // ピン登録フォームの送信処理
    const pinRegistrationForm = document.getElementById("pin-registration-form");
    if (pinRegistrationForm) {
        pinRegistrationForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = {
                price: document.getElementById("reg-price").value,
                distance: document.getElementById("reg-distance").value,
                timeSlot: document.getElementById("reg-time-slot").value,
                weather: document.getElementById("reg-weather").value,
            };
            console.log("ピン登録データ:", formData);
            // 後でAPIに送信する処理を実装
            closeModal("pin-registration-modal");
            // フォームをリセット
            pinRegistrationForm.reset();
        });
    }

    // すべてのモーダルに背景クリックで閉じる機能を追加
    const modals = ["about-app-modal", "how-to-use-modal", "terms-modal", "pin-registration-modal", "pin-modal"];
    modals.forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    closeModal(modalId);
                }
            });
        }
    });

    // 削除ボタン（後で実装）
    if (modalDeleteBtn) {
        modalDeleteBtn.addEventListener("click", () => {
            console.log("削除ボタンがクリックされました");
            // 削除処理を実装（後で）
            closeModal("pin-modal");
        });
    }
}

// グローバルに公開
window.openModal = openModal;
window.closeModal = closeModal;

// モーダルを表示する関数（ピンクリック時に呼び出す）
function showPinModal(pinData) {
    const modal = document.getElementById("pin-modal");
    if (!modal) return;

    // モーダルにデータを設定
    document.getElementById("modal-price").value = pinData.price || "";
    document.getElementById("modal-distance").value = pinData.distance || "";
    document.getElementById("modal-time-slot").value = pinData.timeSlot || "";
    document.getElementById("modal-weather").value = pinData.weather || "";

    modal.classList.remove("hidden");
}

// モーダルを閉じる関数
function hidePinModal() {
    const modal = document.getElementById("pin-modal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

// グローバルに公開
window.showPinModal = showPinModal;
window.hidePinModal = hidePinModal;

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initModal();
});

document.addEventListener("turbo:load", () => {
    initMap();
    initModal();
});
