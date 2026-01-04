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

// エラーメッセージ定数
const ERROR_MESSAGES = {
    PRICE_RANGE: (min, max) => `金額は${min}円以上${max}円以下である必要があります。`,
    DISTANCE_RANGE: (min, max) => `配達距離は${min}km以上${max}km以下である必要があります（小数点1桁まで）。`,
    DISTANCE_DECIMAL: "配達距離は小数点1桁までしか入力できません。",
    LOCATION_NOT_SELECTED: "位置が選択されていません。モーダルを閉じて、もう一度地図上をクリックしてください。",
    COORDINATE_INVALID: (error) => `${error}。もう一度位置を選択してください。`,
    MAP_NOT_LOADED: "地図が読み込まれていません",
    PIN_ID_NOT_FOUND: "ピンIDが見つかりません",
    LOGIN_FAILED: "ログインに失敗しました",
    SIGNUP_FAILED: "登録に失敗しました",
    PASSWORD_MISMATCH: "パスワードが一致しません",
    PIN_REGISTRATION_FAILED: "ピンの登録に失敗しました",
    PIN_EDIT_FAILED: "ピンの編集に失敗しました",
    PIN_DELETE_FAILED: "削除に失敗しました",
    NO_DELETE_PERMISSION: "削除権限がありません。",
    GEOLOCATION_ERROR: (message) => `現在地の取得に失敗しました: ${message}`,
    GEOLOCATION_NOT_SUPPORTED: "このブラウザは位置情報をサポートしていません",
    MY_AREA_SAVE_FAILED: "マイエリアの保存に失敗しました",
    SHARE_URL_GET_FAILED: "共有URLの取得に失敗しました",
    SHARE_URL_REGENERATE_FAILED: "共有URLの再発行に失敗しました",
    URL_COPY_FAILED: "URLのコピーに失敗しました",
    RELOGIN_REQUIRED: "セッションが無効になりました。再ログインが必要です。",
    OPERATION_MODE_ACTIVE: "操作中のため、先に確定またはキャンセルしてください"
};

// 成功メッセージ定数
const SUCCESS_MESSAGES = {
    PIN_REGISTERED: "ピンを登録しました",
    PIN_EDITED: "ピンを編集しました",
    PIN_DELETED: "ピンを削除しました",
    MY_AREA_SAVED: "マイエリアを保存しました",
    SHARE_URL_COPIED: "URLをコピーしました！",
    SHARE_URL_REGENERATED: "共有URLを再発行しました"
};

// 要素ID定数
const ELEMENT_IDS = {
    // フォーム要素
    REG_PRICE: "reg-price",
    REG_DISTANCE: "reg-distance",
    REG_TIME_SLOT: "reg-time-slot",
    REG_WEATHER: "reg-weather",
    REG_VISIBILITY: "reg-visibility",
    EDIT_PRICE: "edit-price",
    EDIT_DISTANCE: "edit-distance",
    EDIT_TIME_SLOT: "edit-time-slot",
    EDIT_WEATHER: "edit-weather",
    EDIT_VISIBILITY: "edit-visibility",
    // エラー表示
    PIN_REGISTRATION_ERROR: "pin-registration-error",
    PIN_EDIT_ERROR: "pin-edit-error",
    LOGIN_ERROR: "login-error",
    SIGNUP_ERROR: "signup-error",
    MY_AREA_ERROR: "my-area-error",
    // ボタン
    LOGO: "logo",
    MOBILE_MENU_BTN: "mobile-menu-btn",
    MOBILE_MENU: "mobile-menu",
    MOBILE_MENU_CLOSE: "mobile-menu-close",
    CITY_NAV_TOGGLE: "city-nav-toggle",
    CITY_NAV_CONTENT: "city-nav-content",
    CITY_NAV_ARROW: "city-nav-arrow",
    PIN_REGISTRATION_BTN: "pin-registration-btn",
    CANCEL_REGISTRATION_BTN: "cancel-registration-btn",
    LOGIN_BTN: "login-btn",
    LOGOUT_BTN: "logout-btn",
    MY_PINS_TOGGLE: "my-pins-toggle",
    MOBILE_MY_PINS_TOGGLE: "mobile-my-pins-toggle",
    SHARE_MAP_BTN: "share-map-btn",
    MOBILE_SHARE_MAP_BTN: "mobile-share-map-btn",
    EXIT_SHARED_MAP_BTN: "exit-shared-map-btn",
    MODAL_EDIT_BTN: "modal-edit-btn",
    MODAL_DELETE_BTN: "modal-delete-btn",
    // 共有マップモーダル
    SHARE_URL_INPUT: "share-url-input",
    COPY_SHARE_URL_BTN: "copy-share-url-btn",
    REGENERATE_SHARE_URL_BTN: "regenerate-share-url-btn",
    SHARE_URL_STATUS: "share-url-status",
    // フォーム
    PIN_REGISTRATION_FORM: "pin-registration-form",
    PIN_EDIT_FORM: "pin-edit-form",
    LOGIN_FORM: "login-form",
    SIGNUP_FORM: "signup-form",
    // モーダル
    PIN_MODAL: "pin-modal",
    PIN_REGISTRATION_MODAL: "pin-registration-modal",
    PIN_EDIT_MODAL: "pin-edit-modal",
    LOGIN_MODAL: "login-modal",
    SIGNUP_MODAL: "signup-modal",
    MY_AREA_MODAL: "my-area-modal",
    ABOUT_APP_MODAL: "about-app-modal",
    HOW_TO_USE_MODAL: "how-to-use-modal",
    TERMS_MODAL: "terms-modal",
    SHARE_MAP_MODAL: "share-map-modal",
    // 地図オーバーレイ
    MAP_OVERLAY: "map-overlay"
};

// モーダルIDのリスト
const MODAL_IDS = [
    ELEMENT_IDS.ABOUT_APP_MODAL,
    ELEMENT_IDS.HOW_TO_USE_MODAL,
    ELEMENT_IDS.TERMS_MODAL,
    ELEMENT_IDS.PIN_REGISTRATION_MODAL,
    ELEMENT_IDS.PIN_MODAL,
    ELEMENT_IDS.PIN_EDIT_MODAL,
    ELEMENT_IDS.LOGIN_MODAL,
    ELEMENT_IDS.SIGNUP_MODAL,
    ELEMENT_IDS.MY_AREA_MODAL
];

// ============================================================================
// アプリケーション状態管理
// ============================================================================

const appState = {
    mode: "normal" // "normal" | "pin_register" | "my_area_select"
};

// 操作モード中に開けないモーダルのリスト
const RESTRICTED_MODALS_IN_OPERATION_MODE = [
    ELEMENT_IDS.ABOUT_APP_MODAL,
    ELEMENT_IDS.HOW_TO_USE_MODAL,
    ELEMENT_IDS.TERMS_MODAL,
    ELEMENT_IDS.MY_AREA_MODAL
];

// 操作モード中に無効化するボタンのIDリスト
const RESTRICTED_BUTTONS_IN_OPERATION_MODE = [
    "about-app-btn",
    "how-to-use-btn",
    "terms-btn",
    "my-area-settings-btn",
    "mobile-about-app-btn",
    "mobile-how-to-use-btn",
    "mobile-terms-btn",
    "mobile-my-area-settings-btn"
];

// ============================================================================
// DOM要素キャッシュ
// ============================================================================

