import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

// ============================================================================
// 定数定義
// ============================================================================

// ピン設定
const PIN_CONFIG = {
    ICON_SIZE: 40,              // ピンアイコンのサイズ（px）
    MIN_ZOOM_LEVEL: 10,         // ピンを表示する最小ズームレベル
    MIN_PRICE: 3000,            // 最小価格（円）
    MAX_PRICE: 9999,            // 最大価格（円）
    WHALE_THRESHOLD: 6000,      // クジラアイコンを表示する価格の閾値（円）
    MIN_DISTANCE: 0.1,          // 最小配達距離（km）
    MAX_DISTANCE: 99.9          // 最大配達距離（km）
};

// 地図設定
const MAP_CONFIG = {
    FLY_TO_DURATION: 1000       // 地図移動アニメーションの時間（ミリ秒）
};

// 表示する都市
const CITY = {
    tokyo: { center: [139.767125, 35.681236], zoom: 12 },      // 東京
    kanagawa: { center: [139.638026, 35.443707], zoom: 12 },   // 神奈川
    chiba: { center: [140.1233, 35.6074], zoom: 12 },          // 千葉
    saitama: { center: [139.6489, 35.8617], zoom: 12 },       // 埼玉
    osaka: { center: [135.502253, 34.693725], zoom: 12 },      // 大阪
    hyogo: { center: [135.1957, 34.6903], zoom: 12 },         // 兵庫（神戸）
    kyoto: { center: [135.7681, 35.0116], zoom: 12 },         // 京都
    fukuoka: { center: [130.4017, 33.5904], zoom: 12 },       // 福岡
    aichi: { center: [136.9066, 35.1815], zoom: 12 },          // 愛知（名古屋）
    hokkaido: { center: [141.3544, 43.0642], zoom: 12 },      // 北海道（札幌）
    miyagi: { center: [140.8694, 38.2682], zoom: 12 },        // 宮城（仙台）
    hiroshima: { center: [132.4553, 34.3853], zoom: 12 },     // 広島
    okinawa: { center: [127.6809, 26.2124], zoom: 12 },       // 沖縄（那覇）
};

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 座標の妥当性を検証する
 * @param {number|string} lng - 経度
 * @param {number|string} lat - 緯度
 * @returns {{valid: boolean, lng?: number, lat?: number, error?: string}} 検証結果
 */
function validateCoordinates(lng, lat) {
    const longitude = Number(lng);
    const latitude = Number(lat);

    // NaNチェック
    if (isNaN(longitude) || isNaN(latitude)) {
        return { valid: false, error: "座標が無効です（NaN）" };
    }

    // 経度の範囲チェック（-180 ～ 180）
    if (longitude < -180 || longitude > 180) {
        return { valid: false, error: "経度が範囲外です（-180～180の範囲で入力してください）" };
    }

    // 緯度の範囲チェック（-90 ～ 90）
    if (latitude < -90 || latitude > 90) {
        return { valid: false, error: "緯度が範囲外です（-90～90の範囲で入力してください）" };
    }

    return { valid: true, lng: longitude, lat: latitude };
}

/**
 * ボタンをハイライト表示する
 * @param {HTMLElement} element - ハイライトする要素
 */
function highlightButton(element) {
    if (!element) return;
    element.classList.add("bg-blue-700", "font-bold");
    element.classList.remove("bg-transparent");
}

/**
 * ボタンのハイライトを解除する
 * @param {HTMLElement} element - ハイライトを解除する要素
 */
function clearButtonHighlight(element) {
    if (!element) return;
    element.classList.remove("bg-blue-700", "font-bold");
    element.classList.add("bg-transparent");
}

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
    const cityData = CITY[cityKey];

    // マイエリアが登録されているかチェック（ログイン時はサーバーから、未ログイン時はlocalStorageから）
    loadMyArea().then(myArea => {
        if (myArea) {
            // マイエリアが登録されている場合はそこに飛ぶ
            createMapWithCenter([myArea.lng, myArea.lat], myArea.zoom);
            // 都市リンクのハイライトをクリア
            clearCityLinksHighlight();
            // マイエリアボタンをハイライト
            const myAreaBtn = document.getElementById("my-area-btn");
            if (myAreaBtn) {
                highlightButton(myAreaBtn);
            }
        } else {
            // マイエリアが未登録の場合は都市データを使用
            createMapWithCenter(cityData.center, cityData.zoom);
        }
    }).catch(() => {
        // マイエリア取得に失敗した場合は都市データを使用
        createMapWithCenter(cityData.center, cityData.zoom);
    });
}