const DOMCache = {
    elements: {},

    get(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    },

    clear() {
        this.elements = {};
    }
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

/**
 * Deviseの英語エラーメッセージを日本語に変換
 * @param {string} errorMessage - 英語のエラーメッセージ
 * @returns {string} 日本語のエラーメッセージ
 */
function translateDeviseError(errorMessage) {
    if (!errorMessage || typeof errorMessage !== 'string') {
        return errorMessage;
    }

    const translations = {
        "Email has already been taken": "メールアドレスは既に使用されています",
        "Email is invalid": "メールアドレスが不正です",
        "Email can't be blank": "メールアドレスを入力してください",
        "Password is too short (minimum is 6 characters)": "パスワードは6文字以上で入力してください",
        "Password confirmation doesn't match Password": "パスワード（確認）が一致しません",
        "Password can't be blank": "パスワードを入力してください",
        "User name has already been taken": "ユーザー名は既に使用されています",
        "User name can't be blank": "ユーザー名を入力してください"
    };

    // 完全一致をチェック
    if (translations[errorMessage]) {
        return translations[errorMessage];
    }

    // 部分一致をチェック（"Email has already been taken"など）
    for (const [key, value] of Object.entries(translations)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    // 翻訳が見つからない場合は元のメッセージを返す
    return errorMessage;
}

/**
 * Deviseのエラーメッセージ配列を日本語に変換
 * @param {Array<string>} errors - エラーメッセージの配列
 * @returns {Array<string>} 日本語のエラーメッセージの配列
 */
function translateDeviseErrors(errors) {
    if (!Array.isArray(errors)) {
        return [translateDeviseError(errors)];
    }

    return errors.map(error => translateDeviseError(error));
}

function getCityFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    return CITY[city] ? city : "tokyo";
}

function initMap() {
    const el = DOMCache.get("map");
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
            const myAreaBtn = DOMCache.get("my-area-btn");
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
    const el = DOMCache.get("map");
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
        const result = await apiRequest("/api/my_area", {
            method: "GET"
        });

        if (result.success && result.data) {
            return result.data;
        }
        return null;
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
    const myAreaBtn = DOMCache.get("my-area-btn");
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

// マイエリア設定モーダルの初期化（旧実装、互換性のため残す）
function initMyAreaModal(map) {
    // 旧実装は削除し、マイエリア選択モードに移行
    // この関数は空にしておく（既存の呼び出しがあるため）
}

// マイエリア情報表示を更新
function updateMyAreaInfo(lat, lng, zoom) {
    const infoDiv = DOMCache.get("my-area-info");
    const latDisplay = DOMCache.get("my-area-lat-display");
    const lngDisplay = DOMCache.get("my-area-lng-display");
    const zoomDisplay = DOMCache.get("my-area-zoom-display");

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
        // URLパラメータからsharedトークンを取得
        const urlParams = new URLSearchParams(window.location.search);
        const sharedToken = urlParams.get('shared');
        const currentUserId = getCurrentUserId();

        // 共有モードの場合はsharedパラメータを付与
        const apiUrl = sharedToken ? `/api/pins?shared=${encodeURIComponent(sharedToken)}` : "/api/pins";

        const result = await apiRequest(apiUrl, {
            method: "GET",
            requireCSRF: false // ピン一覧取得はCSRF不要
        });

        // APIレスポンス後、共有モードかどうかを判定
        // 自分の共有トークンの場合は共有モードとして扱わない
        let isSharedMode = false;
        if (sharedToken && result.success) {
            // 自分の共有トークンかどうかを判定するため、API側で通常モードとして扱われているか確認
            // ログインしていて、sharedトークンがある場合は、API側で自分のトークンかどうか判定済み
            // 自分のトークンの場合は通常モードとして扱われているので、共有モードではない
            // 他人のトークンの場合のみ共有モードとして扱う
            isSharedMode = !currentUserId; // 未ログインの場合のみ共有モード
        }

        // 共有モードの場合はバッジを表示し、「自分のピンのみ表示」トグルを無効化
        const sharedMapBadge = DOMCache.get("shared-map-badge");
        const myPinsToggle = DOMCache.get(ELEMENT_IDS.MY_PINS_TOGGLE);
        const mobileMyPinsToggle = DOMCache.get(ELEMENT_IDS.MOBILE_MY_PINS_TOGGLE);

        if (isSharedMode) {
            // 共有モード（他人の共有トークン）
            if (sharedMapBadge) {
                sharedMapBadge.classList.remove("hidden");
            }
            if (myPinsToggle) {
                myPinsToggle.disabled = true;
                myPinsToggle.classList.add("opacity-50", "cursor-not-allowed");
            }
            if (mobileMyPinsToggle) {
                mobileMyPinsToggle.disabled = true;
                mobileMyPinsToggle.classList.add("opacity-50", "cursor-not-allowed");
            }
            // 共有モードでは「自分のピンのみ表示」を無効化
            showMyPinsOnly = false;
        } else {
            // 通常モード（自分の共有トークンまたは通常アクセス）
            if (sharedMapBadge) {
                sharedMapBadge.classList.add("hidden");
            }
            if (myPinsToggle) {
                myPinsToggle.disabled = false;
                myPinsToggle.classList.remove("opacity-50", "cursor-not-allowed");
            }
            if (mobileMyPinsToggle) {
                mobileMyPinsToggle.disabled = false;
                mobileMyPinsToggle.classList.remove("opacity-50", "cursor-not-allowed");
            }
        }

        if (!result.success) {
            console.error("APIリクエストが失敗しました:", result.error);
            return;
        }

        // データを正規化（配列そのものが来るか、dataプロパティに来るか両対応）
        let pinsData = [];
        if (Array.isArray(result.data)) {
            pinsData = result.data;
        }

        // 自分のピンのみ表示モードの場合、フィルタリング
        if (showMyPinsOnly) {
            const currentUserId = getCurrentUserId();
            if (currentUserId) {
                // ログイン済みの場合：user_idが現在のユーザーIDと一致するピンのみ表示
                // 未ログインで登録したピン（user_idがnull）は除外
                pinsData = pinsData.filter(pin => {
                    if (!pin.user_id) {
                        return false; // user_idがないピン（未ログイン投稿）は除外
                    }
                    const pinUserId = typeof pin.user_id === 'number' ? pin.user_id : parseInt(pin.user_id, 10);
                    return pinUserId === currentUserId;
                });
            } else {
                // 未ログイン時は「自分のピンのみ表示」は無効（すべて表示）
                // この分岐は通常発生しないが、念のため
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
            console.warn("表示できるピンがありません");
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
    const modal = DOMCache.get(ELEMENT_IDS.PIN_MODAL);
    if (!modal) return;

    // 共有モードかどうかを判定
    // 自分の共有トークンの場合は共有モードとして扱わない
    const urlParams = new URLSearchParams(window.location.search);
    const sharedToken = urlParams.get('shared');
    const currentUserId = getCurrentUserId();
    const isSharedMode = sharedToken !== null && !currentUserId; // 未ログインの場合のみ共有モード

    // モーダルにデータを設定
    const modalPrice = DOMCache.get("modal-price");
    const modalDistance = DOMCache.get("modal-distance");
    const modalTimeSlot = DOMCache.get("modal-time-slot");
    const modalWeather = DOMCache.get("modal-weather");
    const modalCreatedAt = DOMCache.get("modal-created-at");
    const modalEditedAt = DOMCache.get("modal-edited-at");
    const modalEditedAtContainer = DOMCache.get("modal-edited-at-container");
    const modalVisibility = DOMCache.get("modal-visibility");
    const modalVisibilityContainer = DOMCache.get("modal-visibility-container");

    if (modalPrice) modalPrice.value = `¥${pin.price.toLocaleString()}`;
    if (modalDistance) modalDistance.value = `${pin.distance_km}km`;
    if (modalTimeSlot) modalTimeSlot.value = pin.time_slot;
    if (modalWeather) modalWeather.value = pin.weather;

    // 登録日時の表示
    if (modalCreatedAt && pin.created_at) {
        const createdAt = new Date(pin.created_at);
        modalCreatedAt.value = createdAt.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 編集日時の表示（編集されている場合のみ）
    if (modalEditedAt && modalEditedAtContainer) {
        if (pin.edited_at) {
            const editedAt = new Date(pin.edited_at);
            modalEditedAt.value = editedAt.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            modalEditedAtContainer.classList.remove("hidden");
        } else {
            modalEditedAtContainer.classList.add("hidden");
        }
    }

    // 公開設定の表示（自分のピンの場合のみ）
    if (modalVisibility && modalVisibilityContainer) {
        const currentUserId = getCurrentUserId();
        const pinUserId = pin.user_id;
        const isMyPin = currentUserId && pinUserId && currentUserId === pinUserId;

        if (isMyPin) {
            // visibilityがnullの場合はpublicとして扱う
            const visibility = pin.visibility || 'public';
            const visibilityText = visibility === 'private' ? '非公開' : '公開';
            modalVisibility.value = visibilityText;
            modalVisibilityContainer.classList.remove("hidden");
        } else {
            modalVisibilityContainer.classList.add("hidden");
        }
    }

    // 削除トークンを保存（削除時に使用）
    // 注意: ピン作成時に返されたdelete_tokenをlocalStorageに保存する必要があります
    modal.dataset.pinId = pin.id;
    modal.dataset.pinUserId = pin.user_id || ""; // ピンのuser_idを保存

    // localStorageから削除トークンを取得
    const storedToken = localStorage.getItem(`pin_delete_token_${pin.id}`);
    modal.dataset.deleteToken = storedToken || "";

    // 編集ボタンの表示判定
    const editBtn = DOMCache.get(ELEMENT_IDS.MODAL_EDIT_BTN);
    if (editBtn) {
        // 共有モードの場合は常に非表示
        if (isSharedMode) {
            editBtn.classList.add("hidden");
        } else {
            const currentUserId = getCurrentUserId();
            const pinUserId = pin.user_id;
            const isLoggedIn = currentUserId !== null;
            const isAdmin = isCurrentUserAdmin();

            // 編集可能な条件：
            // 1. 管理者はすべてのピンを編集可能
            // 2. ログイン後に登録したピン（user_idが存在する）の場合：ログイン必須かつ自分のピン
            // 3. 未ログイン時に登録したピン（user_idがnull）の場合：delete_tokenがあれば編集可能
            let canEdit = false;
            let isAdminEdit = false;

            if (isAdmin) {
                canEdit = true;
                isAdminEdit = true;
            } else if (pinUserId) {
                // ログイン後に登録したピン：ログイン必須かつ自分のピン
                canEdit = isLoggedIn && currentUserId === pinUserId;
            } else {
                // 未ログイン時に登録したピン：delete_tokenがあれば編集可能
                canEdit = storedToken && storedToken !== "";
            }

            if (canEdit) {
                editBtn.classList.remove("hidden");
                // 管理者の場合はボタンテキストを変更
                if (isAdminEdit) {
                    editBtn.textContent = "管理者：編集";
                } else {
                    editBtn.textContent = "編集";
                }
                // 編集用にピン情報を保存
                editBtn.dataset.pinId = pin.id;
            } else {
                editBtn.classList.add("hidden");
            }
        }
    }

    // 削除ボタンの表示判定
    const deleteBtn = DOMCache.get(ELEMENT_IDS.MODAL_DELETE_BTN);
    if (deleteBtn) {
        // 共有モードの場合は常に非表示
        if (isSharedMode) {
            deleteBtn.classList.add("hidden");
        } else {
            // ログイン状態を確認
            const isLoggedIn = DOMCache.get(ELEMENT_IDS.LOGOUT_BTN) !== null;
            const currentUserId = getCurrentUserId();
            const pinUserId = pin.user_id;
            const isAdmin = isCurrentUserAdmin();

            // 削除可能な条件：
            // 1. 管理者はすべてのピンを削除可能
            // 2. ログイン後に登録したピン（user_idが存在する）の場合：ログイン必須かつ自分のピン
            // 3. 未ログイン時に登録したピン（user_idがnull）の場合：delete_tokenがあれば削除可能
            let canDelete = false;
            let isAdminDelete = false;

            if (isAdmin) {
                canDelete = true;
                isAdminDelete = true;
            } else if (pinUserId) {
                // ログイン後に登録したピン：ログイン必須かつ自分のピン
                canDelete = isLoggedIn && currentUserId === pinUserId;
            } else {
                // 未ログイン時に登録したピン：delete_tokenがあれば削除可能
                canDelete = storedToken && storedToken !== "";
            }

            if (canDelete) {
                deleteBtn.classList.remove("hidden");
                deleteBtn.disabled = false;
                // 管理者の場合はボタンテキストを変更
                if (isAdminDelete) {
                    deleteBtn.textContent = "管理者：削除";
                } else {
                    deleteBtn.textContent = "削除";
                }
            } else {
                deleteBtn.classList.add("hidden");
            }
        }
    }

    modal.classList.remove("hidden");
}

// 編集モーダルを開く関数
async function openEditModal(pinId) {
    // ピン情報をAPIから取得
    const result = await apiRequest(`/api/pins`, {
        method: "GET",
        requireCSRF: false
    });

    if (!result.success) {
        // 401エラーの場合は再ログインメッセージを表示してページをリロード
        if (result.requiresRelogin) {
            showToast(ERROR_MESSAGES.RELOGIN_REQUIRED, "error");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showToast("ピン情報の取得に失敗しました", "error");
        }
        return;
    }

    // ピンIDに一致するピンを探す
    const pin = result.data.find(p => p.id === parseInt(pinId, 10));
    if (!pin) {
        // ピンが見つからない場合、元のピン情報を確認
        const modal = DOMCache.get(ELEMENT_IDS.PIN_MODAL);
        const pinUserId = modal ? modal.dataset.pinUserId : null;
        const currentUserId = getCurrentUserId();

        // 自分のピン（user_idが存在する）だった場合、セッションが無効になった可能性が高い
        if (pinUserId && pinUserId !== "" && currentUserId) {
            showToast(ERROR_MESSAGES.RELOGIN_REQUIRED, "error");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showToast("ピンが見つかりません", "error");
        }
        return;
    }

    // 編集モーダルに値を設定
    const editPrice = DOMCache.get(ELEMENT_IDS.EDIT_PRICE);
    const editDistance = DOMCache.get(ELEMENT_IDS.EDIT_DISTANCE);
    const editTimeSlot = DOMCache.get(ELEMENT_IDS.EDIT_TIME_SLOT);
    const editWeather = DOMCache.get(ELEMENT_IDS.EDIT_WEATHER);

    if (editPrice) editPrice.value = pin.price;
    if (editDistance) editDistance.value = pin.distance_km;
    if (editTimeSlot) editTimeSlot.value = pin.time_slot;
    if (editWeather) editWeather.value = pin.weather;

    // ログイン状態とピンのuser_idを確認
    const currentUserId = getCurrentUserId();
    const isAdmin = isCurrentUserAdmin();
    const editVisibilitySection = DOMCache.get("edit-visibility-section");
    const editVisibility = DOMCache.get(ELEMENT_IDS.EDIT_VISIBILITY);
    if (editVisibilitySection && editVisibility) {
        // 匿名投稿ピン（user_idがnull）の場合は、管理者でも公開設定を変更不可（公開のみ）
        // ログイン後に登録したピン（user_idが存在する）の場合のみ表示・設定
        // 通常ユーザー：自分のピンのみ
        // 管理者：すべてのログインピン（匿名投稿は除く）
        if (pin.user_id && ((isAdmin) || (currentUserId && currentUserId === pin.user_id))) {
            editVisibility.value = pin.visibility || "public";
            editVisibilitySection.classList.remove("hidden");
        } else {
            // 匿名投稿ピン、または未ログインで登録したピンの場合は非表示
            editVisibilitySection.classList.add("hidden");
        }
    }

    // ピンIDを保存
    const editForm = DOMCache.get(ELEMENT_IDS.PIN_EDIT_FORM);
    if (editForm) {
        editForm.dataset.pinId = pinId;
        // delete_tokenとuser_idも保存（未ログインで登録したピンの編集用）
        const modal = DOMCache.get(ELEMENT_IDS.PIN_MODAL);
        if (modal) {
            const deleteToken = modal.dataset.deleteToken;
            const pinUserId = modal.dataset.pinUserId;
            if (deleteToken) {
                editForm.dataset.deleteToken = deleteToken;
            }
            if (pinUserId !== undefined) {
                editForm.dataset.pinUserId = pinUserId;
            }
        }
    }

    // ピン詳細モーダルを閉じて編集モーダルを開く
    closeModal(ELEMENT_IDS.PIN_MODAL);
    openModal(ELEMENT_IDS.PIN_EDIT_MODAL);
}

// モーダルを開く関数
function openModal(modalId) {
    // 操作モード中は特定のモーダルを開けないようにする
    if (appState.mode !== "normal" && RESTRICTED_MODALS_IN_OPERATION_MODE.includes(modalId)) {
        showToast(ERROR_MESSAGES.OPERATION_MODE_ACTIVE, "error");
        return;
    }

    const modal = DOMCache.get(modalId);
    if (modal) {
        modal.classList.remove("hidden");

        // ピン登録モーダルの場合、エラー表示をクリア
        if (modalId === ELEMENT_IDS.PIN_REGISTRATION_MODAL) {
            clearFormError(ELEMENT_IDS.PIN_REGISTRATION_ERROR);
        }
    }
    // モバイルメニューを閉じる
    closeMobileMenu();
}

// モーダルを閉じる関数
function closeModal(modalId) {
    const modal = DOMCache.get(modalId);
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

// 現在のユーザーが管理者かどうかを判定
function isCurrentUserAdmin() {
    const header = document.querySelector("header");
    if (header) {
        return header.dataset.isAdmin === 'true';
    }
    return false;
}

// CSRFトークンを取得する関数
function getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

/**
 * APIリクエストを送信する共通関数
 * @param {string} url - リクエストURL
 * @param {Object} options - リクエストオプション
 * @param {string} options.method - HTTPメソッド（デフォルト: "GET"）
 * @param {Object} options.headers - 追加ヘッダー
 * @param {Object} options.body - リクエストボディ（JSON.stringifyされる）
 * @param {boolean} options.requireCSRF - CSRFトークンが必要か（デフォルト: true）
 * @returns {Promise<{success: boolean, data?: any, error?: string, response?: Response}>}
 */
async function apiRequest(url, options = {}) {
    const {
        method = "GET",
        headers = {},
        body = null,
        requireCSRF = true
    } = options;

    // デフォルトヘッダー
    const defaultHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    // CSRFトークンを追加（必要な場合）
    if (requireCSRF) {
        defaultHeaders["X-CSRF-Token"] = getCSRFToken();
    }

    // ヘッダーをマージ
    const requestHeaders = { ...defaultHeaders, ...headers };

    // リクエスト設定
    const config = {
        method: method,
        headers: requestHeaders,
        credentials: 'same-origin'
    };

    // ボディがある場合はJSON文字列化
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);

        // レスポンスのContent-Typeを確認
        const contentType = response.headers.get("content-type");
        let result = null;

        if (contentType && contentType.includes("application/json")) {
            result = await response.json();
        } else if (response.ok && response.status === 204) {
            // No Content レスポンス
            return { success: true, data: null, response };
        } else {
            // JSONでない場合はテキストとして取得
            const text = await response.text();
            console.error("JSON以外のレスポンス:", text);
            // エラーレスポンスの場合は、テキストからエラーメッセージを抽出
            if (!response.ok) {
                return {
                    success: false,
                    error: `サーバーエラー (${response.status}): ${text.substring(0, 200)}`
                };
            }
            throw new Error("サーバーからのレスポンスがJSON形式ではありません");
        }

        // レスポンスが成功したかチェック
        if (response.ok) {
            // 成功レスポンスの形式を統一
            const data = result.data !== undefined ? result.data : result;
            return { success: true, data, response };
        } else {
            // エラーレスポンス
            const errorMessage = result.errors
                ? result.errors.join(", ")
                : (result.error || `リクエストに失敗しました (${response.status})`);
            // 401エラーの場合は再ログインフラグを設定
            const requiresRelogin = response.status === 401;
            return { success: false, error: errorMessage, response, requiresRelogin };
        }
    } catch (error) {
        console.error("APIリクエストエラー:", error);
        return {
            success: false,
            error: error.message || "ネットワークエラーが発生しました"
        };
    }
}

/**
 * ログアウト処理を実行する
 * Turbo Drive対応のため、フォーム送信方式を使用
 */
function handleLogout() {
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
}

// エラーメッセージを表示する関数
function showFormError(errorDivId, message, focusElementId = null) {
    const errorDiv = DOMCache.get(errorDivId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }

    if (focusElementId) {
        const focusElement = DOMCache.get(focusElementId);
        if (focusElement) {
            focusElement.focus();
        }
    }
}

// エラーメッセージをクリアする関数
function clearFormError(errorDivId) {
    const errorDiv = DOMCache.get(errorDivId);
    if (errorDiv) {
        errorDiv.classList.add("hidden");
        errorDiv.textContent = "";
    }
}

// ピンフォームデータのバリデーション
function validatePinFormData(data) {
    const errors = [];

    // 金額のバリデーション
    if (isNaN(data.price) || data.price < PIN_CONFIG.MIN_PRICE || data.price > PIN_CONFIG.MAX_PRICE) {
        errors.push({
            field: 'price',
            message: ERROR_MESSAGES.PRICE_RANGE(PIN_CONFIG.MIN_PRICE, PIN_CONFIG.MAX_PRICE)
        });
    }

    // 配達距離のバリデーション
    if (isNaN(data.distance) || data.distance < PIN_CONFIG.MIN_DISTANCE || data.distance > PIN_CONFIG.MAX_DISTANCE) {
        errors.push({
            field: 'distance',
            message: ERROR_MESSAGES.DISTANCE_RANGE(PIN_CONFIG.MIN_DISTANCE, PIN_CONFIG.MAX_DISTANCE)
        });
    }

    // 小数点以下2桁以上が入力されていないかチェック
    if (data.distanceStr && data.distanceStr.includes(".")) {
        const decimalPart = data.distanceStr.split(".")[1];
        if (decimalPart && decimalPart.length > 1) {
            errors.push({
                field: 'distance',
                message: ERROR_MESSAGES.DISTANCE_DECIMAL
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * トースト通知を表示する
 * @param {string} message - 表示するメッセージ
 * @param {string} type - 通知の種類 ('success' | 'error' | 'info') デフォルト: 'success'
 * @param {number} duration - 表示時間（ミリ秒）デフォルト: 3000
 */
function showToast(message, type = 'success', duration = 3000) {
    // toast-containerは常に存在するため、直接取得（DOMCacheを使わない）
    // DOMCacheがクリアされた場合でも動作するように、常に直接取得
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('toast-containerが見つかりません。HTMLを確認してください。');
        // フォールバック: bodyに直接追加
        const fallbackContainer = document.createElement('div');
        fallbackContainer.id = 'toast-container';
        fallbackContainer.className = 'fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(fallbackContainer);
        return showToast(message, type, duration); // 再帰的に呼び出し
    }

    // トースト要素を作成
    const toast = document.createElement('div');

    // タイプに応じたスタイルを設定
    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    // クラス名を設定（アニメーション用のクラスも含む）
    toast.className = `pointer-events-auto transform transition-all duration-300 ease-in-out translate-x-full opacity-0 ${typeStyles[type] || typeStyles.success} px-6 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md`;

    // メッセージを設定
    toast.textContent = message;

    // コンテナに追加
    container.appendChild(toast);

    // アニメーション: スライドイン（次のフレームで実行）
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });
    });

    // 指定時間後に自動削除
    setTimeout(() => {
        // アニメーション: スライドアウト
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');

        // アニメーション完了後に要素を削除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
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

// モーダルボタンのイベントリスナーを設定する共通関数
function setupModalButton(buttonId, modalId, shouldCloseMobileMenu = false) {
    const button = DOMCache.get(buttonId);
    if (button) {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            if (shouldCloseMobileMenu) {
                closeMobileMenu();
            }
            openModal(modalId);
        });
    }
}

// 操作モード中に無効化するボタンの状態を更新
function updateRestrictedButtonsState() {
    const isRestricted = appState.mode !== "normal";

    RESTRICTED_BUTTONS_IN_OPERATION_MODE.forEach(buttonId => {
        const button = DOMCache.get(buttonId);
        if (button) {
            if (isRestricted) {
                button.classList.add("opacity-50", "cursor-not-allowed");
                button.disabled = true;
            } else {
                button.classList.remove("opacity-50", "cursor-not-allowed");
                button.disabled = false;
            }
        }
    });
}

// ロゴの初期化
function initLogo() {
    const logo = DOMCache.get(ELEMENT_IDS.LOGO);
    if (logo) {
        logo.addEventListener("click", () => {
            window.location.reload();
        });
    }
}

// モバイルメニューの初期化
function initMobileMenu() {
    const mobileMenuBtn = DOMCache.get(ELEMENT_IDS.MOBILE_MENU_BTN);
    const mobileMenu = DOMCache.get(ELEMENT_IDS.MOBILE_MENU);
    const mobileMenuDrawer = DOMCache.get("mobile-menu-drawer");
    const mobileMenuClose = DOMCache.get(ELEMENT_IDS.MOBILE_MENU_CLOSE);
    const pinRegistrationBtn = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_BTN);
    const pinRegistrationBtnContainer = pinRegistrationBtn ? pinRegistrationBtn.closest('div') : null;

    if (mobileMenuBtn && mobileMenu && mobileMenuDrawer) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.remove("hidden");
            // ピン登録ボタンを非表示（ドロワー展開時）
            if (pinRegistrationBtnContainer) {
                pinRegistrationBtnContainer.classList.add("hidden");
            }
            // 次のフレームでアニメーションを開始（hidden解除後に）
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    mobileMenuDrawer.classList.remove("translate-x-full");
                    mobileMenuDrawer.classList.add("translate-x-0");
                });
            });
        });
    }

    if (mobileMenuClose && mobileMenu && mobileMenuDrawer) {
        mobileMenuClose.addEventListener("click", () => {
            closeMobileMenu();
        });
    }

    // モバイルメニューの背景クリックで閉じる
    if (mobileMenu && mobileMenuDrawer) {
        mobileMenu.addEventListener("click", (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }

}

// 都市ナビゲーションの初期化
function initCityNavigation() {
    const cityNavToggle = DOMCache.get(ELEMENT_IDS.CITY_NAV_TOGGLE);
    const cityNavContent = DOMCache.get(ELEMENT_IDS.CITY_NAV_CONTENT);
    const cityNavArrow = DOMCache.get(ELEMENT_IDS.CITY_NAV_ARROW);

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
}

// ヘッダーボタンの初期化
function initHeaderButtons() {
    // マイエリア設定ボタンは選択モードに入る（モーダルを開かない）
    const myAreaSettingsBtn = DOMCache.get("my-area-settings-btn");
    if (myAreaSettingsBtn) {
        myAreaSettingsBtn.addEventListener("click", () => {
            enableMyAreaSelectionMode();
        });
    }

    setupModalButton("about-app-btn", ELEMENT_IDS.ABOUT_APP_MODAL);
    setupModalButton("how-to-use-btn", ELEMENT_IDS.HOW_TO_USE_MODAL);
    setupModalButton("terms-btn", ELEMENT_IDS.TERMS_MODAL);
    setupModalButton("login-btn", ELEMENT_IDS.LOGIN_MODAL);
}

// モバイルボタンの初期化
function initMobileButtons() {
    // マイエリア設定ボタンは選択モードに入る（モーダルを開かない）
    const mobileMyAreaSettingsBtn = DOMCache.get("mobile-my-area-settings-btn");
    if (mobileMyAreaSettingsBtn) {
        mobileMyAreaSettingsBtn.addEventListener("click", () => {
            closeMobileMenu();
            enableMyAreaSelectionMode();
        });
    }

    setupModalButton("mobile-about-app-btn", ELEMENT_IDS.ABOUT_APP_MODAL, true);
    setupModalButton("mobile-how-to-use-btn", ELEMENT_IDS.HOW_TO_USE_MODAL, true);
    setupModalButton("mobile-terms-btn", ELEMENT_IDS.TERMS_MODAL, true);
    setupModalButton("mobile-login-btn", ELEMENT_IDS.LOGIN_MODAL, true);

}

// その他のボタンの初期化
function initOtherButtons() {
    const pinRegistrationBtn = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_BTN);
    const cancelRegistrationBtn = DOMCache.get(ELEMENT_IDS.CANCEL_REGISTRATION_BTN);
    const logoutBtn = DOMCache.get(ELEMENT_IDS.LOGOUT_BTN);
    const shareMapBtn = DOMCache.get(ELEMENT_IDS.SHARE_MAP_BTN);
    const mobileShareMapBtn = DOMCache.get(ELEMENT_IDS.MOBILE_SHARE_MAP_BTN);
    const exitSharedMapBtn = DOMCache.get(ELEMENT_IDS.EXIT_SHARED_MAP_BTN);
    const mobileLogoutBtn = DOMCache.get("mobile-logout-btn");
    const mobileMyAreaBtn = DOMCache.get("mobile-my-area-btn");
    const cityNavContent = DOMCache.get(ELEMENT_IDS.CITY_NAV_CONTENT);
    const cityNavArrow = DOMCache.get(ELEMENT_IDS.CITY_NAV_ARROW);
    const mobileMenu = DOMCache.get(ELEMENT_IDS.MOBILE_MENU);

    if (pinRegistrationBtn) {
        pinRegistrationBtn.addEventListener("click", () => {
            enableRegistrationMode();
        });
    }

    if (cancelRegistrationBtn) {
        cancelRegistrationBtn.addEventListener("click", () => {
            const map = window.__map;
            if (map && map._myAreaSelectionMode) {
                // マイエリア選択モードの場合はキャンセル
                cancelMyAreaSelectionMode();
            } else {
                // ピン登録モードの場合はキャンセル
                cancelRegistrationMode();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            closeMobileMenu();
            handleLogout();
        });
    }

    if (shareMapBtn) {
        shareMapBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openShareMapModal();
        });
    }

    if (mobileShareMapBtn) {
        mobileShareMapBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (cityNavContent) cityNavContent.classList.add("hidden");
            if (cityNavArrow) cityNavArrow.style.transform = "rotate(0deg)";
            openShareMapModal();
        });
    }

    if (exitSharedMapBtn) {
        exitSharedMapBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const url = new URL(window.location.href);
            url.searchParams.delete('shared');
            window.history.pushState({}, '', url);

            const map = window.__map;
            if (map) {
                loadPins(map);
            } else {
                window.location.reload();
            }
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
                const myAreaBtn = DOMCache.get("my-area-btn");
                if (myAreaBtn) {
                    highlightButton(myAreaBtn);
                }
            } else if (window.__map) {
                openModal(ELEMENT_IDS.MY_AREA_MODAL);
            }
        });
    }
}

// トグルボタンの初期化
function initToggleButtons() {
    const myPinsToggle = DOMCache.get(ELEMENT_IDS.MY_PINS_TOGGLE);
    const mobileMyPinsToggle = DOMCache.get(ELEMENT_IDS.MOBILE_MY_PINS_TOGGLE);

    if (myPinsToggle) {
        myPinsToggle.addEventListener("click", () => {
            showMyPinsOnly = !showMyPinsOnly;
            updateToggleButton(myPinsToggle, showMyPinsOnly);

            const map = window.__map;
            if (map) {
                loadPins(map);
            } else {
                console.error("地図オブジェクトが見つかりません");
            }
        });
    }

    if (mobileMyPinsToggle) {
        mobileMyPinsToggle.addEventListener("click", () => {
            showMyPinsOnly = !showMyPinsOnly;
            updateToggleButton(mobileMyPinsToggle, showMyPinsOnly);

            const map = window.__map;
            if (map) {
                loadPins(map);
            } else {
                console.error("地図オブジェクトが見つかりません");
            }
        });
    }
}

// フォームの初期化
function initForms() {
    initLoginForm();
    initSignupForm();
    initPinRegistrationForm();
    initPinEditForm();
    initModalLinks();
}

// ログインフォームの初期化
function initLoginForm() {
    const loginForm = DOMCache.get(ELEMENT_IDS.LOGIN_FORM);
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = DOMCache.get("login-email")?.value || "";
            const password = DOMCache.get("login-password")?.value || "";
            const errorDiv = DOMCache.get(ELEMENT_IDS.LOGIN_ERROR);

            const result = await apiRequest("/users/sign_in", {
                method: "POST",
                body: {
                    user: {
                        email: email,
                        password: password
                    }
                }
            });

            if (result.success) {
                closeModal(ELEMENT_IDS.LOGIN_MODAL);
                window.location.reload();
            } else {
                showFormError(ELEMENT_IDS.LOGIN_ERROR, result.error || ERROR_MESSAGES.LOGIN_FAILED);
            }
        });
    }
}