// 地図を作成する関数（初期中心座標とズームレベルを指定）
function createMapWithCenter(center, zoom) {
    const el = document.getElementById("map");
    if (!el) return;

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
        // 日本国内に表示範囲を限定
        // 南西端: [122.93, 20.42]（沖縄のさらに南西）
        // 北東端: [153.98, 45.55]（北海道のさらに北東）
        maxBounds: [
            [122.93, 20.42], // 南西端 [経度, 緯度]
            [153.98, 45.55]  // 北東端 [経度, 緯度]
        ]
    });

    // ロード検知ロジック：イベントリスナーを先に登録してから、loaded()をチェック
    const startApp = () => {
        map.resize();
        loadPins(map);
    };

    // 1. まずイベントリスナーを登録（これが重要）
    map.once('load', startApp);

    // 2. その直後に「もし既にロード済みなら」手動で発火させる
    // map.loaded() が true なら、上記のリスナーは発火しない可能性があるため
    if (map.loaded()) {
        // リスナーを解除して（二重実行防止）、即時実行
        map.off('load', startApp);
        startApp();
    }

    // ウィンドウリサイズ時にもリサイズ
    window.addEventListener("resize", () => {
        if (map) {
            map.resize();
        }
    });

    // ズームレベルに応じてピンの表示/非表示を切り替える
    const updatePinVisibility = () => {
        const currentZoom = map.getZoom();
        const minZoom = PIN_CONFIG.MIN_ZOOM_LEVEL;

        // すべてのマーカーの表示/非表示を切り替え
        Object.values(pinMarkers).forEach(marker => {
            if (marker && marker.getElement) {
                const markerElement = marker.getElement();
                if (markerElement) {
                    // MapLibreが作成する親要素（.maplibregl-marker）を取得
                    const parentElement = markerElement.parentElement;
                    if (parentElement && parentElement.classList.contains("maplibregl-marker")) {
                        if (currentZoom < minZoom) {
                            // ズームアウト時：ピンを非表示
                            parentElement.style.display = "none";
                        } else {
                            // ズームイン時：ピンを表示
                            parentElement.style.display = "block";
                        }
                    } else {
                        // 親要素が見つからない場合、マーカー要素自体に設定
                        if (currentZoom < minZoom) {
                            markerElement.style.display = "none";
                        } else {
                            markerElement.style.display = "block";
                        }
                    }
                }
            }
        });

        const visibleCount = Object.values(pinMarkers).filter(marker => {
            if (marker && marker.getElement) {
                const el = marker.getElement();
                if (el) {
                    const parent = el.parentElement;
                    if (parent && parent.classList.contains("maplibregl-marker")) {
                        return parent.style.display !== "none";
                    }
                    return el.style.display !== "none";
                }
            }
            return false;
        }).length;

    };

    // ズームイベントを監視（moveendイベントでも更新）
    map.on("zoom", updatePinVisibility);
    map.on("moveend", updatePinVisibility);

    // 初期表示時にも実行
    updatePinVisibility();

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    window.__map = map;
    window.__updatePinVisibility = updatePinVisibility; // グローバルに公開（必要に応じて）

    // 都市リンクの初期化
    initCityLinks(map);

    // マイエリアボタンの初期化
    initMyAreaButton(map);
}

// マイエリア情報を取得（ログイン時はサーバーから、未ログイン時はlocalStorageから）
async function loadMyArea() {
    const currentUserId = getCurrentUserId();

    // ログイン時はサーバーから取得
    if (currentUserId) {
        try {
            const response = await fetch("/api/my_area", {
                method: "GET",
                headers: {
                    "X-CSRF-Token": getCSRFToken(),
                    "Content-Type": "application/json"
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            if (result.status === "success" && result.data) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error("マイエリア取得エラー:", error);
            return null;
        }
    } else {
        // 未ログイン時はlocalStorageから取得
        try {
            const stored = localStorage.getItem("my_area");
            if (stored) {
                return JSON.parse(stored);
            }
            return null;
        } catch (error) {
            console.error("localStorageからマイエリア取得エラー:", error);
            return null;
        }
    }
}

// マイエリアボタンの初期化
function initMyAreaButton(map) {
    const myAreaBtn = document.getElementById("my-area-btn");
    if (!myAreaBtn) return;

    // マイエリアボタンクリック時
    myAreaBtn.addEventListener("click", async () => {
        const myArea = await loadMyArea();
        if (myArea) {
            // マイエリアが登録されている場合はそこに飛ぶ
            map.flyTo({
                center: [myArea.lng, myArea.lat],
                zoom: myArea.zoom,
                duration: MAP_CONFIG.FLY_TO_DURATION
            });

            // 都市リンクのハイライトをクリア
            clearCityLinksHighlight();

            // マイエリアボタンをハイライト
            highlightButton(myAreaBtn);
        } else {
            // マイエリアが未登録の場合は設定モーダルを開く
            openModal("my-area-modal");
        }
    });

    // マイエリア設定モーダルのイベントリスナー
    initMyAreaModal(map);
}

// 都市リンクのハイライトをクリア
function clearCityLinksHighlight() {
    const cityLinks = document.querySelectorAll(".city-link");
    cityLinks.forEach(link => {
        clearButtonHighlight(link);
    });
}

// マイエリアボタンのハイライトをクリア
function clearMyAreaButtonHighlight() {
    const myAreaBtn = document.getElementById("my-area-btn");
    if (myAreaBtn) {
        clearButtonHighlight(myAreaBtn);
    }
}

// マイエリア設定モーダルの初期化
function initMyAreaModal(map) {
    const setCurrentLocationBtn = document.getElementById("set-current-location-btn");
    const setMapCenterBtn = document.getElementById("set-map-center-btn");
    const saveMyAreaBtn = document.getElementById("save-my-area-btn");

    let selectedLocation = null;

    // 現在地を設定
    if (setCurrentLocationBtn) {
        setCurrentLocationBtn.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        const zoom = map.getZoom();
                        selectedLocation = { lat, lng, zoom };
                        updateMyAreaInfo(lat, lng, zoom);

                        // 地図を現在地に移動
                        map.flyTo({
                            center: [lng, lat],
                            zoom: zoom,
                            duration: MAP_CONFIG.FLY_TO_DURATION
                        });
                    },
                    (error) => {
                        alert("現在地の取得に失敗しました: " + error.message);
                    }
                );
            } else {
                alert("このブラウザは位置情報をサポートしていません");
            }
        });
    }

    // 地図中心を設定
    if (setMapCenterBtn) {
        setMapCenterBtn.addEventListener("click", () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            selectedLocation = {
                lat: center.lat,
                lng: center.lng,
                zoom: zoom
            };
            updateMyAreaInfo(center.lat, center.lng, zoom);
        });
    }

    // 保存ボタン
    if (saveMyAreaBtn) {
        saveMyAreaBtn.addEventListener("click", async () => {
            if (!selectedLocation) {
                alert("位置を設定してください");
                return;
            }

            const currentUserId = getCurrentUserId();
            const myAreaData = {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                zoom: selectedLocation.zoom
            };

            // ログイン時はサーバーに保存、未ログイン時はlocalStorageに保存
            if (currentUserId) {
                // ログイン時：サーバーに保存
                try {
                    const response = await fetch("/api/my_area", {
                        method: "POST",
                        headers: {
                            "X-CSRF-Token": getCSRFToken(),
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            my_area: myAreaData
                        })
                    });

                    // レスポンスのContent-Typeを確認
                    const contentType = response.headers.get("content-type");

                    let result;
                    if (contentType && contentType.includes("application/json")) {
                        result = await response.json();
                    } else {
                        // JSONでない場合はテキストとして取得
                        const text = await response.text();
                        console.error("JSON以外のレスポンス:", text);
                        throw new Error("サーバーからのレスポンスがJSON形式ではありません");
                    }

                    if (response.ok && result.status === "success") {
                        closeModal("my-area-modal");
                        alert("マイエリアを保存しました");
                    } else {
                        const errorDiv = document.getElementById("my-area-error");
                        if (errorDiv) {
                            const errorMessage = result.errors ? result.errors.join(", ") : (result.error || "保存に失敗しました");
                            errorDiv.textContent = errorMessage;
                            errorDiv.classList.remove("hidden");
                            console.error("マイエリア保存エラー:", result);
                        }
                    }
                } catch (error) {
                    console.error("マイエリア保存エラー:", error);
                    const errorDiv = document.getElementById("my-area-error");
                    if (errorDiv) {
                        errorDiv.textContent = "マイエリアの保存に失敗しました: " + error.message;
                        errorDiv.classList.remove("hidden");
                    }
                }
            } else {
                // 未ログイン時：localStorageに保存
                try {
                    localStorage.setItem("my_area", JSON.stringify(myAreaData));
                    closeModal("my-area-modal");
                    alert("マイエリアを保存しました");
                } catch (error) {
                    console.error("localStorageへの保存エラー:", error);
                    const errorDiv = document.getElementById("my-area-error");
                    if (errorDiv) {
                        errorDiv.textContent = "マイエリアの保存に失敗しました: " + error.message;
                        errorDiv.classList.remove("hidden");
                    }
                }
            }
        });
    }
}

// マイエリア情報表示を更新
function updateMyAreaInfo(lat, lng, zoom) {
    const infoDiv = document.getElementById("my-area-info");
    const latDisplay = document.getElementById("my-area-lat-display");
    const lngDisplay = document.getElementById("my-area-lng-display");
    const zoomDisplay = document.getElementById("my-area-zoom-display");

    if (infoDiv && latDisplay && lngDisplay && zoomDisplay) {
        latDisplay.textContent = lat.toFixed(6);
        lngDisplay.textContent = lng.toFixed(6);
        zoomDisplay.textContent = zoom.toFixed(1);
        infoDiv.classList.remove("hidden");
    }
}

// 都市リンクの初期化
function initCityLinks(map) {
    const cityLinks = document.querySelectorAll(".city-link");

    cityLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const cityKey = link.dataset.city;

            if (CITY[cityKey] && map) {
                const { center, zoom } = CITY[cityKey];

                // 地図の中心を移動（アニメーション付き）
                map.flyTo({
                    center: center,
                    zoom: zoom,
                    duration: MAP_CONFIG.FLY_TO_DURATION
                });

                // アクティブなリンクのスタイルを更新
                cityLinks.forEach(l => {
                    clearButtonHighlight(l);
                });
                highlightButton(link);

                // マイエリアボタンのハイライトをクリア
                clearMyAreaButtonHighlight();
            }
        });
    });

    // 初期状態で現在の都市をハイライト
    const cityKey = getCityFromUrl();
    const activeLink = document.querySelector(`.city-link[data-city="${cityKey}"]`);
    if (activeLink) {
        highlightButton(activeLink);
    }
}

// ピンのマーカーを管理するオブジェクト
const pinMarkers = {};

// 自分のピンのみ表示するトグル状態
let showMyPinsOnly = false;

// APIからピンデータを取得して地図上に表示
async function loadPins(map) {
    if (!map) {
        console.error("地図オブジェクトが存在しません");
        return;
    }

    // 注意: initMap側で既にロード完了を検知してから呼び出されるため、
    // ここでのloaded()チェックは不要（MapLibreの仕様上、loadイベント発火直後でもloaded()がfalseを返すことがある）

    try {
        const response = await fetch("/api/pins");

        if (!response.ok) {
            console.error("APIリクエストが失敗しました:", response.status, response.statusText);
            return;
        }

        const result = await response.json();

        // データを正規化（配列そのものが来るか、dataプロパティに来るか両対応）
        let pinsData = [];
        if (Array.isArray(result)) {
            pinsData = result; // Rails標準の配列形式
        } else if (result.data && Array.isArray(result.data)) {
            pinsData = result.data; // ラッパー形式
        }

        // 自分のピンのみ表示モードの場合、フィルタリング
        if (showMyPinsOnly) {
            const currentUserId = getCurrentUserId();
            if (currentUserId) {
                // user_idを数値に変換して比較（null/undefinedの場合は除外）
                pinsData = pinsData.filter(pin => {
                    if (!pin.user_id) {
                        return false; // user_idがないピン（未ログイン投稿）は除外
                    }
                    const pinUserId = typeof pin.user_id === 'number' ? pin.user_id : parseInt(pin.user_id, 10);
                    return pinUserId === currentUserId;
                });
            }
        }

        // 既存のマーカーを削除（MapLibreの標準メソッドを使用）
        // フィルタリング前でも後でも、常に既存のマーカーを削除してから新しいマーカーを追加
        const markerCount = Object.keys(pinMarkers).length;
        if (markerCount > 0) {
            Object.values(pinMarkers).forEach(marker => {
                if (marker && typeof marker.remove === "function") {
                    marker.remove();
                }
            });
            // マーカーオブジェクトをクリア
            Object.keys(pinMarkers).forEach(key => delete pinMarkers[key]);
        }

        if (pinsData.length > 0) {
            // pinsData でループ
            pinsData.forEach((pin) => {
                try {
                    addPinToMap(map, pin);
                } catch (error) {
                    console.error("ピンの追加に失敗:", error, pin);
                }
            });

            // ピン追加後、現在のズームレベルに応じて表示/非表示を更新
            if (window.__updatePinVisibility) {
                window.__updatePinVisibility();
            }
        } else {
            console.warn("表示できるピンがありません", result);
        }
    } catch (error) {
        console.error("ピンの読み込みに失敗しました:", error);
        console.error("エラーの詳細:", error.stack);
    }
}