// 新規登録フォームの初期化
function initSignupForm() {
    const signupForm = DOMCache.get(ELEMENT_IDS.SIGNUP_FORM);
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userName = DOMCache.get("signup-user-name")?.value || "";
            const email = DOMCache.get("signup-email")?.value || "";
            const password = DOMCache.get("signup-password")?.value || "";
            const passwordConfirmation = DOMCache.get("signup-password-confirmation")?.value || "";
            const errorDiv = DOMCache.get(ELEMENT_IDS.SIGNUP_ERROR);

            if (password !== passwordConfirmation) {
                showFormError(ELEMENT_IDS.SIGNUP_ERROR, ERROR_MESSAGES.PASSWORD_MISMATCH);
                return;
            }

            const result = await apiRequest("/users", {
                method: "POST",
                body: {
                    user: {
                        user_name: userName,
                        email: email,
                        password: password,
                        password_confirmation: passwordConfirmation
                    }
                }
            });

            if (result.success) {
                closeModal(ELEMENT_IDS.SIGNUP_MODAL);
                window.location.reload();
            } else {
                // エラーメッセージを日本語に変換
                let errorMessage = ERROR_MESSAGES.SIGNUP_FAILED;

                if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
                    // errors配列がある場合（Deviseのバリデーションエラー）
                    errorMessage = translateDeviseErrors(result.errors).join("、");
                } else if (result.error) {
                    // error文字列がある場合
                    errorMessage = translateDeviseError(result.error);
                }

                showFormError(ELEMENT_IDS.SIGNUP_ERROR, errorMessage);
            }
        });
    }
}

// ログイン・新規登録モーダル間の切り替え
function initModalLinks() {
    const signupLink = DOMCache.get("signup-link");
    if (signupLink) {
        signupLink.addEventListener("click", (e) => {
            e.preventDefault();
            closeModal(ELEMENT_IDS.LOGIN_MODAL);
            openModal(ELEMENT_IDS.SIGNUP_MODAL);
        });
    }

    const loginLink = DOMCache.get("login-link");
    if (loginLink) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            closeModal(ELEMENT_IDS.SIGNUP_MODAL);
            openModal(ELEMENT_IDS.LOGIN_MODAL);
        });
    }
}

// ピン登録フォームの初期化
function initPinRegistrationForm() {
    const pinRegistrationForm = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_FORM);
    if (pinRegistrationForm) {
        pinRegistrationForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // エラー表示をクリア
            clearFormError(ELEMENT_IDS.PIN_REGISTRATION_ERROR);

            const map = window.__map;
            if (!map) {
                showToast(ERROR_MESSAGES.MAP_NOT_LOADED, "error");
                return;
            }

            // 選択された位置を取得
            const selectedLocation = map._selectedLocation;
            if (!selectedLocation) {
                showFormError(ELEMENT_IDS.PIN_REGISTRATION_ERROR, ERROR_MESSAGES.LOCATION_NOT_SELECTED);
                return;
            }

            // 座標の妥当性を検証
            const coordValidation = validateCoordinates(selectedLocation.lng, selectedLocation.lat);
            if (!coordValidation.valid) {
                showFormError(ELEMENT_IDS.PIN_REGISTRATION_ERROR, ERROR_MESSAGES.COORDINATE_INVALID(coordValidation.error));
                return;
            }

            const lng = coordValidation.lng;
            const lat = coordValidation.lat;

            // フォームデータを取得
            const price = parseInt(DOMCache.get(ELEMENT_IDS.REG_PRICE)?.value || "0");
            const distance = parseFloat(DOMCache.get(ELEMENT_IDS.REG_DISTANCE)?.value || "0");
            const distanceStr = DOMCache.get(ELEMENT_IDS.REG_DISTANCE)?.value || "";

            // バリデーション
            const validation = validatePinFormData({ price, distance, distanceStr });
            if (!validation.valid) {
                const firstError = validation.errors[0];
                const fieldPrefix = "reg-";
                showFormError(ELEMENT_IDS.PIN_REGISTRATION_ERROR, firstError.message, `${fieldPrefix}${firstError.field}`);
                return;
            }

            const formData = {
                pin: {
                    price: price,
                    distance_km: distance,
                    time_slot: DOMCache.get(ELEMENT_IDS.REG_TIME_SLOT)?.value || "",
                    weather: DOMCache.get(ELEMENT_IDS.REG_WEATHER)?.value || "",
                    lat: lat,
                    lng: lng
                }
            };

            // ログイン時のみvisibilityを追加
            const currentUserId = getCurrentUserId();
            if (currentUserId) {
                const visibilitySelect = DOMCache.get(ELEMENT_IDS.REG_VISIBILITY);
                if (visibilitySelect) {
                    formData.pin.visibility = visibilitySelect.value;
                }
            }

            const result = await apiRequest("/api/pins", {
                method: "POST",
                body: formData,
                requireCSRF: false
            });

            if (result.success && result.data) {
                if (result.data.delete_token && result.data.pin) {
                    localStorage.setItem(`pin_delete_token_${result.data.pin.id}`, result.data.delete_token);
                }

                closeModal(ELEMENT_IDS.PIN_REGISTRATION_MODAL);
                pinRegistrationForm.reset();
                delete map._selectedLocation;
                await loadPins(map);
                showToast(SUCCESS_MESSAGES.PIN_REGISTERED, "success");
            } else {
                // 401エラーの場合は再ログインメッセージを表示してページをリロード
                if (result.requiresRelogin) {
                    showToast(ERROR_MESSAGES.RELOGIN_REQUIRED, "error");
                    // トースト通知を表示した後、少し遅延してからページをリロード
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showToast(`エラー: ${result.error || ERROR_MESSAGES.PIN_REGISTRATION_FAILED}`, "error");
                }
            }
        });
    }
}