// 地図上にピンを追加
function addPinToMap(map, pin) {
    try {
        // 地図オブジェクトの確認
        if (!map) {
            console.error("地図オブジェクトが存在しません");
            return;
        }

        // 座標を確認（必須）
        if (typeof pin.lng === "undefined" || typeof pin.lat === "undefined") {
            console.error("ピンの座標が不正です:", pin);
            return;
        }

        // アイコンの種類に応じてマーカーのスタイルを決定
        // 重要: サイズを固定（width, height）し、位置調整用のCSS（margin, top, left, transform）は一切使用しない
        let iconHtml = "";
        const iconSize = PIN_CONFIG.ICON_SIZE;

        if (pin.icon_type === "whale") {
            // クジラアイコン（PIN_CONFIG.WHALE_THRESHOLD円以上）
            // 画像を使用してPCとスマホで統一されたデザインにする
            // Railsのアセットパイプライン経由で画像を参照
            const whaleIconPath = getImagePath("whale-icon.png");
            iconHtml = `<img src="${whaleIconPath}" alt="クジラ" class="transition-none" style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain; display: block; transition: none !important; max-width: none !important; user-select: none; -webkit-user-select: none; pointer-events: none;" draggable="false" onerror="this.style.display='none'; console.error('画像の読み込みに失敗しました:', this.src);">`;
        } else if (pin.icon_type === "tuna") {
            // マグロアイコン（PIN_CONFIG.MIN_PRICE〜PIN_CONFIG.WHALE_THRESHOLD-1円）
            // 画像を使用してPCとスマホで統一されたデザインにする
            // Railsのアセットパイプライン経由で画像を参照
            const tunaIconPath = getImagePath("tuna-icon.png");
            iconHtml = `<img src="${tunaIconPath}" alt="マグロ" class="transition-none" style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain; display: block; transition: none !important; max-width: none !important; user-select: none; -webkit-user-select: none; pointer-events: none;" draggable="false" onerror="this.style.display='none'; console.error('画像の読み込みに失敗しました:', this.src);">`;
        } else {
            // 通常のピン（PIN_CONFIG.MIN_PRICE円未満）
            // transition-noneクラスとインラインスタイルでアニメーションを無効化
            iconHtml = `<div class="transition-none" style="width: ${iconSize}px; height: ${iconSize}px; background-color: #3B82F6; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: none !important;"></div>`;
        }

        // マーカー用のHTML要素を作成
        // 【重要】位置調整用のCSS（margin, top, left, transform）は一切使用しない
        // anchor: 'bottom'で位置を制御し、サイズは固定（width, height）のみ
        const el = document.createElement("div");
        // 【超重要】transition-noneクラスを追加してアニメーションを完全に無効化
        // Tailwindのアニメーションクラス（transition, transition-all, duration-*, ease-*, animate-*）は一切使用しない
        el.className = "pin-marker transition-none";
        // カーソルのみ設定（位置関連のスタイルは一切設定しない）
        el.style.cursor = "pointer";
        // インラインスタイルでも確実に無効化
        el.style.transition = "none";
        el.style.setProperty("transition", "none", "important");

        // 見た目のみ - サイズ固定、位置調整用のCSSは一切使用しない
        // 金額ラベルとアイコンを縦に並べるだけ（margin, padding, position, transformは使わない）
        // 子要素にもtransition-noneクラスとインラインスタイルでアニメーションを無効化
        // 重要: Tailwindのクラス（w-full, h-autoなど）は一切使用しない
        el.innerHTML = `
            <div class="transition-none" style="background-color: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap; pointer-events: none; transition: none !important; max-width: none !important;">
                ¥${pin.price.toLocaleString()}
            </div>
            ${iconHtml}
        `;

        // 子要素すべてにtransition-noneとmax-width: noneを強制的に適用
        setTimeout(() => {
            const allChildren = el.querySelectorAll("*");
            allChildren.forEach(child => {
                // クラスを追加
                if (!child.classList.contains("transition-none")) {
                    child.classList.add("transition-none");
                }
                // インラインスタイルでも確実に無効化
                child.style.setProperty("transition", "none", "important");
                child.style.setProperty("max-width", "none", "important");
                // サイズを固定（Tailwindのリセットを上書き）
                if (child.style.width && child.style.width.includes("px")) {
                    child.style.setProperty("width", child.style.width, "important");
                }
                if (child.style.height && child.style.height.includes("px")) {
                    child.style.setProperty("height", child.style.height, "important");
                }
            });
        }, 0);

        // MapLibreの標準Marker機能を使用
        // 座標の妥当性を検証
        const coordValidation = validateCoordinates(pin.lng, pin.lat);
        if (!coordValidation.valid) {
            console.error(coordValidation.error, { lng: pin.lng, lat: pin.lat, pin });
            return;
        }

        const longitude = coordValidation.lng;
        const latitude = coordValidation.lat;

        // 注意: marker.addTo(map) は地図がロード中であっても実行可能です（ロード完了後に自動的に表示されます）
        // そのため、ここでのloaded()チェックは不要です

        // マーカーを作成
        // 【超重要】anchor: 'bottom'を必ず指定 - これにより画像の下端中央が座標に固定される
        const marker = new maplibregl.Marker({
            element: el,
            anchor: "bottom" // ピンの下端中央が座標位置に来るように設定（必須）
        });

        // 座標を設定（MapLibreは [経度, 緯度] の順序を要求）
        // 重要: [longitude, latitude] = [経度, 緯度] の順序、必ず数値型で渡す
        const coordinates = [longitude, latitude];
        marker.setLngLat(coordinates);

        // 地図に追加（座標を設定してから追加）
        // 重要: addTo()は地図のコンテナにマーカーを追加し、地図の座標系にバインドする
        marker.addTo(map);


        // クリックイベントを追加
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            showPinDetails(pin);
        });

        // マーカーを保存
        pinMarkers[pin.id] = marker;

        // 現在のズームレベルに応じて表示/非表示を設定
        // 注意: マーカーが地図に追加された後、MapLibreが親要素を作成するため、
        // ここでは設定せず、updatePinVisibility関数で一括管理する
    } catch (error) {
        console.error("❌ ピンの追加に失敗しました:", pin, error);
        console.error("エラーの詳細:", error.stack);
    }
}

// ピンの詳細を表示
function showPinDetails(pin) {
    const modal = document.getElementById("pin-modal");
    if (!modal) return;

    // モーダルにデータを設定
    document.getElementById("modal-price").value = `¥${pin.price.toLocaleString()}`;
    document.getElementById("modal-distance").value = `${pin.distance_km}km`;
    document.getElementById("modal-time-slot").value = pin.time_slot;
    document.getElementById("modal-weather").value = pin.weather;

    // 削除トークンを保存（削除時に使用）
    // 注意: ピン作成時に返されたdelete_tokenをlocalStorageに保存する必要があります
    modal.dataset.pinId = pin.id;
    modal.dataset.pinUserId = pin.user_id || ""; // ピンのuser_idを保存

    // localStorageから削除トークンを取得
    const storedToken = localStorage.getItem(`pin_delete_token_${pin.id}`);
    modal.dataset.deleteToken = storedToken || "";

    // 削除ボタンの表示判定
    const deleteBtn = document.getElementById("modal-delete-btn");
    if (deleteBtn) {
        // ログイン状態を確認
        const isLoggedIn = document.getElementById("logout-btn") !== null;
        const pinUserId = pin.user_id;

        // 削除可能な条件：
        // 1. ログインしていて、ピンにuser_idが設定されている（サーバー側で自分のピンかチェック）
        // 2. 未ログインだが、delete_tokenがある
        const canDelete = (isLoggedIn && pinUserId) || storedToken;

        if (canDelete) {
            deleteBtn.classList.remove("hidden");
            deleteBtn.disabled = false;
        } else {
            deleteBtn.classList.add("hidden");
        }
    }

    modal.classList.remove("hidden");
}

// モーダルを開く関数
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("hidden");
    }
    // モバイルメニューを閉じる
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
        mobileMenu.classList.add("hidden");
    }
}

// モーダルを閉じる関数
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("hidden");
    }
}

// 現在のログインユーザーIDを取得（ヘッダーから）
function getCurrentUserId() {
    const header = document.querySelector("header");
    if (header) {
        const userId = header.dataset.currentUserId;
        return userId ? parseInt(userId, 10) : null;
    }
    return null;
}

// CSRFトークンを取得する関数
function getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

// 画像パスを取得する関数（Railsのアセットパイプライン対応）
function getImagePath(imageName) {
    // ヘッダーのdata属性から画像パスを取得（Railsのimage_pathヘルパーで生成されたパス）
    const header = document.querySelector("header");
    if (header) {
        if (imageName === "whale-icon.png" && header.dataset.whaleIcon) {
            return header.dataset.whaleIcon;
        }
        if (imageName === "tuna-icon.png" && header.dataset.tunaIcon) {
            return header.dataset.tunaIcon;
        }
    }
    // フォールバック: アセットパイプライン経由のパス
    return `/assets/${imageName}`;
}

// トグルボタンの見た目を更新
function updateToggleButton(toggleBtn, isOn) {
    const span = toggleBtn.querySelector("span");
    if (isOn) {
        toggleBtn.classList.remove("bg-gray-300");
        toggleBtn.classList.add("bg-blue-600");
        span.classList.remove("translate-x-1");
        span.classList.add("translate-x-6");
        toggleBtn.setAttribute("aria-checked", "true");
    } else {
        toggleBtn.classList.remove("bg-blue-600");
        toggleBtn.classList.add("bg-gray-300");
        span.classList.remove("translate-x-6");
        span.classList.add("translate-x-1");
        toggleBtn.setAttribute("aria-checked", "false");
    }
}