// ピン編集フォームの初期化
function initPinEditForm() {
    const pinEditForm = DOMCache.get(ELEMENT_IDS.PIN_EDIT_FORM);
    if (pinEditForm) {
        pinEditForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // エラー表示をクリア
            clearFormError(ELEMENT_IDS.PIN_EDIT_ERROR);

            const pinId = pinEditForm.dataset.pinId;
            if (!pinId) {
                showToast(ERROR_MESSAGES.PIN_ID_NOT_FOUND, "error");
                return;
            }

            // フォームデータを取得
            const price = parseInt(DOMCache.get(ELEMENT_IDS.EDIT_PRICE)?.value || "0");
            const distance = parseFloat(DOMCache.get(ELEMENT_IDS.EDIT_DISTANCE)?.value || "0");
            const distanceStr = DOMCache.get(ELEMENT_IDS.EDIT_DISTANCE)?.value || "";

            // バリデーション
            const validation = validatePinFormData({ price, distance, distanceStr });
            if (!validation.valid) {
                const firstError = validation.errors[0];
                const fieldPrefix = "edit-";
                showFormError(ELEMENT_IDS.PIN_EDIT_ERROR, firstError.message, `${fieldPrefix}${firstError.field}`);
                return;
            }

            const formData = {
                pin: {
                    price: price,
                    distance_km: distance,
                    time_slot: DOMCache.get(ELEMENT_IDS.EDIT_TIME_SLOT)?.value || "",
                    weather: DOMCache.get(ELEMENT_IDS.EDIT_WEATHER)?.value || ""
                }
            };

            // ログイン時かつ、ピンにuser_idがある場合のみvisibilityを追加
            // 匿名投稿ピン（user_idがnull）の場合はvisibilityを送信しない（公開のみ）
            const currentUserId = getCurrentUserId();
            const pinUserId = pinEditForm.dataset.pinUserId;
            if (currentUserId && pinUserId && pinUserId !== "") {
                const visibilitySelect = DOMCache.get(ELEMENT_IDS.EDIT_VISIBILITY);
                if (visibilitySelect) {
                    formData.pin.visibility = visibilitySelect.value;
                }
            }

            // 未ログインで登録したピン（user_idがnull）の場合はdelete_tokenを追加
            // 管理者の場合はdelete_tokenを送信しない
            const isAdmin = isCurrentUserAdmin();
            if (!isAdmin) {
                const deleteToken = pinEditForm.dataset.deleteToken;
                // ピンのuser_idを取得（編集モーダルから取得）
                const pinUserId = pinEditForm.dataset.pinUserId;
                // ログイン後でも、ピンにuser_idがnullの場合はdelete_tokenを送信
                if (deleteToken && (!pinUserId || pinUserId === "")) {
                    formData.delete_token = deleteToken;
                }
            }

            const result = await apiRequest(`/api/pins/${pinId}`, {
                method: "PATCH",
                body: formData,
                requireCSRF: false
            });

            if (result.success && result.data) {
                closeModal(ELEMENT_IDS.PIN_EDIT_MODAL);
                pinEditForm.reset();

                const map = window.__map;
                if (map) {
                    await loadPins(map);
                }

                showToast(SUCCESS_MESSAGES.PIN_EDITED, "success");
            } else {
                // 401エラーの場合は再ログインメッセージを表示してページをリロード
                if (result.requiresRelogin) {
                    showToast(ERROR_MESSAGES.RELOGIN_REQUIRED, "error");
                    // トースト通知を表示した後、少し遅延してからページをリロード
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showToast(`エラー: ${result.error || ERROR_MESSAGES.PIN_EDIT_FAILED}`, "error");
                }
            }
        });
    }
}

// モーダルの初期化（背景クリックで閉じる機能）
function initModals() {
    MODAL_IDS.forEach((modalId) => {
        const modal = DOMCache.get(modalId);
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    closeModal(modalId);
                }
            });
        }
    });
}

// ピン詳細モーダルのボタン初期化（イベント委譲を使用）
function initPinDetailButtons() {
    const pinModal = DOMCache.get(ELEMENT_IDS.PIN_MODAL);
    if (!pinModal) return;

    // イベント委譲を使用してモーダル内のクリックイベントを処理
    pinModal.addEventListener("click", (e) => {
        const target = e.target;

        // 編集ボタンのクリック
        if (target.id === ELEMENT_IDS.MODAL_EDIT_BTN || target.closest(`#${ELEMENT_IDS.MODAL_EDIT_BTN}`)) {
            e.preventDefault();
            e.stopPropagation();

            const modal = DOMCache.get(ELEMENT_IDS.PIN_MODAL);
            if (!modal) return;

            const pinId = modal.dataset.pinId;
            if (!pinId) return;

            openEditModal(pinId);
            return;
        }

        // 削除ボタンのクリック
        if (target.id === ELEMENT_IDS.MODAL_DELETE_BTN || target.closest(`#${ELEMENT_IDS.MODAL_DELETE_BTN}`)) {
            e.preventDefault();
            e.stopPropagation();

            handlePinDelete();
            return;
        }
    });
}

// ピン削除処理
async function handlePinDelete() {
    const modal = DOMCache.get(ELEMENT_IDS.PIN_MODAL);
    if (!modal) return;

    const pinId = modal.dataset.pinId;
    const deleteToken = modal.dataset.deleteToken;
    const pinUserId = modal.dataset.pinUserId;

    if (!pinId) {
        showToast(ERROR_MESSAGES.PIN_ID_NOT_FOUND, "error");
        return;
    }

    const isLoggedIn = DOMCache.get(ELEMENT_IDS.LOGOUT_BTN) !== null;
    const isAdmin = isCurrentUserAdmin();

    // 管理者の場合はdelete_tokenを送信しない
    if (!isAdmin) {
        if (!deleteToken && !isLoggedIn) {
            showToast(ERROR_MESSAGES.NO_DELETE_PERMISSION, "error");
            return;
        }
    }

    const requestBody = {};
    // 管理者でない場合のみdelete_tokenを送信
    if (!isAdmin && deleteToken) {
        requestBody.delete_token = deleteToken;
    }

    const result = await apiRequest(`/api/pins/${pinId}`, {
        method: "DELETE",
        body: requestBody,
        requireCSRF: false
    });

    if (result.success) {
        const map = window.__map;
        if (map) {
            await loadPins(map);
        }

        closeModal(ELEMENT_IDS.PIN_MODAL);
        showToast(SUCCESS_MESSAGES.PIN_DELETED, "success");
    } else {
        // 401エラーの場合は再ログインメッセージを表示してページをリロード
        if (result.requiresRelogin) {
            showToast(ERROR_MESSAGES.RELOGIN_REQUIRED, "error");
            // トースト通知を表示した後、少し遅延してからページをリロード
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showToast(`エラー: ${result.error || ERROR_MESSAGES.PIN_DELETE_FAILED}`, "error");
        }
    }
}

// モーダルの初期化（統合）
function initModal() {
    initLogo();
    initMobileMenu();
    initCityNavigation();
    initHeaderButtons();
    initMobileButtons();
    initOtherButtons();
    initToggleButtons();
    initForms();
    initModals();
    initPinDetailButtons();
}

// 共有マップモーダルを開く
async function openShareMapModal() {
    const modal = DOMCache.get(ELEMENT_IDS.SHARE_MAP_MODAL);
    if (!modal) return;

    const shareUrlInput = DOMCache.get(ELEMENT_IDS.SHARE_URL_INPUT);
    const copyBtn = DOMCache.get(ELEMENT_IDS.COPY_SHARE_URL_BTN);
    const regenerateBtn = DOMCache.get(ELEMENT_IDS.REGENERATE_SHARE_URL_BTN);
    const statusDiv = DOMCache.get(ELEMENT_IDS.SHARE_URL_STATUS);

    // 既存の共有URLを取得または新規生成
    let shareUrl = "";
    try {
        const result = await apiRequest("/api/share_map", {
            method: "POST",
            requireCSRF: false
        });

        if (result.success && result.data) {
            shareUrl = result.data.share_url || result.data.shareUrl || "";
            if (!shareUrl) {
                showToast(ERROR_MESSAGES.SHARE_URL_GET_FAILED, "error");
                return;
            }
        } else {
            // 401エラーの場合は再ログインメッセージを表示してページをリロード
            if (result.requiresRelogin) {
                showToast(ERROR_MESSAGES.RELOGIN_REQUIRED, "error");
                // トースト通知を表示した後、少し遅延してからページをリロード
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                showToast(result.error || ERROR_MESSAGES.SHARE_URL_GET_FAILED, "error");
            }
            return;
        }
    } catch (error) {
        showToast(ERROR_MESSAGES.SHARE_URL_GET_FAILED + ": " + error.message, "error");
        return;
    }

    // 共有URLを表示
    if (shareUrlInput) {
        shareUrlInput.value = shareUrl;
    }

    // コピーボタンのイベントリスナー
    if (copyBtn) {
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(shareUrl);
                if (statusDiv) {
                    statusDiv.textContent = SUCCESS_MESSAGES.SHARE_URL_COPIED;
                    statusDiv.className = "text-sm text-green-600";
                    statusDiv.classList.remove("hidden");
                    setTimeout(() => {
                        statusDiv.classList.add("hidden");
                    }, 3000);
                }
            } catch (error) {
                showToast(ERROR_MESSAGES.URL_COPY_FAILED, "error");
            }
        };
    }

    // 再発行ボタンのイベントリスナー
    if (regenerateBtn) {
        regenerateBtn.onclick = async () => {
            try {
                const result = await apiRequest("/api/share_map", {
                    method: "POST",
                    requireCSRF: false
                });

                if (result.success && result.data) {
                    const newShareUrl = result.data.share_url || result.data.shareUrl || "";
                    if (!newShareUrl) {
                        showToast(ERROR_MESSAGES.SHARE_URL_REGENERATE_FAILED, "error");
                        return;
                    }
                    if (shareUrlInput) {
                        shareUrlInput.value = newShareUrl;
                    }
                    shareUrl = newShareUrl;
                    if (statusDiv) {
                        statusDiv.textContent = SUCCESS_MESSAGES.SHARE_URL_REGENERATED;
                        statusDiv.className = "text-sm text-green-600";
                        statusDiv.classList.remove("hidden");
                        setTimeout(() => {
                            statusDiv.classList.add("hidden");
                        }, 3000);
                    }
                } else {
                    // 401エラーの場合は再ログインメッセージを表示してページをリロード
                    if (result.requiresRelogin) {
                        showToast(ERROR_MESSAGES.RELOGIN_REQUIRED, "error");
                        // トースト通知を表示した後、少し遅延してからページをリロード
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        showToast(result.error || ERROR_MESSAGES.SHARE_URL_REGENERATE_FAILED, "error");
                    }
                }
            } catch (error) {
                showToast(ERROR_MESSAGES.SHARE_URL_REGENERATE_FAILED, "error");
            }
        };
    }

    openModal(ELEMENT_IDS.SHARE_MAP_MODAL);
}

// グローバルに公開
window.openModal = openModal;
window.closeModal = closeModal;

// ============================================================================
// 地図オーバーレイ管理（ピン登録/マイエリア選択モード用）
// ============================================================================

// 地図オーバーレイを表示
function showMapOverlay() {
    const overlay = DOMCache.get("map-overlay");
    if (overlay) {
        overlay.classList.remove("hidden");
    }
}

// 地図オーバーレイを非表示
function hideMapOverlay() {
    const overlay = DOMCache.get("map-overlay");
    if (overlay) {
        overlay.classList.add("hidden");
    }
}

// ============================================================================
// モバイルメニュー管理
// ============================================================================

// モバイルメニューを閉じる（アニメーション付き）
function closeMobileMenu() {
    const mobileMenu = DOMCache.get(ELEMENT_IDS.MOBILE_MENU);
    const mobileMenuDrawer = DOMCache.get("mobile-menu-drawer");
    const pinRegistrationBtn = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_BTN);
    const pinRegistrationBtnContainer = pinRegistrationBtn ? pinRegistrationBtn.closest('div') : null;

    if (mobileMenu && mobileMenuDrawer) {
        mobileMenuDrawer.classList.remove("translate-x-0");
        mobileMenuDrawer.classList.add("translate-x-full");
        // アニメーション完了後に非表示
        setTimeout(() => {
            mobileMenu.classList.add("hidden");
            // ピン登録ボタンを再表示（ドロワー閉じた後）
            if (pinRegistrationBtnContainer) {
                pinRegistrationBtnContainer.classList.remove("hidden");
            }
        }, 300);
    } else if (mobileMenu) {
        // フォールバック: アニメーションなしで即座に閉じる
        mobileMenu.classList.add("hidden");
        // ピン登録ボタンを再表示
        if (pinRegistrationBtnContainer) {
            pinRegistrationBtnContainer.classList.remove("hidden");
        }
    }
}