// モーダルの初期化
function initModal() {
    // ロゴのクリックイベント（ページ更新）
    const logo = document.getElementById("logo");
    if (logo) {
        logo.addEventListener("click", () => {
            window.location.reload();
        });
    }

    // モバイルメニューの開閉
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuClose = document.getElementById("mobile-menu-close");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.remove("hidden");
        });
    }

    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
        });
    }

    // モバイルメニューの背景クリックで閉じる
    if (mobileMenu) {
        mobileMenu.addEventListener("click", (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.add("hidden");
            }
        });
    }

    // 都市ナビゲーションの折りたたみ（スマホ）
    const cityNavToggle = document.getElementById("city-nav-toggle");
    const cityNavContent = document.getElementById("city-nav-content");
    const cityNavArrow = document.getElementById("city-nav-arrow");

    if (cityNavToggle && cityNavContent) {
        cityNavToggle.addEventListener("click", () => {
            const isHidden = cityNavContent.classList.contains("hidden");
            if (isHidden) {
                cityNavContent.classList.remove("hidden");
                if (cityNavArrow) {
                    cityNavArrow.style.transform = "rotate(180deg)";
                }
            } else {
                cityNavContent.classList.add("hidden");
                if (cityNavArrow) {
                    cityNavArrow.style.transform = "rotate(0deg)";
                }
            }
        });
    }

    // ヘッダーのボタンにイベントリスナーを追加
    const myAreaSettingsBtn = document.getElementById("my-area-settings-btn");
    const aboutAppBtn = document.getElementById("about-app-btn");
    const howToUseBtn = document.getElementById("how-to-use-btn");
    const termsBtn = document.getElementById("terms-btn");
    const pinRegistrationBtn = document.getElementById("pin-registration-btn");
    const modalDeleteBtn = document.getElementById("modal-delete-btn");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const myPinsToggle = document.getElementById("my-pins-toggle");

    // モバイルメニューのボタン
    const mobileMyAreaSettingsBtn = document.getElementById("mobile-my-area-settings-btn");
    const mobileAboutAppBtn = document.getElementById("mobile-about-app-btn");
    const mobileHowToUseBtn = document.getElementById("mobile-how-to-use-btn");
    const mobileTermsBtn = document.getElementById("mobile-terms-btn");
    const mobileLoginBtn = document.getElementById("mobile-login-btn");
    const mobileLogoutBtn = document.getElementById("mobile-logout-btn");
    const mobileMyPinsToggle = document.getElementById("mobile-my-pins-toggle");
    const mobileMyAreaBtn = document.getElementById("mobile-my-area-btn");

    if (myAreaSettingsBtn) {
        myAreaSettingsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("my-area-modal");
        });
    }

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
            // 登録モードに切り替え（中央固定ピン方式）
            enableRegistrationMode();
        });
    }

    // キャンセルボタンのイベントリスナー
    const cancelRegistrationBtn = document.getElementById("cancel-registration-btn");
    if (cancelRegistrationBtn) {
        cancelRegistrationBtn.addEventListener("click", () => {
            cancelRegistrationMode();
        });
    }

    // ログインボタンのイベントリスナー
    if (loginBtn) {
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("login-modal");
        });
    }

    // モバイルメニューのボタンイベント
    if (mobileMyAreaSettingsBtn) {
        mobileMyAreaSettingsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (mobileMenu) mobileMenu.classList.add("hidden");
            openModal("my-area-modal");
        });
    }

    if (mobileAboutAppBtn) {
        mobileAboutAppBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (mobileMenu) mobileMenu.classList.add("hidden");
            openModal("about-app-modal");
        });
    }

    if (mobileHowToUseBtn) {
        mobileHowToUseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (mobileMenu) mobileMenu.classList.add("hidden");
            openModal("how-to-use-modal");
        });
    }

    if (mobileTermsBtn) {
        mobileTermsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (mobileMenu) mobileMenu.classList.add("hidden");
            openModal("terms-modal");
        });
    }

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (mobileMenu) mobileMenu.classList.add("hidden");
            openModal("login-modal");
        });
    }

    if (mobileMyAreaBtn) {
        mobileMyAreaBtn.addEventListener("click", async () => {
            if (cityNavContent) cityNavContent.classList.add("hidden");
            if (cityNavArrow) cityNavArrow.style.transform = "rotate(0deg)";
            const myArea = await loadMyArea();
            if (window.__map && myArea) {
                window.__map.flyTo({
                    center: [myArea.lng, myArea.lat],
                    zoom: myArea.zoom,
                    duration: MAP_CONFIG.FLY_TO_DURATION
                });
                clearCityLinksHighlight();
                const myAreaBtn = document.getElementById("my-area-btn");
                if (myAreaBtn) {
                    highlightButton(myAreaBtn);
                }
            } else if (window.__map) {
                openModal("my-area-modal");
            }
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (mobileMenu) mobileMenu.classList.add("hidden");

            // フォームを作成して送信（Turbo Drive対応）
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/users/sign_out";

            // CSRFトークンを追加
            const csrfInput = document.createElement("input");
            csrfInput.type = "hidden";
            csrfInput.name = "authenticity_token";
            csrfInput.value = getCSRFToken();
            form.appendChild(csrfInput);

            // method override for DELETE
            const methodInput = document.createElement("input");
            methodInput.type = "hidden";
            methodInput.name = "_method";
            methodInput.value = "delete";
            form.appendChild(methodInput);

            document.body.appendChild(form);
            form.submit();
        });
    }

    if (mobileMyPinsToggle) {
        mobileMyPinsToggle.addEventListener("click", () => {
            showMyPinsOnly = !showMyPinsOnly;
            updateToggleButton(mobileMyPinsToggle, showMyPinsOnly);

            // ピンを再読み込み
            const map = window.__map;
            if (map) {
                loadPins(map);
            } else {
                console.error("地図オブジェクトが見つかりません");
            }
        });
    }

    // ログアウトボタンのイベントリスナー
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            // フォームを作成して送信（Turbo Drive対応）
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/users/sign_out";

            // CSRFトークンを追加
            const csrfInput = document.createElement("input");
            csrfInput.type = "hidden";
            csrfInput.name = "authenticity_token";
            csrfInput.value = getCSRFToken();
            form.appendChild(csrfInput);

            // method override for DELETE
            const methodInput = document.createElement("input");
            methodInput.type = "hidden";
            methodInput.name = "_method";
            methodInput.value = "delete";
            form.appendChild(methodInput);

            document.body.appendChild(form);
            form.submit();
        });
    }


    // ログインフォームの送信処理
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            const errorDiv = document.getElementById("login-error");

            try {
                const response = await fetch("/users/sign_in", {
                    method: "POST",
                    headers: {
                        "X-CSRF-Token": getCSRFToken(),
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        user: {
                            email: email,
                            password: password
                        }
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    closeModal("login-modal");
                    window.location.reload();
                } else {
                    errorDiv.textContent = result.errors ? result.errors.join(", ") : "ログインに失敗しました";
                    errorDiv.classList.remove("hidden");
                }
            } catch (error) {
                console.error("ログインエラー:", error);
                errorDiv.textContent = "ログインに失敗しました";
                errorDiv.classList.remove("hidden");
            }
        });
    }

    // 新規登録フォームの送信処理
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userName = document.getElementById("signup-user-name").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;
            const passwordConfirmation = document.getElementById("signup-password-confirmation").value;
            const errorDiv = document.getElementById("signup-error");

            if (password !== passwordConfirmation) {
                errorDiv.textContent = "パスワードが一致しません";
                errorDiv.classList.remove("hidden");
                return;
            }

            try {
                const response = await fetch("/users", {
                    method: "POST",
                    headers: {
                        "X-CSRF-Token": getCSRFToken(),
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        user: {
                            user_name: userName,
                            email: email,
                            password: password,
                            password_confirmation: passwordConfirmation
                        }
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    closeModal("signup-modal");
                    window.location.reload();
                } else {
                    errorDiv.textContent = result.errors ? result.errors.join(", ") : "登録に失敗しました";
                    errorDiv.classList.remove("hidden");
                }
            } catch (error) {
                console.error("登録エラー:", error);
                errorDiv.textContent = "登録に失敗しました";
                errorDiv.classList.remove("hidden");
            }
        });
    }

    // ログイン・新規登録モーダル間の切り替え
    const signupLink = document.getElementById("signup-link");
    if (signupLink) {
        signupLink.addEventListener("click", (e) => {
            e.preventDefault();
            closeModal("login-modal");
            openModal("signup-modal");
        });
    }

    const loginLink = document.getElementById("login-link");
    if (loginLink) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            closeModal("signup-modal");
            openModal("login-modal");
        });
    }

    // 自分のピンのみ表示トグルボタン
    if (myPinsToggle) {
        myPinsToggle.addEventListener("click", () => {
            showMyPinsOnly = !showMyPinsOnly;
            updateToggleButton(myPinsToggle, showMyPinsOnly);

            // ピンを再読み込み
            const map = window.__map;
            if (map) {
                loadPins(map);
            } else {
                console.error("地図オブジェクトが見つかりません");
            }
        });
    }

    // ピン登録フォームの送信処理
    const pinRegistrationForm = document.getElementById("pin-registration-form");
    if (pinRegistrationForm) {
        pinRegistrationForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const map = window.__map;
            if (!map) {
                alert("地図が読み込まれていません");
                return;
            }

            // 選択された位置を取得
            const selectedLocation = map._selectedLocation;
            if (!selectedLocation) {
                alert("位置が選択されていません。モーダルを閉じて、もう一度地図上をクリックしてください。");
                return;
            }

            // 座標を確認（MapLibreのgetCenter()から取得した値）
            // 座標の妥当性を検証
            const coordValidation = validateCoordinates(selectedLocation.lng, selectedLocation.lat);
            if (!coordValidation.valid) {
                alert(`${coordValidation.error}。もう一度位置を選択してください。`);
                return;
            }

            const lng = coordValidation.lng;
            const lat = coordValidation.lat;

            // 金額を取得してバリデーション
            const price = parseInt(document.getElementById("reg-price").value);

            // 金額のバリデーション
            if (isNaN(price) || price < PIN_CONFIG.MIN_PRICE || price > PIN_CONFIG.MAX_PRICE) {
                alert(`金額は${PIN_CONFIG.MIN_PRICE}円以上${PIN_CONFIG.MAX_PRICE}円以下である必要があります。`);
                document.getElementById("reg-price").focus();
                return;
            }

            // 配達距離を取得してバリデーション
            const distance = parseFloat(document.getElementById("reg-distance").value);

            // 配達距離のバリデーション（小数点1桁まで）
            if (isNaN(distance) || distance < PIN_CONFIG.MIN_DISTANCE || distance > PIN_CONFIG.MAX_DISTANCE) {
                alert(`配達距離は${PIN_CONFIG.MIN_DISTANCE}km以上${PIN_CONFIG.MAX_DISTANCE}km以下である必要があります（小数点1桁まで）。`);
                document.getElementById("reg-distance").focus();
                return;
            }

            // 小数点以下2桁以上が入力されていないかチェック
            const distanceStr = document.getElementById("reg-distance").value;
            if (distanceStr.includes(".")) {
                const decimalPart = distanceStr.split(".")[1];
                if (decimalPart && decimalPart.length > 1) {
                    alert("配達距離は小数点1桁までしか入力できません。");
                    document.getElementById("reg-distance").focus();
                    return;
                }
            }

            const formData = {
                pin: {
                    price: price,
                    distance_km: distance,
                    time_slot: document.getElementById("reg-time-slot").value,
                    weather: document.getElementById("reg-weather").value,
                    lat: lat,  // 緯度（latitude）- 数値型
                    lng: lng   // 経度（longitude）- 数値型
                }
            };


            try {
                const response = await fetch("/api/pins", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.status === "success") {
                    // 削除トークンをlocalStorageに保存
                    if (result.data && result.data.delete_token) {
                        localStorage.setItem(`pin_delete_token_${result.data.pin.id}`, result.data.delete_token);
                    }

                    // モーダルを閉じる
                    closeModal("pin-registration-modal");

                    // フォームをリセット
                    pinRegistrationForm.reset();

                    // 選択位置をクリア
                    delete map._selectedLocation;

                    // ピンを再読み込み
                    await loadPins(map);

                    alert("ピンを登録しました");
                } else {
                    console.error("ピン登録エラー:", result);
                    alert(`エラー: ${result.errors ? result.errors.join(", ") : result.error}`);
                }
            } catch (error) {
                console.error("ピン登録に失敗しました:", error);
                alert("ピンの登録に失敗しました");
            }
        });
    }

    // すべてのモーダルに背景クリックで閉じる機能を追加
    const modals = ["about-app-modal", "how-to-use-modal", "terms-modal", "pin-registration-modal", "pin-modal", "login-modal", "signup-modal", "my-area-modal"];
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

    // 削除ボタン
    if (modalDeleteBtn) {
        modalDeleteBtn.addEventListener("click", async () => {
            const modal = document.getElementById("pin-modal");
            if (!modal) return;

            const pinId = modal.dataset.pinId;
            const deleteToken = modal.dataset.deleteToken;
            const pinUserId = modal.dataset.pinUserId;

            if (!pinId) {
                alert("ピンIDが見つかりません");
                return;
            }

            // ログイン状態を確認
            const isLoggedIn = document.getElementById("logout-btn") !== null;

            // 削除権限のチェック（フロントエンド側の簡易チェック）
            // サーバー側で最終的な権限チェックを行う
            if (!deleteToken && !isLoggedIn) {
                alert("削除権限がありません。");
                return;
            }

            if (!confirm("このピンを削除しますか？")) {
                return;
            }

            try {
                // リクエストボディを準備
                const requestBody = {};
                if (deleteToken) {
                    requestBody.delete_token = deleteToken;
                }

                const response = await fetch(`/api/pins/${pinId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCSRFToken()
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(requestBody)
                });

                const result = await response.json();

                if (result.status === "success") {
                    // ピンを再読み込み
                    const map = window.__map;
                    if (map) {
                        await loadPins(map);
                    }

                    closeModal("pin-modal");
                    alert("ピンを削除しました");
                } else {
                    alert(`エラー: ${result.error || "削除に失敗しました"}`);
                }
            } catch (error) {
                console.error("ピン削除に失敗しました:", error);
                alert("ピンの削除に失敗しました");
            }
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

// 登録モードを有効化（中央固定ピン方式）
function enableRegistrationMode() {
    const map = window.__map;
    if (!map) return;

    // ボタンの見た目を変更
    const pinRegistrationBtn = document.getElementById("pin-registration-btn");
    if (pinRegistrationBtn) {
        pinRegistrationBtn.textContent = "登録モード（地図をドラッグ）";
        pinRegistrationBtn.style.backgroundColor = "#10B981";
        pinRegistrationBtn.style.color = "white";
        pinRegistrationBtn.disabled = true;
    }

    // キャンセルボタンを表示
    const cancelBtn = document.getElementById("cancel-registration-btn");
    if (cancelBtn) {
        cancelBtn.classList.remove("hidden");
    }

    // 地図の中央に固定ピンを表示
    const center = map.getCenter();
    const el = document.createElement("div");
    el.innerHTML = `
        <div style="position: relative;">
            <div style="width: 32px; height: 32px; background-color: #EF4444; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite;"></div>
            <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 12px solid #EF4444;"></div>
        </div>
        <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        </style>
    `;

    // 固定ピンを地図の中央に配置（画面中央に固定）
    const fixedPinContainer = document.createElement("div");
    fixedPinContainer.id = "fixed-pin-container";
    fixedPinContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -100%);
        z-index: 1000;
        pointer-events: none;
    `;
    fixedPinContainer.appendChild(el);
    map.getContainer().appendChild(fixedPinContainer);

    map._fixedPinContainer = fixedPinContainer;
    map._registrationMode = true;

    // 地図の移動時に位置を更新
    const updateLocation = () => {
        const center = map.getCenter();
        // MapLibreのgetCenter()はLngLatオブジェクトを返し、lngとlatプロパティを持つ
        // 注意: center.lng = 経度（longitude）、center.lat = 緯度（latitude）
        // 重要: 座標を確実に数値型で保存
        const lng = Number(center.lng);  // 経度
        const lat = Number(center.lat);  // 緯度

        map._selectedLocation = {
            lng: lng,  // 経度（longitude）
            lat: lat   // 緯度（latitude）
        };
    };

    map.on("move", updateLocation);
    map.on("moveend", updateLocation);
    map._registrationMoveHandler = updateLocation;

    // 初期位置を設定
    updateLocation();

    // 「位置を確定」ボタンを表示
    showConfirmButton();
}

// 「位置を確定」ボタンを表示
function showConfirmButton() {
    // 既存のボタンを削除
    const existingBtn = document.getElementById("confirm-location-btn");
    if (existingBtn) {
        existingBtn.remove();
    }

    const map = window.__map;
    if (!map) return;

    const btn = document.createElement("button");
    btn.id = "confirm-location-btn";
    btn.textContent = "位置を確定";
    btn.style.cssText = `
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1001;
        background-color: #3B82F6;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;
    btn.addEventListener("click", () => {
        // 登録モードを無効化
        disableRegistrationMode();

        // 入力モーダルを開く
        openModal("pin-registration-modal");

        // フォームをリセット
        const form = document.getElementById("pin-registration-form");
        if (form) {
            form.reset();
        }
    });

    map.getContainer().appendChild(btn);
    map._confirmButton = btn;
}

// 登録モードを無効化
function disableRegistrationMode() {
    const map = window.__map;
    if (!map) return;

    // 固定ピンを削除
    if (map._fixedPinContainer) {
        map._fixedPinContainer.remove();
        delete map._fixedPinContainer;
    }

    // 確定ボタンを削除
    if (map._confirmButton) {
        map._confirmButton.remove();
        delete map._confirmButton;
    }

    // イベントハンドラーを削除
    if (map._registrationMoveHandler) {
        map.off("move", map._registrationMoveHandler);
        map.off("moveend", map._registrationMoveHandler);
        delete map._registrationMoveHandler;
    }

    map._registrationMode = false;

    // ボタンを元に戻す
    const pinRegistrationBtn = document.getElementById("pin-registration-btn");
    if (pinRegistrationBtn) {
        pinRegistrationBtn.textContent = "ピン登録";
        pinRegistrationBtn.style.backgroundColor = "";
        pinRegistrationBtn.style.color = "";
        pinRegistrationBtn.disabled = false;
    }

    // キャンセルボタンを非表示
    const cancelBtn = document.getElementById("cancel-registration-btn");
    if (cancelBtn) {
        cancelBtn.classList.add("hidden");
    }
}

// 登録モードをキャンセル
function cancelRegistrationMode() {
    const map = window.__map;

    // 登録モードを無効化
    if (map) {
        disableRegistrationMode();

        // 選択位置をクリア
        delete map._selectedLocation;
    }
}

// モーダルが閉じられたときに登録モードをキャンセル
const originalCloseModal = closeModal;
closeModal = function (modalId) {
    originalCloseModal(modalId);
    if (modalId === "pin-registration-modal") {
        // 登録モードをキャンセル（仮ピンも削除）
        cancelRegistrationMode();
    }
};

// グローバルに公開
window.showPinModal = showPinModal;
window.hidePinModal = hidePinModal;
window.loadPins = loadPins;

// 地図とモーダルの初期化
function initializeApp() {
    // 既存の地図インスタンスがある場合のクリーンアップ処理（Turbo Drive対策）
    if (window.__map) {
        window.__map.remove();
        window.__map = null;
    }
    // マーカー配列もリセット
    Object.keys(pinMarkers).forEach(key => delete pinMarkers[key]);

    // トグル状態をリセット
    showMyPinsOnly = false;
    const myPinsToggle = document.getElementById("my-pins-toggle");
    if (myPinsToggle) {
        updateToggleButton(myPinsToggle, false);
    }

    initMap();
    initModal();
    // initMap内でloadPins(map)が呼ばれるため、ここでの重複処理は不要
}

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

document.addEventListener("turbo:load", () => {
    initializeApp();
});