// 登録モードを有効化（中央固定ピン方式）
function enableRegistrationMode() {
    const map = window.__map;
    if (!map) return;

    // 状態を更新
    appState.mode = "pin_register";
    updateRestrictedButtonsState();

    // ボタンの見た目を変更
    const pinRegistrationBtn = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_BTN);
    if (pinRegistrationBtn) {
        // 元のHTML構造を保持しつつ、テキストのみ変更
        const plusSpan = pinRegistrationBtn.querySelector('span.text-2xl, span[class*="text-2xl"]');
        const textSpanMobile = pinRegistrationBtn.querySelector('span.md\\:hidden');
        const textSpanDesktop = pinRegistrationBtn.querySelector('span.hidden.md\\:inline');

        if (textSpanMobile) {
            textSpanMobile.textContent = "登録モード（地図をドラッグ）";
        }
        if (textSpanDesktop) {
            textSpanDesktop.textContent = "登録モード（地図をドラッグ）";
        }
        // 「＋」記号は非表示にする（登録モード中は不要）
        if (plusSpan) {
            plusSpan.style.display = "none";
        }
        pinRegistrationBtn.style.backgroundColor = "#10B981";
        pinRegistrationBtn.style.color = "white";
        pinRegistrationBtn.disabled = true;
    }

    // キャンセルボタンを表示
    const cancelBtn = DOMCache.get(ELEMENT_IDS.CANCEL_REGISTRATION_BTN);
    if (cancelBtn) {
        cancelBtn.classList.remove("hidden");
    }

    // オーバーレイを表示
    showMapOverlay();

    // 地図の中央に固定ピンを表示（強調スタイル付き）
    const center = map.getCenter();
    const el = document.createElement("div");
    el.className = "relative transform scale-110 z-20";
    el.innerHTML = `
        <div class="relative">
            <!-- パルスリング（背景） -->
            <div class="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></div>
            <!-- メインピン -->
            <div class="relative w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-2xl ring-4 ring-red-500/50"></div>
            <!-- ピンの先端 -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
    `;

    // 固定ピンを地図の中央に配置（画面中央に固定）
    const fixedPinContainer = document.createElement("div");
    fixedPinContainer.id = "fixed-pin-container";
    fixedPinContainer.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none";
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
    const existingBtn = DOMCache.get("confirm-location-btn");
    if (existingBtn) {
        existingBtn.remove();
    }

    const map = window.__map;
    if (!map) return;

    const btn = document.createElement("button");
    btn.id = "confirm-location-btn";
    btn.textContent = "位置を確定";
    btn.className = "confirm-location-btn";
    btn.style.cssText = `
        position: absolute;
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
        // 状態を更新（モーダルを開く前にnormalに戻す）
        appState.mode = "normal";
        updateRestrictedButtonsState();

        disableRegistrationMode();
        openModal(ELEMENT_IDS.PIN_REGISTRATION_MODAL);

        const form = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_FORM);
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

    // オーバーレイを非表示
    hideMapOverlay();

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

    // 状態を更新
    appState.mode = "normal";
    updateRestrictedButtonsState();

    // ボタンを元に戻す
    const pinRegistrationBtn = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_BTN);
    if (pinRegistrationBtn) {
        // 元のHTML構造を復元
        const plusSpan = pinRegistrationBtn.querySelector('span.text-2xl, span[class*="text-2xl"]');
        const textSpanMobile = pinRegistrationBtn.querySelector('span.md\\:hidden');
        const textSpanDesktop = pinRegistrationBtn.querySelector('span.hidden.md\\:inline');

        if (textSpanMobile) {
            textSpanMobile.textContent = "ピン登録";
        }
        if (textSpanDesktop) {
            textSpanDesktop.textContent = "ピン登録";
        }
        // 「＋」記号を再表示
        if (plusSpan) {
            plusSpan.style.display = "";
        }
        pinRegistrationBtn.style.backgroundColor = "";
        pinRegistrationBtn.style.color = "";
        pinRegistrationBtn.disabled = false;
    }

    // キャンセルボタンを非表示
    const cancelBtn = DOMCache.get(ELEMENT_IDS.CANCEL_REGISTRATION_BTN);
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
    if (modalId === ELEMENT_IDS.PIN_REGISTRATION_MODAL) {
        cancelRegistrationMode();
    }
};

// ============================================================================
// マイエリア選択モード
// ============================================================================

// マイエリア選択モードを有効化（ピン登録モードと同じUI）
function enableMyAreaSelectionMode() {
    const map = window.__map;
    if (!map) return;

    // 選択モード前の地図位置を保存
    const center = map.getCenter();
    const zoom = map.getZoom();
    map._myAreaSelectionPreviousState = {
        center: [center.lng, center.lat],
        zoom: zoom
    };

    // 状態を更新
    appState.mode = "my_area_select";
    updateRestrictedButtonsState();

    // ボタンの見た目を変更（ピン登録ボタンを「マイエリア設定」に変更）
    const pinRegistrationBtn = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_BTN);
    if (pinRegistrationBtn) {
        // 元のHTML構造を保持しつつ、テキストのみ変更
        const plusSpan = pinRegistrationBtn.querySelector('span.text-2xl, span[class*="text-2xl"]');
        const textSpanMobile = pinRegistrationBtn.querySelector('span.md\\:hidden');
        const textSpanDesktop = pinRegistrationBtn.querySelector('span.hidden.md\\:inline');

        if (textSpanMobile) {
            textSpanMobile.textContent = "マイエリア設定（地図をドラッグ）";
        }
        if (textSpanDesktop) {
            textSpanDesktop.textContent = "マイエリア設定（地図をドラッグ）";
        }
        // 「＋」記号は非表示にする（マイエリア設定モード中は不要）
        if (plusSpan) {
            plusSpan.style.display = "none";
        }
        pinRegistrationBtn.style.backgroundColor = "#10B981";
        pinRegistrationBtn.style.color = "white";
        pinRegistrationBtn.disabled = true;
    }

    // キャンセルボタンを表示
    const cancelBtn = DOMCache.get(ELEMENT_IDS.CANCEL_REGISTRATION_BTN);
    if (cancelBtn) {
        cancelBtn.classList.remove("hidden");
    }

    // オーバーレイを表示
    showMapOverlay();

    // 地図の中央に固定ピンを表示（ピン登録モードと同じ赤色、強調スタイル付き）
    const el = document.createElement("div");
    el.className = "relative transform scale-110 z-20";
    el.innerHTML = `
        <div class="relative">
            <!-- パルスリング（背景） -->
            <div class="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></div>
            <!-- メインピン -->
            <div class="relative w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-2xl ring-4 ring-red-500/50"></div>
            <!-- ピンの先端 -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
    `;

    const fixedPinContainer = document.createElement("div");
    fixedPinContainer.id = "my-area-fixed-pin-container";
    fixedPinContainer.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none";
    fixedPinContainer.appendChild(el);
    map.getContainer().appendChild(fixedPinContainer);

    map._myAreaFixedPinContainer = fixedPinContainer;
    map._myAreaSelectionMode = true;

    // 地図の移動時に位置を更新
    const updateMyAreaLocation = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        map._myAreaSelectedLocation = {
            lat: Number(center.lat),
            lng: Number(center.lng),
            zoom: zoom
        };
    };

    map.on("move", updateMyAreaLocation);
    map.on("moveend", updateMyAreaLocation);
    map.on("zoom", updateMyAreaLocation);
    map.on("zoomend", updateMyAreaLocation);
    map._myAreaMoveHandler = updateMyAreaLocation;

    // 初期位置を設定
    updateMyAreaLocation();

    // 「位置を確定」ボタンを表示（マイエリア保存用）
    showMyAreaConfirmButton();
}

// マイエリア選択モードを無効化
function disableMyAreaSelectionMode() {
    const map = window.__map;
    if (!map) return;

    // オーバーレイを非表示
    hideMapOverlay();

    // 固定ピンを削除（複数の方法で確実に削除）
    if (map._myAreaFixedPinContainer) {
        map._myAreaFixedPinContainer.remove();
        delete map._myAreaFixedPinContainer;
    }
    // IDで直接削除（念のため）
    const fixedPinById = document.getElementById("my-area-fixed-pin-container");
    if (fixedPinById) {
        fixedPinById.remove();
    }

    // 確定ボタンを削除
    const confirmBtn = document.getElementById("my-area-confirm-location-btn");
    if (confirmBtn) {
        confirmBtn.remove();
    }

    // イベントハンドラーを削除
    if (map._myAreaMoveHandler) {
        map.off("move", map._myAreaMoveHandler);
        map.off("moveend", map._myAreaMoveHandler);
        map.off("zoom", map._myAreaMoveHandler);
        map.off("zoomend", map._myAreaMoveHandler);
        delete map._myAreaMoveHandler;
    }

    map._myAreaSelectionMode = false;

    // 状態を更新
    appState.mode = "normal";
    updateRestrictedButtonsState();

    // ボタンを元に戻す
    const pinRegistrationBtn = DOMCache.get(ELEMENT_IDS.PIN_REGISTRATION_BTN);
    if (pinRegistrationBtn) {
        // 元のHTML構造を復元
        const plusSpan = pinRegistrationBtn.querySelector('span.text-2xl, span[class*="text-2xl"]');
        const textSpanMobile = pinRegistrationBtn.querySelector('span.md\\:hidden');
        const textSpanDesktop = pinRegistrationBtn.querySelector('span.hidden.md\\:inline');

        if (textSpanMobile) {
            textSpanMobile.textContent = "ピン登録";
        }
        if (textSpanDesktop) {
            textSpanDesktop.textContent = "ピン登録";
        }
        // 「＋」記号を再表示
        if (plusSpan) {
            plusSpan.style.display = "";
        }
        pinRegistrationBtn.style.backgroundColor = "";
        pinRegistrationBtn.style.color = "";
        pinRegistrationBtn.disabled = false;
    }

    // キャンセルボタンを非表示
    const cancelBtn = DOMCache.get(ELEMENT_IDS.CANCEL_REGISTRATION_BTN);
    if (cancelBtn) {
        cancelBtn.classList.add("hidden");
    }

    // 選択位置をクリア
    delete map._myAreaSelectedLocation;
    delete map._myAreaSelectionPreviousState;
}

// マイエリア選択モードをキャンセル
function cancelMyAreaSelectionMode() {
    const map = window.__map;
    if (!map) return;

    // 選択モードを無効化
    disableMyAreaSelectionMode();

    // 選択モード前の地図位置に戻す
    if (map._myAreaSelectionPreviousState) {
        map.flyTo({
            center: map._myAreaSelectionPreviousState.center,
            zoom: map._myAreaSelectionPreviousState.zoom,
            duration: MAP_CONFIG.FLY_TO_DURATION
        });
    }
}

// 「位置を確定」ボタンを表示（マイエリア保存用）
function showMyAreaConfirmButton() {
    // 既存のボタンを削除
    const existingBtn = document.getElementById("my-area-confirm-location-btn");
    if (existingBtn) {
        existingBtn.remove();
    }

    const map = window.__map;
    if (!map) return;

    const btn = document.createElement("button");
    btn.id = "my-area-confirm-location-btn";
    btn.textContent = "位置を確定";
    btn.className = "confirm-location-btn";
    btn.style.cssText = `
        position: absolute;
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
    btn.addEventListener("click", async () => {
        await saveMyAreaSelection();
    });

    map.getContainer().appendChild(btn);
}

// マイエリア選択を保存
async function saveMyAreaSelection() {
    const map = window.__map;
    if (!map || !map._myAreaSelectedLocation) {
        showToast("位置を選択してください", "error");
        return;
    }

    const currentUserId = getCurrentUserId();
    const myAreaData = {
        lat: map._myAreaSelectedLocation.lat,
        lng: map._myAreaSelectedLocation.lng,
        zoom: map._myAreaSelectedLocation.zoom
    };

    // ログイン時はサーバーに保存、未ログイン時はlocalStorageに保存
    if (currentUserId) {
        // ログイン時：サーバーに保存
        const result = await apiRequest("/api/my_area", {
            method: "POST",
            body: { my_area: myAreaData }
        });

        if (result.success) {
            disableMyAreaSelectionMode();
            showToast(SUCCESS_MESSAGES.MY_AREA_SAVED, "success");
        } else {
            showToast(result.error || ERROR_MESSAGES.MY_AREA_SAVE_FAILED, "error");
        }
    } else {
        // 未ログイン時：localStorageに保存
        try {
            localStorage.setItem("my_area", JSON.stringify(myAreaData));
            disableMyAreaSelectionMode();
            showToast(SUCCESS_MESSAGES.MY_AREA_SAVED, "success");
        } catch (error) {
            console.error("localStorageへの保存エラー:", error);
            showToast(ERROR_MESSAGES.MY_AREA_SAVE_FAILED + ": " + error.message, "error");
        }
    }
}

// グローバルに公開
window.loadPins = loadPins;

// 地図とモーダルの初期化
function initializeApp() {
    // DOM要素キャッシュをクリア
    DOMCache.clear();

    // 既存の地図インスタンスがある場合のクリーンアップ処理（Turbo Drive対策）
    if (window.__map) {
        window.__map.remove();
        window.__map = null;
    }
    // マーカー配列もリセット
    Object.keys(pinMarkers).forEach(key => delete pinMarkers[key]);

    // アプリケーション状態をリセット
    appState.mode = "normal";

    // トグル状態をリセット
    showMyPinsOnly = false;
    const myPinsToggle = DOMCache.get("my-pins-toggle");
    if (myPinsToggle) {
        updateToggleButton(myPinsToggle, false);
    }

    initMap();
    initModal();

    // ボタンの状態を更新
    updateRestrictedButtonsState();
    // initMap内でloadPins(map)が呼ばれるため、ここでの重複処理は不要
}

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

document.addEventListener("turbo:load", () => {
    initializeApp();
});
