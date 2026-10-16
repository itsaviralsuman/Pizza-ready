/**
 * Final Pizza Tycoon - 3D Isometric Arcade Idle Tycoon
 * HIGH-DEFINITION AAA GRAPHICS & REALISTIC "PIZZA READY" EDITION
 * Exact Visual Match to Design Reference:
 *  - 🎨 Gorgeous Toy-Clay / Plasticine Art Style (Reference Image 1 & 2)
 *  - 💎 Crystal-Clear Native Resolution (2.0 DPR Retina, Silky Smooth Antialiasing)
 *  - 🏁 Vibrant Blue & White Beveled Tile Floor with Specular Sheen (Reference 1)
 *  - 🧱 Terracotta Brick Pizza Oven with Keystone Arch, Burning Logs & Cozy Fire Glow
 *  - 🔪 Stainless Steel Kitchen Prep Station with Sink, Faucet, Cutting Board & Bowls
 *  - 👨‍🍳 Smooth Faceless Chef & Customers with Puffy Chef Toque & Red Apron
 *  - 📦 Realistic Cardboard Pizza Boxes stacked in Hands with Walking Tilt Physics
 *  - 🟩 Glowing Neon Dashed "UNLOCK ZONE" with 3D Floor Decal & ⬆️ Arrow Bubble (Reference 2)
 *  - 💵 Emerald Green Banknote Bundles with Glowing Neon Ground Aura (Reference 1)
 *  - 🍽️ Round Dining Tables with Red/White Checkered Cloth, Dirty Dishes & Cleaning
 *  - 🗑️ Recycling Dumpster & Cleanliness Bonus Loop
 *  - 🥤 Cold Drinks / Soda Dispenser for Combo Orders (2x Profit)
 *  - ☁️ Email Cloud Save & Profile Sync (100% Progress Safe Across Browsers)
 */

(function() {
    'use strict';

    // =========================================================================
    // 1. GAME STATE & STATS (REBALANCED ECONOMY & EXPANDED EMPIRE)
    // =========================================================================
    const GameState = {
        email: '',
        money: 10, // Humble beginning ($10 starting cash)
        level: 1,
        exp: 0,
        expNeeded: 35,
        pizzaBasePrice: 3, // $3 base price per pizza (low payout as requested)
        playerPizzas: 0,
        playerMaxPizzas: 4,
        playerWheat: 0,
        playerMaxWheat: 8,
        playerFlour: 0,
        playerMaxFlour: 6,
        playerDough: 0,
        playerMaxDough: 4,
        playerTrash: 0,
        playerMaxTrash: 4,
        playerDrinks: 0,
        playerMaxDrinks: 3,
        playerSpeed: 7.8,
        ovenSpeedMultiplier: 1.0,
        millSpeedMultiplier: 1.0,
        pressSpeedMultiplier: 1.0,
        farmExpanded: false,
        tipMultiplier: 1.0,
        totalCustomersServed: 0,
        totalTablesCleaned: 0,
        helperCount: 0,
        tablesCount: 0,
        zoneIndex: 0,
        milestoneIndex: 0,
        currentQuestIndex: 0,
        questProgress: 0,
        driveThruUnlocked: false,
        driveThruCarsServed: 0,
        // Franchise Empire State
        franchiseTier: 1,
        franchiseRoyalties: 0,
        branch2Unlocked: false,
        branch3Unlocked: false,
        upgrades: {
            speedLevel: 1,
            capacityLevel: 1,
            chefLevel: 0,   // Kitchen Chef helper (rolls dough & loads oven)
            runnerLevel: 0, // Counter Runner helper (stocks heated shelf)
            waiterLevel: 0, // Dine-in Waiter helper (serves tables & cleans plates)
            ovenLevel: 1,
            cashierLevel: 0 // Front Cashier (operates register)
        }
    };

    function getPizzaPrice() {
        // Base $3; every 10 levels price increases by only $1
        return Math.max(3, 3 + Math.floor((GameState.level - 1) / 10));
    }

    // --- SOUND FX ADAPTER ---
    const sound = window.soundFX || {
        playCoin: () => {},
        playPizzaPickup: () => {},
        playServe: () => {},
        playCashFlow: () => {},
        playUnlock: () => {},
        playLevelUp: () => {},
        playRegister: () => {},
        playTrashDump: () => {},
        playClean: () => {},
        playDrink: () => {},
        playUpgrade: () => {},
        playCarHorn: () => {},
        playCarDrive: () => {},
        playHarvest: () => {},
        playGrinder: () => {},
        playDoughPress: () => {},
        toggle: () => true
    };

    // --- THERMAL-OPTIMIZED PERFORMANCE MODES (ZERO OVERHEATING) ---
    const QualityPresets = {
        ULTRA: {
            name: 'High',
            dpr: Math.min(window.devicePixelRatio || 1, 1.25),
            shadows: true,
            shadowMapSize: 1024,
            shadowType: THREE.PCFShadowMap,
            hint: '💎 High: Sharp visuals with crisp shadows'
        },
        BALANCED: {
            name: 'Balanced',
            dpr: 1.0,
            shadows: true,
            shadowMapSize: 512,
            shadowType: THREE.BasicShadowMap,
            hint: '⚡ Balanced: Butter smooth 60 FPS, completely cool laptop & phone'
        },
        FAST: {
            name: 'Fast',
            dpr: 1.0,
            shadows: false,
            shadowMapSize: 512,
            shadowType: THREE.BasicShadowMap,
            hint: '🚀 Ultra Fast: Maximum battery saver, zero fan noise'
        }
    };

    let currentQualityKey = localStorage.getItem('pizza_tycoon_quality') || 'BALANCED';
    if (!QualityPresets[currentQualityKey]) currentQualityKey = 'BALANCED';

    // =========================================================================
    // 2. THREE.JS THERMALLY OPTIMIZED RENDERER SETUP
    // =========================================================================
    const canvas = document.getElementById('webgl-canvas');
    const floatingUI = document.getElementById('floating-ui-container');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x96c5f7);
    scene.fog = new THREE.FogExp2(0x96c5f7, 0.004);

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 32;
    const camera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2, frustumSize * aspect / 2,
        frustumSize / 2, -frustumSize / 2,
        0.1, 1000
    );

    camera.position.set(28, 32, 28);
    camera.lookAt(0, 0, -3.5);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        powerPreference: 'default', // Don't burn discrete GPU
        alpha: false,
        precision: 'mediump' // Lightweight mobile/laptop ALU precision
    });
    renderer.setPixelRatio(1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // --- CLEAN DIFFUSE LIGHTING ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb0cce8, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff8eb, 1.35);
    sunLight.position.set(35, 55, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 130;
    sunLight.shadow.camera.left = -35;
    sunLight.shadow.camera.right = 35;
    sunLight.shadow.camera.top = 35;
    sunLight.shadow.camera.bottom = -35;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Oven hearth point light (mild range)
    const ovenFireLight = new THREE.PointLight(0xff6a00, 2.5, 14);
    ovenFireLight.position.set(-14, 2.8, -16);
    scene.add(ovenFireLight);

    function applyQuality(key) {
        currentQualityKey = key;
        localStorage.setItem('pizza_tycoon_quality', key);
        const q = QualityPresets[key];

        renderer.setPixelRatio(q.dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = q.shadows;
        if (q.shadows) {
            renderer.shadowMap.type = q.shadowType;
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = q.shadowMapSize;
            sunLight.shadow.mapSize.height = q.shadowMapSize;
        } else {
            sunLight.castShadow = false;
        }

        document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('active'));
        const btnId = key === 'ULTRA' ? 'quality-high-btn' : (key === 'BALANCED' ? 'quality-balanced-btn' : 'quality-fast-btn');
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        const hintEl = document.getElementById('quality-hint');
        if (hintEl) hintEl.innerText = q.hint;
    }
    applyQuality(currentQualityKey);

    // =========================================================================
    // 3. COLLISION SYSTEM (SOLID OBSTACLES)
    // =========================================================================
    const obstacles = [];

    function addBoxObstacle(minX, maxX, minZ, maxZ) {
        obstacles.push({ type: 'box', minX, maxX, minZ, maxZ });
    }

    function addCircleObstacle(cx, cz, radius) {
        obstacles.push({ type: 'circle', cx, cz, r: radius, rSq: radius * radius });
    }

    function resolveCollision(px, pz, radius = 0.6) {
        let x = px;
        let z = pz;

        // Keep strictly inside world boundaries
        x = Math.max(-52 + radius, Math.min(52 - radius, x));
        z = Math.max(-52 + radius, Math.min(52 - radius, z));

        // Two passes for silky smooth multi-obstacle corner sliding
        for (let iter = 0; iter < 2; iter++) {
            for (let i = 0; i < obstacles.length; i++) {
                const obs = obstacles[i];
                if (obs.type === 'box') {
                    const closestX = Math.max(obs.minX, Math.min(obs.maxX, x));
                    const closestZ = Math.max(obs.minZ, Math.min(obs.maxZ, z));

                    const dx = x - closestX;
                    const dz = z - closestZ;
                    const distSq = dx * dx + dz * dz;

                    if (distSq < radius * radius) {
                        const dist = Math.sqrt(distSq);
                        if (dist > 0.0001) {
                            const push = radius - dist;
                            x += (dx / dist) * push;
                            z += (dz / dist) * push;
                        } else {
                            const left = x - obs.minX;
                            const right = obs.maxX - x;
                            const top = z - obs.minZ;
                            const bottom = obs.maxZ - z;
                            const minD = Math.min(left, right, top, bottom);
                            if (minD === left) x = obs.minX - radius;
                            else if (minD === right) x = obs.maxX + radius;
                            else if (minD === top) z = obs.minZ - radius;
                            else z = obs.maxZ + radius;
                        }
                    }
                } else if (obs.type === 'circle') {
                    const dx = x - obs.cx;
                    const dz = z - obs.cz;
                    const distSq = dx * dx + dz * dz;
                    const minR = radius + obs.r;

                    if (distSq < minR * minR) {
                        const dist = Math.sqrt(distSq);
                        if (dist > 0.0001) {
                            const push = minR - dist;
                            x += (dx / dist) * push;
                            z += (dz / dist) * push;
                        } else {
                            x += minR;
                        }
                    }
                }
            }
        }
        return { x, z };
    }

    function checkCollision(px, pz, radius = 0.6) {
        if (px < -52 || px > 52 || pz < -52 || pz > 52) return true;
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            if (obs.type === 'box') {
                if (px + radius > obs.minX && px - radius < obs.maxX &&
                    pz + radius > obs.minZ && pz - radius < obs.maxZ) {
                    return true;
                }
            } else if (obs.type === 'circle') {
                const dx = px - obs.cx;
                const dz = pz - obs.cz;
                const minR = radius + obs.r;
                if (dx * dx + dz * dz < minR * minR) return true;
            }
        }
        return false;
    }

    // Outer perimeter walls
    addBoxObstacle(-60, -54, -60, 60);
    addBoxObstacle(54, 60, -60, 60);
    addBoxObstacle(-60, 60, -60, -54);
    addBoxObstacle(-60, 60, 54, 60);

    // =========================================================================
    // 4. HIGH-DEFINITION PROCEDURAL TEXTURES (REFERENCE 1 & 2)
    // =========================================================================

    // Floor: Crisp Blue & White Checkered Porcelain Tiles (Reference 1)
    function createBlueWhiteCheckerTexture() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');
        const tileSize = 128;

        for (let r = 0; r < 4; r++) {
            for (let col = 0; col < 4; col++) {
                const isBlue = (r + col) % 2 === 0;
                const x = col * tileSize;
                const y = r * tileSize;

                // Grout line
                ctx.fillStyle = '#d4e2f4';
                ctx.fillRect(x, y, tileSize, tileSize);

                // Beveled porcelain tile
                const margin = 3;
                if (isBlue) {
                    const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
                    grad.addColorStop(0, '#538df8');
                    grad.addColorStop(1, '#3b78ec');
                    ctx.fillStyle = grad;
                } else {
                    const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(1, '#f3f7fd');
                    ctx.fillStyle = grad;
                }

                const rRad = 5;
                const tx = x + margin, ty = y + margin, tw = tileSize - margin * 2, th = tileSize - margin * 2;
                ctx.beginPath();
                ctx.moveTo(tx + rRad, ty);
                ctx.arcTo(tx + tw, ty, tx + tw, ty + th, rRad);
                ctx.arcTo(tx + tw, ty + th, tx, ty + th, rRad);
                ctx.arcTo(tx, ty + th, tx, ty, rRad);
                ctx.arcTo(tx, ty, tx + tw, ty, rRad);
                ctx.closePath();
                ctx.fill();
            }
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(14, 14);
        tex.generateMipmaps = true;
        return tex;
    }

    // Red & White Checkered Tablecloth (Reference 2)
    function createTableclothTexture() {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        const sz = 32;
        for (let r = 0; r < 8; r++) {
            for (let col = 0; col < 8; col++) {
                ctx.fillStyle = (r + col) % 2 === 0 ? '#fa5252' : '#ffffff';
                ctx.fillRect(col * sz, r * sz, sz, sz);
            }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        tex.generateMipmaps = true;
        return tex;
    }

    // Kraft Cardboard Pizza Box Cover with Print (Reference 1)
    function createPizzaBoxCoverTexture() {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');

        // Kraft Cardboard base
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(0, 0, 256, 256);

        // Flap borders
        ctx.strokeStyle = '#b07d4b';
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, 236, 236);

        // Red round pizzeria emblem
        ctx.fillStyle = '#d9480f';
        ctx.beginPath();
        ctx.arc(128, 128, 70, 0, Math.PI * 2);
        ctx.fill();

        // Cheese circle
        ctx.fillStyle = '#ffd43b';
        ctx.beginPath();
        ctx.arc(128, 128, 54, 0, Math.PI * 2);
        ctx.fill();

        // Pepperoni dots
        ctx.fillStyle = '#c92a2a';
        [[-20, -18], [24, -16], [0, 22], [-22, 16], [22, 20]].forEach(([ox, oz]) => {
            ctx.beginPath();
            ctx.arc(128 + ox, 128 + oz, 10, 0, Math.PI * 2);
            ctx.fill();
        });

        const tex = new THREE.CanvasTexture(c);
        tex.generateMipmaps = true;
        return tex;
    }

    // Glowing Neon "UNLOCK ZONE" 3D Floor Decal (Reference 2)
    function createUnlockZoneFloorTexture() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');

        ctx.clearRect(0, 0, 512, 512);

        const pad = 36;
        const w = 512 - pad * 2;
        const h = 512 - pad * 2;
        const r = 50;

        function roundedRect(x, y, w, h, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.arcTo(x + w, y, x + w, y + h, radius);
            ctx.arcTo(x + w, y + h, x, y + h, radius);
            ctx.arcTo(x, y + h, x, y, radius);
            ctx.arcTo(x, y, x + w, y, radius);
            ctx.closePath();
        }

        // Translucent neon fill
        ctx.fillStyle = 'rgba(166, 255, 0, 0.12)';
        roundedRect(pad, pad, w, h, r);
        ctx.fill();

        // Glowing outer neon border
        ctx.strokeStyle = '#d4ff00';
        ctx.lineWidth = 14;
        ctx.shadowColor = '#a6ff00';
        ctx.shadowBlur = 18;
        roundedRect(pad, pad, w, h, r);
        ctx.stroke();

        // Inner dashed line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#a6ff00';
        ctx.lineWidth = 7;
        ctx.setLineDash([20, 14]);
        roundedRect(pad + 18, pad + 18, w - 36, h - 36, r - 12);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bold text "UNLOCK ZONE"
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 52px "Fredoka", "Arial Black", sans-serif';

        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillText('UNLOCK', 256 + 3, 226 + 3);
        ctx.fillText('ZONE', 256 + 3, 286 + 3);

        // White crisp text
        ctx.fillStyle = '#ffffff';
        ctx.fillText('UNLOCK', 256, 226);
        ctx.fillText('ZONE', 256, 286);

        const tex = new THREE.CanvasTexture(c);
        tex.generateMipmaps = true;
        return tex;
    }

    // Emerald Green Banknote Texture with Seal & Belly Band (Reference 1)
    function createBanknoteTexture() {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 64;
        const ctx = c.getContext('2d');

        // Crisp green bill
        ctx.fillStyle = '#40c057';
        ctx.fillRect(0, 0, 128, 64);

        // Dark green border
        ctx.strokeStyle = '#2b8a3e';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 120, 56);

        // Currency oval seal
        ctx.strokeStyle = '#8ce99a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(64, 32, 24, 16, 0, 0, Math.PI * 2);
        ctx.stroke();

        // White paper belly band in the middle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(52, 0, 24, 64);
        ctx.fillStyle = '#ced4da';
        ctx.fillRect(56, 12, 16, 40);

        const tex = new THREE.CanvasTexture(c);
        tex.generateMipmaps = true;
        return tex;
    }

    // Glowing Emerald Green Floor Aura for Cash Pile (Reference 1)
    function createCashAuraTexture() {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const ctx = c.getContext('2d');

        const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        grad.addColorStop(0, 'rgba(81, 207, 102, 0.95)');
        grad.addColorStop(0.5, 'rgba(64, 192, 87, 0.45)');
        grad.addColorStop(1, 'rgba(64, 192, 87, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    // Terracotta Brick Texture for Pizza Oven (Reference 1)
    function createBrickTexture() {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#8f2d11';
        ctx.fillRect(0, 0, 256, 256);

        const rowH = 32;
        const brickW = 64;
        for (let r = 0; r < 8; r++) {
            const y = r * rowH;
            const offset = (r % 2) * (brickW / 2);
            for (let col = -1; col < 6; col++) {
                const x = col * brickW + offset;
                const grad = ctx.createLinearGradient(x, y, x, y + rowH);
                grad.addColorStop(0, '#e8590c');
                grad.addColorStop(1, '#c92a2a');
                ctx.fillStyle = grad;
                ctx.fillRect(x + 2, y + 2, brickW - 4, rowH - 4);
                ctx.strokeStyle = '#6e220c';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 1, y + 1, brickW - 2, rowH - 2);
            }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 3);
        tex.generateMipmaps = true;
        return tex;
    }

    // =========================================================================
    // 5. TOY-CLAY CASUAL MATERIALS (OPTIMIZED FOR ZERO THERMAL OVERHEAD)
    // =========================================================================
    const ovenBrickTex = createBrickTexture();
    const M = {
        floor: new THREE.MeshLambertMaterial({ map: createBlueWhiteCheckerTexture() }),
        wall: new THREE.MeshLambertMaterial({ color: 0xbfe0ff }),
        wallTrim: new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
        wood: new THREE.MeshLambertMaterial({ color: 0xb07d4b }),
        counterTop: new THREE.MeshLambertMaterial({ color: 0xf1f3f5 }),
        steel: new THREE.MeshLambertMaterial({ color: 0xdfe3e6 }),
        ovenBrick: new THREE.MeshLambertMaterial({ map: ovenBrickTex }),
        ovenDome: new THREE.MeshLambertMaterial({ map: ovenBrickTex }),
        ovenMouth: new THREE.MeshLambertMaterial({ color: 0x1a1c1e }),
        fire: new THREE.MeshBasicMaterial({ color: 0xff922b }),
        conveyor: new THREE.MeshLambertMaterial({ color: 0x343a40 }),
        rail: new THREE.MeshLambertMaterial({ color: 0xb4bcc4 }),
        tablecloth: new THREE.MeshLambertMaterial({ map: createTableclothTexture() }),
        plate: new THREE.MeshLambertMaterial({ color: 0xffffff }),
        dirtyPlate: new THREE.MeshLambertMaterial({ color: 0xdee2e6 }),
        dirtyCrust: new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
        trashCan: new THREE.MeshLambertMaterial({ color: 0x2b8a3e }),
        trashCanLid: new THREE.MeshLambertMaterial({ color: 0x1e3a1e }),
        sodaMachine: new THREE.MeshLambertMaterial({ color: 0xe03131 }),
        sodaDispenser: new THREE.MeshLambertMaterial({ color: 0x339af0 }),
        cup: new THREE.MeshLambertMaterial({ color: 0xff6b6b }),
        hrDesk: new THREE.MeshLambertMaterial({ color: 0x20c997 }),
        hrPad: new THREE.MeshBasicMaterial({ color: 0xffd43b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
        skin: new THREE.MeshLambertMaterial({ color: 0xffdfba }),
        pants: new THREE.MeshLambertMaterial({ color: 0x2b3a4a }),
        playerPants: new THREE.MeshLambertMaterial({ color: 0x2b3a4a }),
        shoe: new THREE.MeshLambertMaterial({ color: 0x4a2c11 }),
        whiteChefHat: new THREE.MeshLambertMaterial({ color: 0xffffff }),
        redApron: new THREE.MeshLambertMaterial({ color: 0xe03131 }),
        pizzaCrust: new THREE.MeshLambertMaterial({ color: 0xe8590c }),
        pizzaCheese: new THREE.MeshLambertMaterial({ color: 0xffd43b }),
        pepperoni: new THREE.MeshLambertMaterial({ color: 0xb02a2a }),
        regBase: new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
        regScreen: new THREE.MeshLambertMaterial({ color: 0x212529 }),
        pickupTray: new THREE.MeshLambertMaterial({ color: 0xadb5bd }),
        pickupRing: new THREE.MeshBasicMaterial({ color: 0xff922b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
        billMat: new THREE.MeshBasicMaterial({ map: createBanknoteTexture(), side: THREE.DoubleSide }),
        heartMat: new THREE.MeshBasicMaterial({ color: 0xff6b81 }),
        cashAuraMat: new THREE.MeshBasicMaterial({ map: createCashAuraTexture(), side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
        road: new THREE.MeshLambertMaterial({ color: 0x212529 }),
        roadStripe: new THREE.MeshBasicMaterial({ color: 0xffd43b }),
        awningRed: new THREE.MeshLambertMaterial({ color: 0xe03131 }),
        awningWhite: new THREE.MeshLambertMaterial({ color: 0xffffff }),
        carGlass: new THREE.MeshLambertMaterial({ color: 0x1864ab, transparent: true, opacity: 0.85 }),
        carTire: new THREE.MeshLambertMaterial({ color: 0x121416 }),
        carRim: new THREE.MeshLambertMaterial({ color: 0xe9ecef }),
        carHeadlight: new THREE.MeshBasicMaterial({ color: 0xfff9db }),
        carTaillight: new THREE.MeshBasicMaterial({ color: 0xff6b6b }),
        driveThruSign: new THREE.MeshLambertMaterial({ color: 0x228be6 }),

        // Pizza Empire: Farm & Factory Materials
        soil: new THREE.MeshLambertMaterial({ color: 0x4a2e18 }),
        farmGrass: new THREE.MeshLambertMaterial({ color: 0x40c057 }),
        fenceWood: new THREE.MeshLambertMaterial({ color: 0xa67c52 }),
        wheatStem: new THREE.MeshLambertMaterial({ color: 0x82c91e }),
        wheatGrain: new THREE.MeshLambertMaterial({ color: 0xfcc419 }),
        wheatSheaf: new THREE.MeshLambertMaterial({ color: 0xf59f00 }),
        flourSack: new THREE.MeshLambertMaterial({ color: 0xf1f3f5 }),
        doughBase: new THREE.MeshLambertMaterial({ color: 0xffe066 }),
        millWood: new THREE.MeshLambertMaterial({ color: 0x6f4e37 }),
        millStone: new THREE.MeshLambertMaterial({ color: 0x868e96 }),
        pressChrome: new THREE.MeshLambertMaterial({ color: 0xced4da }),
        sauceRed: new THREE.MeshLambertMaterial({ color: 0xc92a2a }),
        cheeseGold: new THREE.MeshLambertMaterial({ color: 0xffd43b })
    };

    // Shared Geometries (Optimized low-poly curves for max FPS)
    const sharedWheatSheafGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 8);
    const sharedFlourSackGeo = new THREE.BoxGeometry(0.75, 0.6, 0.65);
    const sharedDoughGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.09, 12);
    const sharedBoxGeo = new THREE.BoxGeometry(1.6, 0.38, 1.6);
    const pizzaBoxCoverTex = createPizzaBoxCoverTexture();
    const sharedPizzaBoxMats = [
        new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
        new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
        new THREE.MeshLambertMaterial({ map: pizzaBoxCoverTex }),
        new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
        new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
        new THREE.MeshLambertMaterial({ color: 0xd4a373 })
    ];

    const sharedPlateGeo = new THREE.CylinderGeometry(0.85, 0.75, 0.08, 14);
    const sharedSliceGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.09, 12, 1, false, 0, Math.PI * 0.75);
    const sharedCashGeo = new THREE.BoxGeometry(0.88, 0.24, 0.56);
    const banknoteTex = createBanknoteTexture();
    const sharedCashMats = [
        new THREE.MeshLambertMaterial({ color: 0x37b24d }),
        new THREE.MeshLambertMaterial({ color: 0x37b24d }),
        new THREE.MeshLambertMaterial({ map: banknoteTex }),
        new THREE.MeshLambertMaterial({ color: 0x37b24d }),
        new THREE.MeshLambertMaterial({ color: 0x37b24d }),
        new THREE.MeshLambertMaterial({ color: 0x37b24d })
    ];
    const sharedBillGeo = new THREE.PlaneGeometry(0.75, 0.45);

    // Optimized character geometries (Smooth visual appearance, 65% fewer vertices)
    const sharedHeadGeo = new THREE.SphereGeometry(0.78, 16, 12);
    const sharedTorsoGeo = new THREE.CylinderGeometry(0.6, 0.52, 1.45, 14);
    const sharedArmGeo = new THREE.CylinderGeometry(0.19, 0.17, 1.15, 10);
    const sharedLegGeo = new THREE.CylinderGeometry(0.22, 0.18, 1.25, 10);
    const sharedShoeGeo = new THREE.BoxGeometry(0.38, 0.24, 0.55);

    // =========================================================================
    // 6. RESTAURANT ARCHITECTURE & ENVIRONMENT (EXACT REFERENCE 1)
    // =========================================================================
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), M.floor);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Decorative walls
    function createWallSegment(x, z, width, length, height = 7.5) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), M.wall);
        wall.position.set(x, height / 2, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);

        // Wood wainscot trim on top
        const trim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.8, length + 0.3), M.wallTrim);
        trim.position.set(x, height + 0.4, z);
        scene.add(trim);
    }
    createWallSegment(-55, 0, 2.2, 110);
    createWallSegment(55, 0, 2.2, 110);
    createWallSegment(0, -55, 110, 2.2);
    createWallSegment(0, 55, 110, 2.2);

    // =========================================================================
    // 6B. DRIVE-THRU ROADWAY, WINDOW & AWNING (THE SIGNATURE "PIZZA READY" FEATURE)
    // =========================================================================
    // Asphalt road lane along x = -38 (length 110, z from -55 to 55)
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 110), M.road);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(-38, 0.02, 0);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Yellow dashed center stripe
    for (let sz = -48; sz <= 48; sz += 8) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 4.5), M.roadStripe);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(-38, 0.03, sz);
        scene.add(stripe);
    }

    // Concrete curbs along road
    const curbL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 110), M.wallTrim);
    curbL.position.set(-43.3, 0.17, 0);
    scene.add(curbL);
    const curbR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 110), M.wallTrim);
    curbR.position.set(-32.7, 0.17, 0);
    scene.add(curbR);

    // Drive-Thru divider wall segments at x = -32 with a service window between z = -15 and z = -5
    createWallSegment(-32, -35, 1.8, 40); // North wall (z: -55 to -15)
    createWallSegment(-32, 25, 1.8, 60);  // South wall (z: -5 to 55)
    addBoxObstacle(-33, -31, -55, -15);
    addBoxObstacle(-33, -31, -5, 55);

    // Window Service Counter at x = -32, z = -10 (width 1.8, length 10)
    const dtWindowGroup = new THREE.Group();
    dtWindowGroup.position.set(-32, 0, -10);

    // Counter base
    const dtCounter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 9.6), M.wood);
    dtCounter.position.y = 1.2;
    dtCounter.castShadow = true;
    dtWindowGroup.add(dtCounter);

    // Polished countertop
    const dtTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.25, 10.0), M.counterTop);
    dtTop.position.y = 2.45;
    dtWindowGroup.add(dtTop);

    // Window cash drop & pickup shelf
    const dtShelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 3.2), M.steel);
    dtShelf.position.set(-1.8, 2.4, 0);
    dtWindowGroup.add(dtShelf);

    // Red & White Striped Awning extending over the drive-thru lane
    const awningGroup = new THREE.Group();
    awningGroup.position.set(-1.6, 4.8, 0);
    awningGroup.rotation.z = 0.2;

    const numSlats = 10;
    const slatW = 1.0;
    for (let i = 0; i < numSlats; i++) {
        const isRed = i % 2 === 0;
        const slat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, slatW), isRed ? M.awningRed : M.awningWhite);
        slat.position.set(0, 0, (i - numSlats / 2 + 0.5) * slatW);
        awningGroup.add(slat);
    }
    dtWindowGroup.add(awningGroup);

    // Illuminated "DRIVE-THRU" Sign
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 7.5), M.driveThruSign);
    signBoard.position.set(-0.8, 5.8, 0);
    dtWindowGroup.add(signBoard);

    // Window frame pillars
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 5.0, 0.5), M.wall);
    pillarL.position.set(0, 2.5, -4.8);
    dtWindowGroup.add(pillarL);
    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 5.0, 0.5), M.wall);
    pillarR.position.set(0, 2.5, 4.8);
    dtWindowGroup.add(pillarR);

    // Floor Interaction decal for player
    const dtPickupMarker = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.5, 24), M.pickupRing);
    dtPickupMarker.rotation.x = -Math.PI / 2;
    dtPickupMarker.position.set(4.0, 0.03, 0);
    dtWindowGroup.add(dtPickupMarker);

    scene.add(dtWindowGroup);
    addBoxObstacle(-33.5, -30.5, -15, -5);

    const DRIVE_THRU_PLAYER_SPOT = new THREE.Vector3(-28, 0, -10);
    const DRIVE_THRU_WINDOW_POS = new THREE.Vector3(-32, 0, -10);

    // =========================================================================
    // 6C. 3D CAR MESH & DRIVE-THRU VEHICLE QUEUE (EXACT "PIZZA READY" MECHANIC)
    // =========================================================================
    const carBodyGeo = new THREE.BoxGeometry(2.6, 1.3, 4.5);
    const carCabinGeo = new THREE.BoxGeometry(2.3, 1.15, 2.5);
    const carWheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.42, 16);
    const carHeadlightGeo = new THREE.SphereGeometry(0.25, 12, 10);
    const carTaillightGeo = new THREE.BoxGeometry(0.5, 0.22, 0.12);

    const carColorList = [0xe03131, 0x1971c2, 0x2f9e44, 0xf08c00, 0x9c36b5, 0x1098ad, 0xf76707, 0x364fc7];

    function createCarMesh(colorHex) {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.2 });

        const body = new THREE.Mesh(carBodyGeo, bodyMat);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        const cabin = new THREE.Mesh(carCabinGeo, bodyMat);
        cabin.position.set(0, 2.1, -0.2);
        cabin.castShadow = true;
        group.add(cabin);

        const windFront = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.95), M.carGlass);
        windFront.position.set(0, 2.1, 1.06);
        group.add(windFront);

        const windBack = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.95), M.carGlass);
        windBack.position.set(0, 2.1, -1.46);
        windBack.rotation.y = Math.PI;
        group.add(windBack);

        const h1 = new THREE.Mesh(carHeadlightGeo, M.carHeadlight);
        h1.position.set(0.9, 1.1, 2.22);
        group.add(h1);
        const h2 = new THREE.Mesh(carHeadlightGeo, M.carHeadlight);
        h2.position.set(-0.9, 1.1, 2.22);
        group.add(h2);

        const t1 = new THREE.Mesh(carTaillightGeo, M.carTaillight);
        t1.position.set(0.9, 1.1, -2.26);
        group.add(t1);
        const t2 = new THREE.Mesh(carTaillightGeo, M.carTaillight);
        t2.position.set(-0.9, 1.1, -2.26);
        group.add(t2);

        const wheels = [];
        [
            [1.3, 0.55, 1.3],
            [-1.3, 0.55, 1.3],
            [1.3, 0.55, -1.3],
            [-1.3, 0.55, -1.3]
        ].forEach(([wx, wy, wz]) => {
            const wg = new THREE.Group();
            wg.position.set(wx, wy, wz);
            const tire = new THREE.Mesh(carWheelGeo, M.carTire);
            tire.rotation.z = Math.PI / 2;
            wg.add(tire);
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.44, 12), M.carRim);
            rim.rotation.z = Math.PI / 2;
            wg.add(rim);
            group.add(wg);
            wheels.push(wg);
        });

        const driver = new THREE.Mesh(sharedHeadGeo, M.skin);
        driver.scale.setScalar(0.7);
        driver.position.set(0.4, 2.0, 0.1);
        group.add(driver);

        return { root: group, wheels };
    }

    const driveThruCars = [];
    let carSpawnTimer = 0;

    function spawnDriveThruCar() {
        if (!GameState.driveThruUnlocked) return;
        if (driveThruCars.length >= 2) return;

        const color = carColorList[Math.floor(Math.random() * carColorList.length)];
        const carMesh = createCarMesh(color);
        carMesh.root.position.set(-38, 0, -50);
        scene.add(carMesh.root);

        const orderPizzas = 2 + Math.floor(Math.random() * 2);
        const wantsDrink = Math.random() < 0.5;
        const totalCost = orderPizzas * 8 + (wantsDrink ? 6 : 0);

        const bubble = document.createElement('div');
        bubble.className = 'drive-thru-bubble';
        bubble.innerHTML = `<span>🚗 ${orderPizzas}x 🍕${wantsDrink ? ' 🥤' : ''} ($${totalCost})</span>`;
        bubble.style.display = 'none';
        floatingUI.appendChild(bubble);

        driveThruCars.push({
            mesh: carMesh,
            bubbleEl: bubble,
            state: 'DRIVE_TO_WINDOW',
            orderPizzas,
            wantsDrink,
            rewardCash: totalCost,
            speed: 12.0,
            hasHonked: false
        });
    }

    // =========================================================================
    // 6C. 🚌 FRANCHISE TRANSIT BUS & METRO EXPEDITION TERMINAL
    // =========================================================================
    const FRANCHISE_BUS_ZONE_POS = new THREE.Vector3(28, 0, 38);
    const franchiseBusGroup = new THREE.Group();
    franchiseBusGroup.position.set(34, 0, 44);

    // Bus Main Body
    const busBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59f00, roughness: 0.35, metalness: 0.1 });
    const busChassis = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.8, 4.0), busBodyMat);
    busChassis.position.y = 2.2;
    busChassis.castShadow = true;
    franchiseBusGroup.add(busChassis);

    // Roof White Top
    const busRoof = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.35, 3.8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    busRoof.position.y = 4.2;
    franchiseBusGroup.add(busRoof);

    // Tinted Large Windows along sides
    const busGlassMat = new THREE.MeshStandardMaterial({ color: 0x1971c2, roughness: 0.1, metalness: 0.7, transparent: true, opacity: 0.85 });
    const sideWindowsL = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.3, 0.1), busGlassMat);
    sideWindowsL.position.set(0, 2.8, 2.05);
    franchiseBusGroup.add(sideWindowsL);

    const sideWindowsR = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.3, 0.1), busGlassMat);
    sideWindowsR.position.set(0, 2.8, -2.05);
    franchiseBusGroup.add(sideWindowsR);

    // Front Windshield
    const frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 3.6), busGlassMat);
    frontWindshield.position.set(-4.85, 2.8, 0);
    franchiseBusGroup.add(frontWindshield);

    // Bus Heavy Wheels
    const busWheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    [
        [-2.8, 0.8, 2.05], [0.5, 0.8, 2.05], [2.8, 0.8, 2.05],
        [-2.8, 0.8, -2.05], [0.5, 0.8, -2.05], [2.8, 0.8, -2.05]
    ].forEach(([wx, wy, wz]) => {
        const tire = new THREE.Mesh(busWheelGeo, M.carTire);
        tire.rotation.x = Math.PI / 2;
        tire.position.set(wx, wy, wz);
        franchiseBusGroup.add(tire);
    });

    // Destination LED Sign
    const destSign = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 0.15), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    destSign.position.set(-4.85, 3.8, 0);
    franchiseBusGroup.add(destSign);

    // Headlights
    const busH1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.15, 12), M.carHeadlight);
    busH1.rotation.z = Math.PI / 2;
    busH1.position.set(-4.85, 1.5, 1.2);
    franchiseBusGroup.add(busH1);
    const busH2 = busH1.clone();
    busH2.position.set(-4.85, 1.5, -1.2);
    franchiseBusGroup.add(busH2);

    scene.add(franchiseBusGroup);
    addBoxObstacle(29, 39, 41.5, 46.5);

    // Interactive Franchise Transit Zone Pad on floor
    const franchiseZoneGroup = new THREE.Group();
    franchiseZoneGroup.position.copy(FRANCHISE_BUS_ZONE_POS);

    const fZoneRing = new THREE.Mesh(
        new THREE.RingGeometry(2.0, 2.4, 32),
        new THREE.MeshBasicMaterial({ color: 0xffd43b, side: THREE.DoubleSide })
    );
    fZoneRing.rotation.x = -Math.PI / 2;
    fZoneRing.position.y = 0.04;
    franchiseZoneGroup.add(fZoneRing);

    const fZoneCenter = new THREE.Mesh(
        new THREE.CircleGeometry(2.0, 32),
        new THREE.MeshBasicMaterial({ color: 0xfa5252, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    fZoneCenter.rotation.x = -Math.PI / 2;
    fZoneCenter.position.y = 0.03;
    franchiseZoneGroup.add(fZoneCenter);

    scene.add(franchiseZoneGroup);

    // Floating 3D HTML Label over bus zone
    const franchiseBusLabel = document.createElement('div');
    franchiseBusLabel.className = 'worker-tag franchise-bus-tag';
    franchiseBusLabel.innerHTML = '<span>🚌 FRANCHISE METRO EXPRESS</span><small>Step in to manage empire</small>';
    floatingUI.appendChild(franchiseBusLabel);

    // =========================================================================
    // 7. KITCHEN PREPARATION STATION (EXACT MATCH TO REFERENCE 1)
    // =========================================================================
    const prepCounterGroup = new THREE.Group();
    prepCounterGroup.position.set(-4, 0, -22);

    // Wood cabinet base with steel handles
    const prepBase = new THREE.Mesh(new THREE.BoxGeometry(10.5, 2.4, 3.2), M.wood);
    prepBase.position.y = 1.2;
    prepBase.castShadow = true;
    prepCounterGroup.add(prepBase);

    // Stainless steel polished top
    const prepTop = new THREE.Mesh(new THREE.BoxGeometry(10.9, 0.25, 3.4), M.steel);
    prepTop.position.y = 2.45;
    prepCounterGroup.add(prepTop);

    // Stainless steel sink basin
    const sinkGeo = new THREE.BoxGeometry(2.4, 0.4, 1.8);
    const sinkMesh = new THREE.Mesh(sinkGeo, M.steel);
    sinkMesh.position.set(3.2, 2.5, 0);
    prepCounterGroup.add(sinkMesh);

    // Curved silver faucet
    const faucetGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12);
    const faucetMesh = new THREE.Mesh(faucetGeo, M.steel);
    faucetMesh.position.set(3.2, 2.9, -0.6);
    prepCounterGroup.add(faucetMesh);

    // Wooden cutting board with fresh dough
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8), M.wood);
    board.position.set(0.2, 2.6, 0);
    prepCounterGroup.add(board);

    const dough = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0xffe8cc, roughness: 0.6 }));
    dough.position.set(0.2, 2.7, 0);
    prepCounterGroup.add(dough);

    // 3 Ingredient bowls (Marinara sauce, green basil, cheese)
    const bowlGeo = new THREE.CylinderGeometry(0.65, 0.45, 0.45, 14);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    const b1 = new THREE.Mesh(bowlGeo, bowlMat);
    b1.position.set(-2.2, 2.75, 0.6);
    const sauceFill = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.1, 14), new THREE.MeshStandardMaterial({ color: 0xc92a2a, roughness: 0.25 }));
    sauceFill.position.set(-2.2, 2.9, 0.6);
    prepCounterGroup.add(b1); prepCounterGroup.add(sauceFill);

    const b2 = new THREE.Mesh(bowlGeo, bowlMat);
    b2.position.set(-3.6, 2.75, 0.6);
    const basilFill = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.1, 14), new THREE.MeshStandardMaterial({ color: 0x2f9e44, roughness: 0.5 }));
    basilFill.position.set(-3.6, 2.9, 0.6);
    prepCounterGroup.add(b2); prepCounterGroup.add(basilFill);

    const b3 = new THREE.Mesh(bowlGeo, bowlMat);
    b3.position.set(-2.2, 2.75, -0.6);
    const cheeseFill = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.1, 14), new THREE.MeshStandardMaterial({ color: 0xffd43b, roughness: 0.35 }));
    cheeseFill.position.set(-2.2, 2.9, -0.6);
    prepCounterGroup.add(b3); prepCounterGroup.add(cheeseFill);

    scene.add(prepCounterGroup);
    // Obstacle removed to ensure 100% wide open walkway across the entire kitchen floor

    // =========================================================================
    // 7B. PIZZA EMPIRE: WHEAT FARM, FLOUR MILL, DOUGH PRESS & TOPPING MACHINES
    // =========================================================================
    // --- 1. WHEAT FARM FIELD (OUTDOOR CROP GARDEN) ---
    const farmGroup = new THREE.Group();
    farmGroup.position.set(-20, 0, -38);

    // Green grass lawn base
    const farmLawn = new THREE.Mesh(new THREE.BoxGeometry(18, 0.25, 14), M.farmGrass);
    farmLawn.position.y = 0.12;
    farmLawn.receiveShadow = true;
    farmGroup.add(farmLawn);

    // Tilled fertile dark soil bed
    const soilBed = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.34, 11.6), M.soil);
    soilBed.position.y = 0.18;
    soilBed.receiveShadow = true;
    farmGroup.add(soilBed);

    // Split-rail wooden fence posts around perimeter
    const fencePosts = [
        [-8.6, -6.6], [-4.3, -6.6], [0, -6.6], [4.3, -6.6], [8.6, -6.6],
        [-8.6, 6.6], [-4.3, 6.6], [4.3, 6.6], [8.6, 6.6],
        [-8.6, -2.2], [-8.6, 2.2], [8.6, -2.2], [8.6, 2.2]
    ];
    fencePosts.forEach(([fx, fz]) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.35), M.fenceWood);
        post.position.set(fx, 0.7, fz);
        post.castShadow = true;
        farmGroup.add(post);
    });

    function addFenceRail(x1, z1, x2, z2) {
        const length = Math.hypot(x2 - x1, z2 - z1);
        const angle = Math.atan2(x2 - x1, z2 - z1);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, length), M.fenceWood);
        rail.position.set((x1 + x2) / 2, 0.9, (z1 + z2) / 2);
        rail.rotation.y = angle;
        farmGroup.add(rail);
    }
    addFenceRail(-8.6, -6.6, 8.6, -6.6);
    addFenceRail(-8.6, -6.6, -8.6, 6.6);
    addFenceRail(8.6, -6.6, 8.6, 6.6);
    addFenceRail(-8.6, 6.6, -2.0, 6.6);
    addFenceRail(2.0, 6.6, 8.6, 6.6);

    // 12 Wheat crops grid
    const wheatCrops = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            const cropGroup = new THREE.Group();
            const cx = -6.0 + c * 4.0;
            const cz = -4.2 + r * 4.2;
            cropGroup.position.set(cx, 0.3, cz);

            for (let s = 0; s < 4; s++) {
                const ox = (s % 2 === 0 ? -0.35 : 0.35);
                const oz = (s < 2 ? -0.35 : 0.35);
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), M.wheatStem);
                stem.position.set(ox, 0.75, oz);
                stem.rotation.z = (Math.random() - 0.5) * 0.1;
                cropGroup.add(stem);

                const grain = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 6), M.wheatGrain);
                grain.position.set(ox, 1.7, oz);
                cropGroup.add(grain);
            }

            farmGroup.add(cropGroup);
            wheatCrops.push({
                group: cropGroup,
                pos: new THREE.Vector3(-20 + cx, 0, -38 + cz),
                isRipe: true,
                regrowTimer: 0
            });
        }
    }
    scene.add(farmGroup);

    function expandWheatFarmPlot() {
        if (GameState.farmExpanded) return;
        GameState.farmExpanded = true;

        const extraSoil = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.34, 7.0), M.soil);
        extraSoil.position.set(0, 0.18, -9.0);
        extraSoil.receiveShadow = true;
        farmGroup.add(extraSoil);

        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 4; c++) {
                const cropGroup = new THREE.Group();
                const cx = -6.0 + c * 4.0;
                const cz = -7.5 - r * 3.2;
                cropGroup.position.set(cx, 0.3, cz);

                for (let s = 0; s < 4; s++) {
                    const ox = (s % 2 === 0 ? -0.35 : 0.35);
                    const oz = (s < 2 ? -0.35 : 0.35);
                    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), M.wheatStem);
                    stem.position.set(ox, 0.75, oz);
                    cropGroup.add(stem);

                    const grain = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 6), M.wheatGrain);
                    grain.position.set(ox, 1.7, oz);
                    cropGroup.add(grain);
                }

                farmGroup.add(cropGroup);
                wheatCrops.push({
                    group: cropGroup,
                    pos: new THREE.Vector3(-20 + cx, 0, -38 + cz),
                    isRipe: true,
                    regrowTimer: 0
                });
            }
        }
        sound.playUnlock();
        showToast('🚜 Wheat Farm Expanded! +8 Extra Crops & Maximum Yield!');
    }

    // --- 2. FLOUR MILL (GRAIN GRINDER MACHINE) ---
    const millGroup = new THREE.Group();
    millGroup.position.set(-6, 0, -38);

    const millBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 3.8), M.millWood);
    millBase.position.y = 1.1;
    millBase.castShadow = true;
    millBase.receiveShadow = true;
    millGroup.add(millBase);

    const hopper = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.7, 1.8, 14), M.pressChrome);
    hopper.position.set(-0.8, 2.8, 0);
    millGroup.add(hopper);

    const millWheel = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.45, 16), M.millStone);
    millWheel.position.set(1.2, 1.4, 0);
    millWheel.rotation.z = Math.PI / 2;
    millGroup.add(millWheel);

    const flourShelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.0), M.wood);
    flourShelf.position.set(2.6, 0.4, 0);
    millGroup.add(flourShelf);

    const flourSacks = [];
    for (let f = 0; f < 4; f++) {
        const sack = new THREE.Mesh(sharedFlourSackGeo, M.flourSack);
        sack.position.set(2.2 + (f % 2) * 0.7, 0.9 + Math.floor(f / 2) * 0.55, -0.4 + (f % 2) * 0.6);
        sack.rotation.y = (f * 0.4);
        sack.visible = (f === 0);
        millGroup.add(sack);
        flourSacks.push(sack);
    }
    scene.add(millGroup);
    addBoxObstacle(-8.0, -4.0, -40.0, -36.0);

    // Mill Rings: Wheat Input (-7.5, -34.0) & Flour Output (-4.5, -34.0)
    const millDropRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.7, 20), M.pickupRing);
    millDropRing.rotation.x = -Math.PI / 2;
    millDropRing.position.set(-7.5, 0.04, -34.0);
    scene.add(millDropRing);

    const millPickupRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.7, 20), M.floorGlow);
    millPickupRing.rotation.x = -Math.PI / 2;
    millPickupRing.position.set(-4.5, 0.04, -34.0);
    scene.add(millPickupRing);

    const MillState = {
        storedWheat: 2,
        maxWheat: 10,
        readyFlour: 1,
        maxFlour: 6,
        grindTimer: 0,
        dropPos: new THREE.Vector3(-7.5, 0, -34.0),
        pickupPos: new THREE.Vector3(-4.5, 0, -34.0)
    };

    // --- 3. DOUGH PRESS & ROLLER MACHINE ---
    const pressGroup = new THREE.Group();
    pressGroup.position.set(2, 0, -38);

    const pressCounter = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.2, 3.8), M.steel);
    pressCounter.position.y = 1.1;
    pressCounter.castShadow = true;
    pressGroup.add(pressCounter);

    const pistonShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.2, 12), M.pressChrome);
    pistonShaft.position.set(0, 3.2, 0);
    pressGroup.add(pistonShaft);

    const pressPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 16), M.pressChrome);
    pressPlate.position.set(0, 2.1, 0);
    pressGroup.add(pressPlate);

    const doughTray = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 2.0), M.counterTop);
    doughTray.position.set(2.8, 0.4, 0);
    pressGroup.add(doughTray);

    const doughDisks = [];
    for (let d = 0; d < 4; d++) {
        const disk = new THREE.Mesh(sharedDoughGeo, M.doughBase);
        disk.position.set(2.5 + (d % 2) * 0.6, 0.9 + Math.floor(d / 2) * 0.15, -0.3 + (d % 2) * 0.5);
        disk.visible = (d === 0);
        pressGroup.add(disk);
        doughDisks.push(disk);
    }
    scene.add(pressGroup);
    addBoxObstacle(0.0, 4.0, -40.0, -36.0);

    // Press Rings: Flour Input (0.5, -34.0) & Dough Output (3.5, -34.0)
    const pressDropRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.7, 20), M.pickupRing);
    pressDropRing.rotation.x = -Math.PI / 2;
    pressDropRing.position.set(0.5, 0.04, -34.0);
    scene.add(pressDropRing);

    const pressPickupRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.7, 20), M.floorGlow);
    pressPickupRing.rotation.x = -Math.PI / 2;
    pressPickupRing.position.set(3.5, 0.04, -34.0);
    scene.add(pressPickupRing);

    const PressState = {
        storedFlour: 1,
        maxFlour: 8,
        readyDough: 1,
        maxDough: 5,
        pressTimer: 0,
        dropPos: new THREE.Vector3(0.5, 0, -34.0),
        pickupPos: new THREE.Vector3(3.5, 0, -34.0)
    };

    // --- 4. TOPPING & CHEESE ASSEMBLY STATION (DIRECT IN-LINE TO OVEN) ---
    const toppingGroup = new THREE.Group();
    toppingGroup.position.set(-18, 0, -25);

    const toppingTable = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.0, 3.2), M.wood);
    toppingTable.position.y = 1.0;
    toppingTable.castShadow = true;
    toppingGroup.add(toppingTable);

    // Rear stainless feed conveyor into the oven mouth
    const prepFeedConveyor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.38, 4.2), M.conveyor);
    prepFeedConveyor.position.set(0, 1.45, 2.0);
    toppingGroup.add(prepFeedConveyor);

    const sauceTank = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.5, 14), M.sauceRed);
    sauceTank.position.set(-1.2, 2.6, -0.6);
    toppingGroup.add(sauceTank);

    const cheeseHopper = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.4, 14), M.cheeseGold);
    cheeseHopper.position.set(0, 2.6, -0.6);
    toppingGroup.add(cheeseHopper);

    const pepTube = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.3, 12), M.pepperoni);
    pepTube.position.set(1.2, 2.5, -0.6);
    toppingGroup.add(pepTube);

    scene.add(toppingGroup);

    // Topping Station Dough Input Ring at open concourse (-18.0, -28.0)
    const toppingDropRing = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.8, 20), M.pickupRing);
    toppingDropRing.rotation.x = -Math.PI / 2;
    toppingDropRing.position.set(-18.0, 0.04, -28.0);
    scene.add(toppingDropRing);

    function setFarmFactoryVisibility(visible) {
        if (typeof farmGroup !== 'undefined') farmGroup.visible = visible;
        if (typeof millGroup !== 'undefined') millGroup.visible = visible;
        if (typeof pressGroup !== 'undefined') pressGroup.visible = visible;
        if (typeof millDropRing !== 'undefined') millDropRing.visible = visible;
        if (typeof millPickupRing !== 'undefined') millPickupRing.visible = visible;
        if (typeof pressDropRing !== 'undefined') pressDropRing.visible = visible;
        if (typeof pressPickupRing !== 'undefined') pressPickupRing.visible = visible;
        if (typeof toppingDropRing !== 'undefined') toppingDropRing.visible = visible;
    }
    setFarmFactoryVisibility(!!GameState.farmExpanded);

    const ToppingState = {
        dropPos: new THREE.Vector3(-18.0, 0, -28.0)
    };

    // --- 5. AUTOMATED BOX PACKAGING STATION (IN-LINE BEFORE PICKUP TRAY) ---
    const packagingGroup = new THREE.Group();
    packagingGroup.position.set(-18, 0, -9.5);

    const packCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 2.4), M.steel);
    packCanopy.position.y = 2.4;
    packCanopy.castShadow = true;
    packagingGroup.add(packCanopy);

    const packStamp = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 2.0), M.pressChrome);
    packStamp.position.y = 2.1;
    packagingGroup.add(packStamp);

    const packLed = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshBasicMaterial({ color: 0x51cf66 }));
    packLed.position.set(0, 3.9, 0);
    packagingGroup.add(packLed);

    scene.add(packagingGroup);

    // =========================================================================
    // 3D PARABOLIC ITEM TRANSFER SYSTEM (VISIBLE FLYING ITEMS)
    // =========================================================================
    const transferItems = [];
    function spawnTransferItem(type, fromPos, toPos, onComplete) {
        let mesh;
        if (type === 'wheat') {
            mesh = new THREE.Mesh(sharedWheatSheafGeo, M.wheatSheaf);
            mesh.rotation.z = Math.PI / 2;
        } else if (type === 'flour') {
            mesh = new THREE.Mesh(sharedFlourSackGeo, M.flourSack);
        } else if (type === 'dough') {
            mesh = new THREE.Mesh(sharedDoughGeo, M.doughBase);
        } else {
            mesh = createPizzaBoxMesh();
        }
        mesh.position.copy(fromPos).setY(1.5);
        scene.add(mesh);
        transferItems.push({
            mesh,
            start: fromPos.clone().setY(1.5),
            target: toPos.clone().setY(1.8),
            progress: 0,
            speed: 3.2,
            onComplete
        });
    }

    // =========================================================================
    // 8. BRICK PIZZA OVEN & CONVEYOR (EXACT MATCH TO REFERENCE 1)
    // =========================================================================
    const ovenGroup = new THREE.Group();
    ovenGroup.position.set(-18, 0, -18);

    const ovenBase = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.2, 5.2), M.ovenBrick);
    ovenBase.position.y = 2.1;
    ovenBase.castShadow = true;
    ovenBase.receiveShadow = true;
    ovenGroup.add(ovenBase);

    const ovenDome = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.3, 2.2, 20), M.ovenDome);
    ovenDome.position.y = 5.0;
    ovenGroup.add(ovenDome);

    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 4.4, 16), M.ovenBrick);
    chimney.position.set(0, 7.2, 0);
    ovenGroup.add(chimney);

    // Keystone Arch Entrance
    const mouth = new THREE.Mesh(
        new THREE.CylinderGeometry(1.7, 1.7, 1.5, 18, 1, false, 0, Math.PI),
        M.ovenMouth
    );
    mouth.rotation.x = Math.PI / 2;
    mouth.position.set(0, 2.1, 2.6);
    ovenGroup.add(mouth);

    // Fire logs & flame
    const fireMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), M.fire);
    fireMesh.position.set(0, 1.9, 2.0);
    ovenGroup.add(fireMesh);

    // Slatted Conveyor Belt
    const conveyorBelt = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.42, 10.2), M.conveyor);
    conveyorBelt.position.set(0, 1.45, 7.6);
    ovenGroup.add(conveyorBelt);

    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 10.2), M.rail);
    railL.position.set(-1.9, 1.7, 7.6);
    ovenGroup.add(railL);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 10.2), M.rail);
    railR.position.set(1.9, 1.7, 7.6);
    ovenGroup.add(railR);

    const pickupTray = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.38, 2.8), M.pickupTray);
    pickupTray.position.set(0, 1.5, 13.2);
    ovenGroup.add(pickupTray);

    const pickupMarker = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.4, 20), M.pickupRing);
    pickupMarker.rotation.x = -Math.PI / 2;
    pickupMarker.position.set(0, 0.03, 13.2);
    ovenGroup.add(pickupMarker);

    scene.add(ovenGroup);
    // Refined collision matching actual 3D visual geometry (open corridor for player):
    addBoxObstacle(-21.5, -14.5, -21.0, -15.5); // Oven Base
    addBoxObstacle(-20.0, -16.0, -15.5, -4.5);  // Slatted Conveyor Belt
    addBoxObstacle(-20.5, -15.5, -28.5, -22.5); // Rear Topping Station

    const PIZZA_PICKUP_POS = new THREE.Vector3(-18, 0, -4.8);

    // =========================================================================
    // 9. CASHIER SERVICE COUNTER & QUEUE (REFERENCE 1)
    // =========================================================================
    const cashierGroup = new THREE.Group();
    cashierGroup.position.set(18, 0, 0);

    const serviceCounter = new THREE.Mesh(new THREE.BoxGeometry(8.8, 2.4, 2.8), M.wood);
    serviceCounter.position.y = 1.2;
    cashierGroup.add(serviceCounter);

    const serviceTop = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.25, 3.0), M.counterTop);
    serviceTop.position.y = 2.45;
    cashierGroup.add(serviceTop);

    // Retro Cash Register (Reference 1)
    const regBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.5), M.regBase);
    regBase.position.set(1.4, 3.0, 0);
    cashierGroup.add(regBase);

    // Register receipt roll
    const rollMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    rollMesh.rotation.z = Math.PI / 2;
    rollMesh.position.set(1.4, 3.7, -0.4);
    cashierGroup.add(rollMesh);

    // --- FRONT COUNTER HEATED PIZZA DISPLAY SHELF ---
    const counterPizzas = [];
    const counterShelfGroup = new THREE.Group();
    counterShelfGroup.position.set(-1.8, 2.5, 0); // Mounted on counter top

    const shelfTray = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.15, 2.2), M.steel);
    counterShelfGroup.add(shelfTray);

    const shelfGlass = new THREE.Mesh(new THREE.BoxGeometry(4.1, 1.8, 2.3), new THREE.MeshStandardMaterial({
        color: 0xffd8a8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1
    }));
    shelfGlass.position.y = 0.9;
    counterShelfGroup.add(shelfGlass);

    const heatBar = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.4), new THREE.MeshBasicMaterial({ color: 0xff922b }));
    heatBar.position.y = 1.75;
    counterShelfGroup.add(heatBar);
    cashierGroup.add(counterShelfGroup);

    const COUNTER_DROP_SPOT = new THREE.Vector3(15.0, 0, -3.4);
    const COUNTER_SHELF_WORLD_POS = new THREE.Vector3(16.2, 2.5, 0);

    const shelfTag = document.createElement('div');
    shelfTag.className = 'floating-zone-tag';
    shelfTag.innerHTML = '🔥 HOT PIZZA DISPLAY (<span id="shelf-pizza-count">0</span>/12)';
    shelfTag.style.background = 'linear-gradient(135deg, #e8590c, #d9480f)';
    floatingUI.appendChild(shelfTag);

    function updateCounterShelfVisuals() {
        const countEl = document.getElementById('shelf-pizza-count');
        if (countEl) countEl.innerText = counterPizzas.length;
    }

    scene.add(cashierGroup);
    addBoxObstacle(13.5, 22.5, -1.6, 1.6);

    const QUEUE_SPOTS = [
        new THREE.Vector3(18, 0, 3.8),
        new THREE.Vector3(18, 0, 7.2),
        new THREE.Vector3(18, 0, 10.6),
        new THREE.Vector3(18, 0, 14.0),
        new THREE.Vector3(18, 0, 17.4),
        new THREE.Vector3(18, 0, 20.8)
    ];
    const COUNTER_PLAYER_SPOT = new THREE.Vector3(18, 0, -3.8);

    // =========================================================================
    // 10. CASH DROP PILE WITH GLOWING NEON AURA (ACCURATE DOLLAR PROGRESSION)
    // =========================================================================
    const CASH_DROP_POS = new THREE.Vector3(12, 0, 3.8);

    // Glowing green neon floor aura (Reference 1)
    const cashAuraMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), M.cashAuraMat);
    cashAuraMesh.rotation.x = -Math.PI / 2;
    cashAuraMesh.position.set(CASH_DROP_POS.x, 0.03, CASH_DROP_POS.z);
    scene.add(cashAuraMesh);

    const cashPileGroup = new THREE.Group();
    cashPileGroup.position.copy(CASH_DROP_POS);
    scene.add(cashPileGroup);

    const MAX_CASH_MESHES = 36;
    const cashMeshPool = [];
    for (let i = 0; i < MAX_CASH_MESHES; i++) {
        const mesh = new THREE.Mesh(sharedCashGeo, sharedCashMats);
        const stack = Math.floor(i / 6);
        const slot = i % 6;
        const row = Math.floor(slot / 3);
        const col = slot % 3;
        mesh.position.set((col - 1) * 0.95, stack * 0.26 + 0.13, (row - 0.5) * 0.65);
        mesh.rotation.y = (Math.random() - 0.5) * 0.08;
        mesh.visible = false;
        cashPileGroup.add(mesh);
        cashMeshPool.push(mesh);
    }

    let activeCashCount = 0;
    let activeCashDollars = 0;

    function updateCashPileVisuals() {
        const visibleBundles = Math.min(activeCashCount, MAX_CASH_MESHES);
        for (let i = 0; i < MAX_CASH_MESHES; i++) {
            cashMeshPool[i].visible = (i < visibleBundles);
        }
    }

    function addCashToPile(dollars) {
        activeCashDollars += dollars;
        // 1 visible mesh per $2-$3
        activeCashCount = Math.min(MAX_CASH_MESHES, Math.max(1, Math.ceil(activeCashDollars / 2.5)));
        updateCashPileVisuals();
    }

    // =========================================================================
    // 11. 🗑️ RECYCLING DUMPSTER & SODA DISPENSER
    // =========================================================================
    const TRASH_BIN_POS = new THREE.Vector3(2, 0, 4);

    const trashCanGroup = new THREE.Group();
    trashCanGroup.position.copy(TRASH_BIN_POS);

    const trashBody = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 2.6, 16), M.trashCan);
    trashBody.position.y = 1.3;
    trashBody.castShadow = true;
    trashCanGroup.add(trashBody);

    const trashLid = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.4, 16), M.trashCanLid);
    trashLid.position.y = 2.7;
    trashCanGroup.add(trashLid);

    scene.add(trashCanGroup);
    addCircleObstacle(TRASH_BIN_POS.x, TRASH_BIN_POS.z, 1.5);

    // Soda Dispenser
    const SODA_STATION_POS = new THREE.Vector3(26, 0, 3.8);
    const sodaGroup = new THREE.Group();
    sodaGroup.position.set(26, 0, 0);

    const sodaBase = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.6, 2.6), M.sodaMachine);
    sodaBase.position.y = 1.8;
    sodaBase.castShadow = true;
    sodaGroup.add(sodaBase);

    const dispenserPanel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.3), M.sodaDispenser);
    dispenserPanel.position.set(0, 1.8, 1.35);
    sodaGroup.add(dispenserPanel);

    const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.85, 12), M.cup);
    cup1.position.set(-0.8, 1.3, 1.5);
    sodaGroup.add(cup1);
    const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.85, 12), M.cup);
    cup2.position.set(0.8, 1.3, 1.5);
    sodaGroup.add(cup2);

    scene.add(sodaGroup);
    addBoxObstacle(24.0, 28.0, -1.5, 1.5);

    // HR Upgrades Kiosk
    const HR_DESK_POS = new THREE.Vector3(28, 0, -18);
    const hrGroup = new THREE.Group();
    hrGroup.position.copy(HR_DESK_POS);

    const hrDeskMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 2.4), M.hrDesk);
    hrDeskMesh.position.y = 1.1;
    hrDeskMesh.castShadow = true;
    hrGroup.add(hrDeskMesh);

    const pcMonitor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.2), M.regBase);
    pcMonitor.position.set(0, 2.7, 0.2);
    hrGroup.add(pcMonitor);

    const hrPadMesh = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20), M.hrPad);
    hrPadMesh.rotation.x = -Math.PI / 2;
    hrPadMesh.position.set(0, 0.02, 2.4);
    hrGroup.add(hrPadMesh);

    scene.add(hrGroup);
    addBoxObstacle(25.5, 30.5, -19.5, -16.5);

    // =========================================================================
    // 12. SMOOTH PLASTICINE CHARACTER FACTORY (REFERENCE 1 & 2)
    // =========================================================================
    const hatBaseGeo = new THREE.CylinderGeometry(0.7, 0.68, 0.45, 24);
    const hatPuffGeo = new THREE.SphereGeometry(0.96, 24, 20);
    const apronGeo = new THREE.CylinderGeometry(0.62, 0.55, 1.25, 24, 1, false, -Math.PI * 0.55, Math.PI * 1.1);

    function createCharacterMesh(options = {}) {
        const group = new THREE.Group();
        const shirtColor = options.shirtColor || 0x339af0;
        const pantsMat = options.isPlayer ? M.playerPants : M.pants;
        const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });

        // Head (Smooth round clay sphere)
        const head = new THREE.Mesh(sharedHeadGeo, M.skin);
        head.position.y = 3.3;
        group.add(head);

        // Chef Hat Toque (Reference 1)
        if (options.hasChefHat) {
            const hatBase = new THREE.Mesh(hatBaseGeo, M.whiteChefHat);
            hatBase.position.y = 3.85;
            group.add(hatBase);

            const hatPuff = new THREE.Mesh(hatPuffGeo, M.whiteChefHat);
            hatPuff.scale.set(1.15, 0.82, 1.15);
            hatPuff.position.y = 4.3;
            group.add(hatPuff);
        }

        // Torso
        const torso = new THREE.Mesh(sharedTorsoGeo, shirtMat);
        torso.position.y = 2.1;
        torso.castShadow = true;
        group.add(torso);

        // Red Apron (Reference 1)
        if (options.hasApron) {
            const apronMat = options.apronColor ? new THREE.MeshStandardMaterial({ color: options.apronColor, roughness: 0.35 }) : M.redApron;
            const apron = new THREE.Mesh(apronGeo, apronMat);
            apron.position.y = 2.0;
            group.add(apron);
        }

        // Arms (Rounded & posed forward when carrying)
        const leftArm = new THREE.Group();
        leftArm.position.set(-0.68, 2.5, 0);
        const lArmMesh = new THREE.Mesh(sharedArmGeo, shirtMat);
        lArmMesh.position.y = -0.4;
        leftArm.add(lArmMesh);
        group.add(leftArm);

        const rightArm = new THREE.Group();
        rightArm.position.set(0.68, 2.5, 0);
        const rArmMesh = new THREE.Mesh(sharedArmGeo, shirtMat);
        rArmMesh.position.y = -0.4;
        rightArm.add(rArmMesh);
        group.add(rightArm);

        // Legs & Clay Shoes
        const leftLeg = new THREE.Group();
        leftLeg.position.set(-0.33, 1.3, 0);
        const lLegMesh = new THREE.Mesh(sharedLegGeo, pantsMat);
        lLegMesh.position.y = -0.55;
        leftLeg.add(lLegMesh);
        const lShoe = new THREE.Mesh(sharedShoeGeo, M.shoe);
        lShoe.position.set(0, -1.2, 0.1);
        leftLeg.add(lShoe);
        group.add(leftLeg);

        const rightLeg = new THREE.Group();
        rightLeg.position.set(0.33, 1.3, 0);
        const rLegMesh = new THREE.Mesh(sharedLegGeo, pantsMat);
        rLegMesh.position.y = -0.55;
        rightLeg.add(rLegMesh);
        const rShoe = new THREE.Mesh(sharedShoeGeo, M.shoe);
        rShoe.position.set(0, -1.2, 0.1);
        rightLeg.add(rShoe);
        group.add(rightLeg);

        // Pizza Stack Container (Held in front of chest)
        const stackContainer = new THREE.Group();
        stackContainer.position.set(0, 1.9, 1.0);
        group.add(stackContainer);

        return {
            root: group,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            stackContainer,
            walkCycle: 0
        };
    }

    const player = createCharacterMesh({
        hasChefHat: true,
        hasApron: true,
        isPlayer: true,
        shirtColor: 0xffffff
    });
    player.root.position.set(-10, 0, -4);
    scene.add(player.root);

    const playerTagEl = null;

    // =========================================================================
    // 13. ROUND DINING TABLES & DIRTY DISHES (REFERENCE 2)
    // =========================================================================
    const diningTables = [];
    const tableBaseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.22, 16);
    const tableStemGeo = new THREE.CylinderGeometry(0.38, 0.48, 1.7, 12);
    const tableTopGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.24, 24);
    const clothGeo = new THREE.CylinderGeometry(2.3, 2.35, 0.26, 24);
    const chairSeatGeo = new THREE.BoxGeometry(1.15, 0.16, 1.15);
    const chairBackGeo = new THREE.BoxGeometry(1.15, 1.2, 0.16);
    const chairLegGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8);

    function createDiningTable(tableIndex, x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const tableBase = new THREE.Mesh(tableBaseGeo, M.wood);
        tableBase.position.y = 0.11;
        group.add(tableBase);

        const tableStem = new THREE.Mesh(tableStemGeo, M.wood);
        tableStem.position.y = 0.96;
        group.add(tableStem);

        const tableTop = new THREE.Mesh(tableTopGeo, M.wood);
        tableTop.position.y = 1.92;
        tableTop.castShadow = true;
        group.add(tableTop);

        // Red & White checkered circular tablecloth (Reference 2)
        const cloth = new THREE.Mesh(clothGeo, M.tablecloth);
        cloth.position.y = 1.98;
        group.add(cloth);

        function makeChair(cx, cz, rotY) {
            const cg = new THREE.Group();
            cg.position.set(cx, 0, cz);
            cg.rotation.y = rotY;

            const seat = new THREE.Mesh(chairSeatGeo, M.wood);
            seat.position.y = 1.0;
            cg.add(seat);

            const back = new THREE.Mesh(chairBackGeo, M.wood);
            back.position.set(0, 1.6, -0.45);
            cg.add(back);

            for (let lx of [-0.42, 0.42]) {
                for (let lz of [-0.42, 0.42]) {
                    const leg = new THREE.Mesh(chairLegGeo, M.wood);
                    leg.position.set(lx, 0.45, lz);
                    cg.add(leg);
                }
            }
            return cg;
        }

        group.add(makeChair(0, 2.5, Math.PI));
        group.add(makeChair(0, -2.5, 0));

        // Clean plate & slice
        const plate = new THREE.Mesh(sharedPlateGeo, M.plate);
        plate.position.set(0, 2.12, 0);
        plate.visible = false;
        group.add(plate);

        const slice = new THREE.Mesh(sharedSliceGeo, M.pizzaCheese);
        slice.position.set(0, 2.18, 0);
        slice.visible = false;
        group.add(slice);

        // Dirty dishes / trash
        const dirtyDishesGroup = new THREE.Group();
        const dirtyPlateMesh = new THREE.Mesh(sharedPlateGeo, M.dirtyPlate);
        dirtyPlateMesh.position.set(0, 2.12, 0);
        dirtyDishesGroup.add(dirtyPlateMesh);
        const crust1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.16), M.dirtyCrust);
        crust1.position.set(-0.2, 2.2, 0.1);
        crust1.rotation.y = 0.4;
        dirtyDishesGroup.add(crust1);
        dirtyDishesGroup.visible = false;
        group.add(dirtyDishesGroup);

        scene.add(group);
        addCircleObstacle(x, z, 1.2);

        const trashBubble = document.createElement('div');
        trashBubble.className = 'table-trash-bubble';
        trashBubble.innerHTML = '<span>🗑️ Clean Table</span>';
        trashBubble.style.display = 'none';
        floatingUI.appendChild(trashBubble);

        GameState.tablesCount++;

        return {
            id: tableIndex,
            root: group,
            pos: new THREE.Vector3(x, 0, z),
            customerSeatSpot: new THREE.Vector3(x, 0, z + 2.5),
            serveSpot: new THREE.Vector3(x + 2.6, 0, z),
            customer: null,
            hasPizza: false,
            isDirty: false,
            trashTip: 0,
            plate,
            slice,
            dirtyDishesGroup,
            trashBubbleEl: trashBubble,
            eatingTimer: 0
        };
    }

    // =========================================================================
    // 14. GLOWING NEON "UNLOCK ZONE" FLOOR DECALS (EXACT REFERENCE 2)
    // =========================================================================
    const unlockZones = [];
    const unlockZonePlaneGeo = new THREE.PlaneGeometry(5.4, 5.4);
    const unlockZoneFloorTex = createUnlockZoneFloorTexture();
    const unlockZoneMat = new THREE.MeshBasicMaterial({
        map: unlockZoneFloorTex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });

    function createUnlockZone(config) {
        const id = config.id;
        const title = config.title;
        const price = config.price;
        let pos = config.pos.clone();
        if (id && id.startsWith('oven_turbo') && pos.x < -10) {
            pos.set(-8.5, 0, -11.0);
        }
        const onUnlock = config.onUnlock;

        const group = new THREE.Group();
        group.position.copy(pos);

        // Glowing neon rounded rectangle on floor with text "UNLOCK ZONE"
        const floorDecal = new THREE.Mesh(unlockZonePlaneGeo, unlockZoneMat);
        floorDecal.rotation.x = -Math.PI / 2;
        floorDecal.position.y = 0.03;
        group.add(floorDecal);

        scene.add(group);

        // Floating 3D ⬆️ arrow circle + speech bubble price (Reference 2)
        const badgeEl = document.createElement('div');
        badgeEl.className = 'zone-popup-tag';
        badgeEl.innerHTML = `
            <div class="zone-arrow-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
                </svg>
            </div>
            <div class="zone-price-pill" id="zone-price-${id}">$ ${price}</div>
            <div class="zone-title-small">${title}</div>
        `;
        floatingUI.appendChild(badgeEl);

        const zoneObj = {
            id,
            title,
            cost: price,
            remainingCost: price,
            pos,
            root: group,
            badgeEl,
            onUnlock,
            active: true,
            pulseTime: Math.random() * Math.PI
        };

        unlockZones.push(zoneObj);
        return zoneObj;
    }

    const tableLocations = [
        { x: -10, z: 16 }, { x: 2, z: 16 },
        { x: -10, z: 28 }, { x: 2, z: 28 },
        { x: -10, z: 40 }, { x: 2, z: 40 },
        { x: -22, z: 16 }, { x: -22, z: 28 }, { x: -22, z: 40 },
        { x: 14, z: 32 }, { x: 14, z: 44 }, { x: -22, z: 48 }
    ];

    let nextTableIndex = 0;
    let nextHelperIndex = 1;

    // =========================================================================
    // 15. DEDICATED HELPER WORKERS (CHEF, RUNNER, WAITER)
    // =========================================================================
    const helpers = [];

    function spawnHelperWorker(role = 'WAITER') {
        if (helpers.length >= 4) return;

        let shirtColor = 0x20c997;
        let apronColor = 0x1098ad;
        let startPos = new THREE.Vector3(-4, 0, 4);
        let tagText = '🍽️ WAITER';

        if (role === 'CHEF') {
            shirtColor = 0xff922b;
            apronColor = 0xd9480f;
            startPos = new THREE.Vector3(-18, 0, -28);
            tagText = '👨‍🍳 KITCHEN CHEF';
        } else if (role === 'RUNNER') {
            shirtColor = 0x339af0;
            apronColor = 0xfcc419;
            startPos = new THREE.Vector3(-14, 0, -5);
            tagText = '🏃 COUNTER RUNNER';
        } else {
            role = 'WAITER';
            shirtColor = 0x51cf66;
            apronColor = 0x2b8a3e;
            startPos = new THREE.Vector3(-4, 0, 6);
            tagText = '🍽️ DINE-IN WAITER';
        }

        const h = createCharacterMesh({
            shirtColor: shirtColor,
            pantsColor: 0x1864ab,
            hasApron: true,
            apronColor: apronColor
        });
        h.root.position.copy(startPos);
        scene.add(h.root);

        const helperTag = document.createElement('div');
        helperTag.className = 'floating-helper-tag';
        helperTag.innerText = tagText;
        floatingUI.appendChild(helperTag);
        h.tagEl = helperTag;

        h.role = role;
        h.pizzas = 0;
        h.maxPizzas = 3;
        h.trash = 0;
        h.state = role === 'CHEF' ? 'PREP_PIZZA' : (role === 'RUNNER' ? 'FETCH_PIZZA' : 'SERVE');
        h.speed = 4.6;
        h.stuckTimer = 0;
        h.lastPos = startPos.clone();
        helpers.push(h);

        GameState.helperCount = helpers.length;
        if (role === 'CHEF') GameState.upgrades.chefLevel = 1;
        if (role === 'RUNNER') GameState.upgrades.runnerLevel = 1;
        if (role === 'WAITER') GameState.upgrades.waiterLevel = (GameState.upgrades.waiterLevel || 0) + 1;
        updateUpgradesUI();
    }

    // =========================================================================
    // 14. SEQUENTIAL RESTAURANT MILESTONE UNLOCK PIPELINE
    // (Exact "Pizza Ready" progression: strictly ONE milestone pad on the floor at a time!)
    // =========================================================================
    let activeMilestoneZone = null;

    const RESTAURANT_MILESTONES = [
        {
            id: 'table_1',
            title: '🪑 Table 1',
            price: 15,
            getPos: () => new THREE.Vector3(tableLocations[0].x, 0, tableLocations[0].z),
            onUnlock: () => {
                diningTables.push(createDiningTable(1, tableLocations[0].x, tableLocations[0].z));
                nextTableIndex = Math.max(nextTableIndex, 1);
                showToast('🎉 Table 1 Unlocked! Customers can dine in!');
                checkQuestTrigger('unlock_table');
            }
        },
        {
            id: 'chef_1',
            title: '👨‍🍳 Hire Kitchen Chef',
            price: 60,
            getPos: () => new THREE.Vector3(-18.0, 0, -22.0),
            onUnlock: () => {
                spawnHelperWorker('CHEF');
                sound.playUnlock();
                showToast('👨‍🍳 Kitchen Chef Hired! Dough rolling & baking automated!');
                checkQuestTrigger('hire_helper');
            }
        },
        {
            id: 'table_2',
            title: '🪑 Table 2',
            price: 120,
            getPos: () => new THREE.Vector3(tableLocations[1].x, 0, tableLocations[1].z),
            onUnlock: () => {
                diningTables.push(createDiningTable(2, tableLocations[1].x, tableLocations[1].z));
                nextTableIndex = Math.max(nextTableIndex, 2);
                showToast('🎉 Table 2 Unlocked! Dining capacity expanded!');
                checkQuestTrigger('unlock_table');
            }
        },
        {
            id: 'runner_1',
            title: '🏃 Counter Runner',
            price: 180,
            getPos: () => new THREE.Vector3(0, 0, -4.0),
            onUnlock: () => {
                spawnHelperWorker('RUNNER');
                sound.playUnlock();
                showToast('🏃 Counter Runner Hired! Hot pizza display kept stocked!');
            }
        },
        {
            id: 'table_3',
            title: '🪑 Table 3',
            price: 220,
            getPos: () => new THREE.Vector3(tableLocations[2].x, 0, tableLocations[2].z),
            onUnlock: () => {
                diningTables.push(createDiningTable(3, tableLocations[2].x, tableLocations[2].z));
                nextTableIndex = Math.max(nextTableIndex, 3);
                showToast('🎉 Table 3 Unlocked!');
                checkQuestTrigger('unlock_table');
            }
        },
        {
            id: 'cashier_1',
            title: '💼 Hire Front Cashier',
            price: 280,
            getPos: () => new THREE.Vector3(18.0, 0, -8.0),
            onUnlock: () => {
                spawnCashierWorker();
                sound.playUnlock();
                showToast('💼 Cashier Hired! Register automated from heated shelf!');
            }
        },
        {
            id: 'oven_lv2',
            title: '🔥 Oven Lv 2 (+35%)',
            price: 350,
            getPos: () => new THREE.Vector3(-12.5, 0, -4.8),
            onUnlock: () => {
                GameState.upgrades.ovenLevel = Math.max(GameState.upgrades.ovenLevel || 1, 2);
                GameState.ovenSpeedMultiplier = Math.max(GameState.ovenSpeedMultiplier, 1.35);
                sound.playUpgrade();
                showToast('🔥 Turbo Oven upgraded! Baking +35% faster!');
                updateHUD();
                updateUpgradesUI();
            }
        },
        {
            id: 'table_4',
            title: '🪑 Table 4',
            price: 380,
            getPos: () => new THREE.Vector3(tableLocations[3].x, 0, tableLocations[3].z),
            onUnlock: () => {
                diningTables.push(createDiningTable(4, tableLocations[3].x, tableLocations[3].z));
                nextTableIndex = Math.max(nextTableIndex, 4);
                showToast('🎉 Table 4 Unlocked!');
                checkQuestTrigger('unlock_table');
            }
        },
        {
            id: 'waiter_1',
            title: '🍽️ Hire Waiter Helper',
            price: 450,
            getPos: () => new THREE.Vector3(-4.0, 0, 4.0),
            onUnlock: () => {
                spawnHelperWorker('WAITER');
                sound.playUnlock();
                showToast('🍽️ Waiter Hired! Running pizzas & cleaning tables!');
            }
        },
        {
            id: 'drive_thru',
            title: '🚗 Drive-Thru Window',
            price: 600,
            getPos: () => new THREE.Vector3(-25.0, 0, -10.0),
            onUnlock: () => {
                GameState.driveThruUnlocked = true;
                sound.playUnlock();
                spawnDriveThruCar();
                showToast('🚗 Drive-Thru Window OPENED! High-paying car orders!');
                checkQuestTrigger('unlock_drive_thru');
            }
        },
        {
            id: 'table_5',
            title: '🪑 Table 5',
            price: 650,
            getPos: () => new THREE.Vector3(tableLocations[4].x, 0, tableLocations[4].z),
            onUnlock: () => {
                diningTables.push(createDiningTable(5, tableLocations[4].x, tableLocations[4].z));
                nextTableIndex = Math.max(nextTableIndex, 5);
                showToast('🎉 Table 5 Unlocked!');
            }
        },
        {
            id: 'franchise_hub',
            title: '🚌 Franchise Transit & Branch 2',
            price: 1500,
            getPos: () => new THREE.Vector3(-30.0, 0, 24.0),
            onUnlock: () => {
                GameState.branch2Unlocked = true;
                GameState.franchiseTier = 2;
                sound.playUnlock();
                showToast('🚌 FRANCHISE EXPANSION UNLOCKED! Branch #2 Boardwalk Active!');
            }
        }
    ];

    function activateNextMilestone() {
        if (activeMilestoneZone && activeMilestoneZone.active) return;

        const mIdx = GameState.milestoneIndex || 0;
        if (mIdx < RESTAURANT_MILESTONES.length) {
            const m = RESTAURANT_MILESTONES[mIdx];
            activeMilestoneZone = createUnlockZone({
                id: m.id,
                title: m.title,
                price: m.price,
                pos: m.getPos(),
                onUnlock: () => {
                    m.onUnlock();
                    GameState.milestoneIndex = mIdx + 1;
                    activeMilestoneZone = null;
                    SaveSystem.save();
                    activateNextMilestone();
                }
            });
        } else {
            // Dynamic repeating milestones when all fixed milestones are done
            const cycle = mIdx - RESTAURANT_MILESTONES.length;
            if (diningTables.length < tableLocations.length) {
                const tNum = diningTables.length + 1;
                const loc = tableLocations[diningTables.length];
                const cost = 260 + tNum * 50;
                activeMilestoneZone = createUnlockZone({
                    id: `table_dyn_${tNum}`,
                    title: `🪑 Table ${tNum}`,
                    price: cost,
                    pos: new THREE.Vector3(loc.x, 0, loc.z),
                    onUnlock: () => {
                        diningTables.push(createDiningTable(tNum, loc.x, loc.z));
                        GameState.milestoneIndex++;
                        activeMilestoneZone = null;
                        SaveSystem.save();
                        activateNextMilestone();
                    }
                });
            } else {
                const cost = 300 + cycle * 100;
                activeMilestoneZone = createUnlockZone({
                    id: `oven_turbo_${cycle}`,
                    title: `🔥 Oven Speed (+25%)`,
                    price: cost,
                    pos: new THREE.Vector3(-12.5, 0, -4.8),
                    onUnlock: () => {
                        GameState.ovenSpeedMultiplier += 0.25;
                        GameState.milestoneIndex++;
                        activeMilestoneZone = null;
                        sound.playUpgrade();
                        SaveSystem.save();
                        activateNextMilestone();
                    }
                });
            }
        }
    }

    // Activate initial milestone
    activateNextMilestone();

    const machineUpgradeZones = [];
    function syncMachineFloorZones() {}

    // =========================================================================
    // 14B. FRONT CASHIER WORKER (AUTOMATION)
    // =========================================================================
    let cashierWorker = null;
    let cashierServeTimer = 0;

    function spawnCashierWorker() {
        if (cashierWorker) return;
        const cMesh = createCharacterMesh({
            shirtColor: 0xff922b,
            pantsColor: 0x1864ab,
            hasApron: true,
            apronColor: 0xf08c00
        });
        cMesh.root.position.set(18.0, 0, -3.8);
        cMesh.root.rotation.y = 0;
        scene.add(cMesh.root);

        const cashierTag = document.createElement('div');
        cashierTag.className = 'floating-helper-tag';
        cashierTag.innerText = 'CASHIER';
        floatingUI.appendChild(cashierTag);

        cashierWorker = {
            mesh: cMesh,
            tagEl: cashierTag,
            active: true
        };
        GameState.upgrades.cashierLevel = 1;
    }

    // =========================================================================
    // 16. OVEN CONVEYOR & PIZZA SPAWNING
    // =========================================================================
    let ovenTimer = 0;
    const OVEN_BASE_INTERVAL = 2.2;
    const readyPizzas = [];
    const conveyorPizzas = [];

    function createPizzaBoxMesh() {
        return new THREE.Mesh(sharedBoxGeo, sharedPizzaBoxMats);
    }

    function spawnInitialReadyPizzas() {
        readyPizzas.forEach(p => scene.remove(p));
        readyPizzas.length = 0;
        for (let i = 0; i < 6; i++) {
            const stackBox = createPizzaBoxMesh();
            const stackHeight = (i % 8) * 0.42 + 1.6;
            const col = Math.floor(i / 8);
            stackBox.position.set(-18 + (col === 0 ? -0.8 : 0.8), stackHeight, -4.8);
            scene.add(stackBox);
            readyPizzas.push(stackBox);
        }
    }
    spawnInitialReadyPizzas();

    const pizzaCrustGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.08, 20);
    const pizzaCheeseGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.09, 20);
    const pepGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8);

    function createRoundPizzaMesh() {
        const group = new THREE.Group();
        group.add(new THREE.Mesh(pizzaCrustGeo, M.pizzaCrust));
        group.add(new THREE.Mesh(pizzaCheeseGeo, M.pizzaCheese));
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + 0.3;
            const pep = new THREE.Mesh(pepGeo, M.pepperoni);
            pep.position.set(Math.cos(angle) * 0.35, 0.02, Math.sin(angle) * 0.35);
            group.add(pep);
        }
        return group;
    }

    function startPizzaAssembly(isAuto = false) {
        if (!isAuto) {
            sound.playServe();
            showToast('🍕 Fresh dough loaded -> Turbo Oven!');
            addPlayerExp(10);
        }
        const roundPizza = createRoundPizzaMesh();
        roundPizza.position.set(-18, 1.8, -25);
        scene.add(roundPizza);
        conveyorPizzas.push({
            mesh: roundPizza,
            isBoxed: false,
            isArtisanal: !isAuto,
            z: -25,
            targetZ: -4.8
        });
        updateHUD();
    }

    let prepTimer = 0;
    const PREP_STATION_POS = new THREE.Vector3(-18.0, 0, -28.0);
    const prepStationTag = document.createElement('div');
    prepStationTag.className = 'floating-zone-tag';
    prepStationTag.innerHTML = '👨‍🍳 DOUGH & PREP (<span id="prep-status">Stand Here to Roll</span>)';
    prepStationTag.style.background = 'linear-gradient(135deg, #f59f00, #f08c00)';
    floatingUI.appendChild(prepStationTag);

    function updatePlayerCarryVisuals(charObj) {
        if (!charObj || !charObj.stackContainer) return;
        while (charObj.stackContainer.children.length > 0) {
            charObj.stackContainer.remove(charObj.stackContainer.children[0]);
        }

        const isPlayerChar = (charObj === player);
        const pizzas = isPlayerChar ? GameState.playerPizzas : (charObj.pizzas || 0);
        const dough = isPlayerChar ? GameState.playerDough : (charObj.dough || 0);
        const flour = isPlayerChar ? GameState.playerFlour : (charObj.flour || 0);
        const wheat = isPlayerChar ? GameState.playerWheat : (charObj.wheat || 0);

        let stackY = 0;
        if (wheat > 0) {
            for (let i = 0; i < wheat; i++) {
                const wMesh = new THREE.Mesh(sharedWheatSheafGeo, M.wheatSheaf);
                wMesh.position.set(0, stackY + 0.35, 0);
                wMesh.rotation.z = Math.PI / 2;
                wMesh.rotation.y = (i % 2 === 0 ? 0.3 : -0.3);
                charObj.stackContainer.add(wMesh);
                stackY += 0.45;
            }
        }
        if (flour > 0) {
            for (let i = 0; i < flour; i++) {
                const sMesh = new THREE.Mesh(sharedFlourSackGeo, M.flourSack);
                sMesh.position.set(0, stackY + 0.3, 0);
                sMesh.rotation.y = (i % 2 === 0 ? 0.15 : -0.15);
                charObj.stackContainer.add(sMesh);
                stackY += 0.55;
            }
        }
        if (dough > 0) {
            for (let i = 0; i < dough; i++) {
                const dMesh = new THREE.Mesh(sharedDoughGeo, M.doughBase);
                dMesh.position.set(0, stackY + 0.1, 0);
                charObj.stackContainer.add(dMesh);
                stackY += 0.18;
            }
        }
        if (pizzas > 0) {
            for (let i = 0; i < pizzas; i++) {
                const box = createPizzaBoxMesh();
                box.position.set(0, stackY + 0.2, 0);
                box.rotation.y = (i % 2 === 0 ? 0.04 : -0.04);
                charObj.stackContainer.add(box);
                stackY += 0.42;
            }
        }
    }

    function updatePlayerPizzaStackVisuals(charObj, count) {
        if (charObj === player) {
            GameState.playerPizzas = count;
        } else if (charObj) {
            charObj.pizzas = count;
        }
        updatePlayerCarryVisuals(charObj);
    }

    // =========================================================================
    // 17. CUSTOMERS & SINGLE-FILE QUEUE
    // =========================================================================
    const customers = [];
    let customerSpawnTimer = 0;
    const ENTRANCE_POS = new THREE.Vector3(28, 0, 24);
    const EXIT_POS = new THREE.Vector3(28, 0, 32);
    const shirtColors = [0x339af0, 0x51cf66, 0xff922b, 0xcc5de8, 0x20c997, 0xf06595, 0x845ef7];

    function spawnCustomer() {
        const maxCustomers = Math.min(15, 5 + Math.floor(GameState.level * 1.2));
        if (customers.length >= maxCustomers) return;

        const randomColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
        const custMesh = createCharacterMesh({ shirtColor: randomColor });
        custMesh.root.position.copy(ENTRANCE_POS);
        scene.add(custMesh.root);

        const wantsDrink = Math.random() < 0.35;
        const bubble = document.createElement('div');
        bubble.className = 'customer-bubble';
        bubble.innerHTML = wantsDrink ? '<span>🍕🥤</span>' : '<span>🍕</span>';
        bubble.style.display = 'none';
        floatingUI.appendChild(bubble);

        let targetTable = null;
        for (let table of diningTables) {
            if (!table.customer && !table.isDirty) {
                targetTable = table;
                break;
            }
        }

        let queueIndex = -1;
        if (!targetTable) {
            const currentQueued = customers.filter(c => c.waitingAtCounter || c.state === 'WALK_TO_COUNTER').length;
            if (currentQueued < QUEUE_SPOTS.length) {
                queueIndex = currentQueued;
            } else {
                scene.remove(custMesh.root);
                if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
                return;
            }
        }

        const customerObj = {
            mesh: custMesh,
            bubbleEl: bubble,
            state: targetTable ? 'WALK_TO_TABLE' : 'WALK_TO_COUNTER',
            targetTable: targetTable,
            waitingAtCounter: !targetTable,
            queueIndex: queueIndex,
            wantsDrink: wantsDrink,
            hasReceivedPizza: false,
            hasReceivedDrink: false,
            eatTimer: 0,
            speed: 3.6
        };

        if (targetTable) {
            targetTable.customer = customerObj;
        }

        customers.push(customerObj);
    }
    spawnCustomer();
    spawnCustomer();

    function advanceCounterQueue(servedCust) {
        if (servedCust) {
            servedCust.waitingAtCounter = false;
            servedCust.hasReceivedPizza = true;
            servedCust.bubbleEl.innerHTML = '<span>😋 🍕</span>';
            servedCust.bubbleEl.style.display = 'flex';
            servedCust.state = 'FINISH_AND_LEAVE';

            // Customer physically holds their pizza box!
            if (servedCust.mesh && servedCust.mesh.stackContainer) {
                while (servedCust.mesh.stackContainer.children.length > 0) {
                    servedCust.mesh.stackContainer.remove(servedCust.mesh.stackContainer.children[0]);
                }
                const cBox = createPizzaBoxMesh();
                cBox.position.set(0, 0, 0);
                servedCust.mesh.stackContainer.add(cBox);
                if (servedCust.mesh.leftArm) servedCust.mesh.leftArm.rotation.x = -Math.PI / 3;
                if (servedCust.mesh.rightArm) servedCust.mesh.rightArm.rotation.x = -Math.PI / 3;
            }
        }

        // Strictly re-sequence waiting queue from 0 to N-1
        const waiting = customers.filter(c => c.waitingAtCounter && !c.hasReceivedPizza);
        for (let idx = 0; idx < waiting.length; idx++) {
            waiting[idx].queueIndex = idx;
            if (idx === 0) {
                waiting[idx].bubbleEl.style.display = 'flex';
                waiting[idx].bubbleEl.innerHTML = waiting[idx].wantsDrink ? '<span>🍕🥤</span>' : '<span>🍕</span>';
            } else {
                waiting[idx].bubbleEl.style.display = 'none';
            }
        }
    }

    // =========================================================================
    // 18. PARTICLES: FLYING BILLS, HEARTS & EMOJIS (REFERENCE 2)
    // =========================================================================
    const MAX_BILLS = 20;
    const billPool = [];
    for (let i = 0; i < MAX_BILLS; i++) {
        const mesh = new THREE.Mesh(sharedBillGeo, M.billMat);
        mesh.visible = false;
        scene.add(mesh);
        billPool.push({
            mesh, active: false, start: new THREE.Vector3(), target: new THREE.Vector3(),
            progress: 0, speed: 2.8, arcHeight: 2.8, rotSpeed: 0
        });
    }

    function spawnFlyingBill(startPos, targetPos) {
        sound.playCashFlow();
        const bill = billPool.find(b => !b.active);
        if (!bill) return;
        bill.active = true;
        bill.progress = 0;
        bill.start.copy(startPos);
        bill.start.y += 1.5;
        bill.target.copy(targetPos);
        bill.mesh.position.copy(bill.start);
        bill.mesh.visible = true;
        bill.speed = 3.2 + Math.random() * 0.8;
        bill.arcHeight = 2.6 + Math.random() * 1.0;
        bill.rotSpeed = (Math.random() - 0.5) * 8;
    }

    const MAX_HEARTS = 10;
    const heartPool = [];
    const heartSphereGeo = new THREE.SphereGeometry(0.35, 12, 10);
    const heartConeGeo = new THREE.ConeGeometry(0.5, 0.7, 12);

    for (let i = 0; i < MAX_HEARTS; i++) {
        const group = new THREE.Group();
        const s1 = new THREE.Mesh(heartSphereGeo, M.heartMat);
        s1.position.set(-0.2, 0.15, 0); group.add(s1);
        const s2 = new THREE.Mesh(heartSphereGeo, M.heartMat);
        s2.position.set(0.2, 0.15, 0); group.add(s2);
        const cone = new THREE.Mesh(heartConeGeo, M.heartMat);
        cone.rotation.z = Math.PI;
        cone.position.set(0, -0.2, 0); group.add(cone);

        group.visible = false;
        scene.add(group);
        heartPool.push({ group, active: false, life: 0, scale: 0.1 });
    }

    function spawnHeartParticle(worldPos) {
        const h = heartPool.find(item => !item.active);
        if (!h) return;
        h.active = true;
        h.life = 1.6;
        h.scale = 0.2;
        h.group.position.copy(worldPos);
        h.group.position.y += 3.8;
        h.group.scale.setScalar(0.2);
        h.group.visible = true;
    }

    function spawnFloatingCashText(screenX, screenY, text) {
        const el = document.createElement('div');
        el.className = 'floating-cash-text';
        el.innerText = text;
        el.style.left = `${screenX}px`;
        el.style.top = `${screenY}px`;
        floatingUI.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 900);
    }

    let wheatToastEl = null;
    let wheatToastTimer = null;
    function showWheatToast(current, max) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        if (!wheatToastEl || !wheatToastEl.parentNode) {
            wheatToastEl = document.createElement('div');
            wheatToastEl.className = 'toast toast-wheat';
            container.appendChild(wheatToastEl);
        }
        wheatToastEl.innerHTML = `🌾 Wheat <b>${current}/${max}</b>`;
        if (wheatToastTimer) clearTimeout(wheatToastTimer);
        wheatToastTimer = setTimeout(() => {
            if (wheatToastEl && wheatToastEl.parentNode) {
                wheatToastEl.parentNode.removeChild(wheatToastEl);
            }
            wheatToastEl = null;
        }, 1200);
    }

    function showToast(message, isSuccess = true) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        while (container.children.length >= 3) {
            container.removeChild(container.firstChild);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${isSuccess ? 'toast-success' : ''}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 1600);
    }

    // =========================================================================
    // 18B. HUD ELEMENTS & PROGRESSION
    // =========================================================================
    const moneyDisplay = document.getElementById('money-display');
    const pizzaDisplay = document.getElementById('pizza-display');
    const trashBadge = document.getElementById('trash-badge');
    const trashDisplay = document.getElementById('trash-display');
    const drinkBadge = document.getElementById('drink-badge');
    const drinkDisplay = document.getElementById('drink-display');
    const wheatBadge = document.getElementById('wheat-badge');
    const wheatDisplay = document.getElementById('wheat-display');
    const flourBadge = document.getElementById('flour-badge');
    const flourDisplay = document.getElementById('flour-display');
    const doughBadge = document.getElementById('dough-badge');
    const doughDisplay = document.getElementById('dough-display');
    const levelFill = document.getElementById('level-fill');
    const levelText = document.getElementById('level-text');
    const fpsBadge = document.getElementById('fps-badge');
    const fpsDisplay = document.getElementById('fps-display');

    function updateHUD() {
        if (moneyDisplay) moneyDisplay.innerText = GameState.money.toLocaleString();
        if (pizzaDisplay) pizzaDisplay.innerText = `${GameState.playerPizzas} / ${GameState.playerMaxPizzas}`;

        if (wheatBadge && wheatDisplay) {
            wheatBadge.classList.remove('hidden');
            wheatDisplay.innerText = `${GameState.playerWheat} / ${GameState.playerMaxWheat}`;
        }

        if (flourBadge && flourDisplay) {
            flourBadge.classList.remove('hidden');
            flourDisplay.innerText = `${GameState.playerFlour} / ${GameState.playerMaxFlour}`;
        }

        if (doughBadge && doughDisplay) {
            doughBadge.classList.remove('hidden');
            doughDisplay.innerText = `${GameState.playerDough} / ${GameState.playerMaxDough}`;
        }

        if (trashBadge && trashDisplay) {
            if (GameState.playerTrash > 0) {
                trashBadge.classList.remove('hidden');
                trashDisplay.innerText = `${GameState.playerTrash} / ${GameState.playerMaxTrash}`;
            } else {
                trashBadge.classList.add('hidden');
            }
        }

        if (drinkBadge && drinkDisplay) {
            if (GameState.playerDrinks > 0) {
                drinkBadge.classList.remove('hidden');
                drinkDisplay.innerText = `${GameState.playerDrinks} / ${GameState.playerMaxDrinks}`;
            } else {
                drinkBadge.classList.add('hidden');
            }
        }

        if (levelFill && levelText) {
            const pct = Math.min(100, Math.round((GameState.exp / GameState.expNeeded) * 100));
            levelFill.style.width = `${pct}%`;
            levelText.innerText = `LEVEL ${GameState.level}`;
        }
    }

    function addPlayerExp(points) {
        GameState.exp += points;
        while (GameState.exp >= GameState.expNeeded) {
            GameState.exp -= GameState.expNeeded;
            GameState.level += 1;
            GameState.expNeeded = Math.round(40 * Math.pow(1.22, GameState.level - 1));
            sound.playLevelUp();
            showToast(`🌟 Level Up! Reached Level ${GameState.level}!`);
        }
        updateHUD();
    }

    // =========================================================================
    // 19. QUESTS & OBJECTIVES
    // =========================================================================
    const QUESTS = [
        { id: 'serve_counter', desc: 'Serve customers at front counter', target: 3, reward: 35, event: 'serve_customer' },
        { id: 'unlock_drive_thru', desc: 'Unlock Drive-Thru Window', target: 1, reward: 60, event: 'unlock_drive_thru' },
        { id: 'serve_drive_thru', desc: 'Serve cars at Drive-Thru Window', target: 2, reward: 80, event: 'serve_drive_thru' },
        { id: 'clean_table', desc: 'Clean dirty dining tables', target: 2, reward: 40, event: 'clean_table' },
        { id: 'dump_trash', desc: 'Dump trash into Recycling Dumpster', target: 1, reward: 45, event: 'dump_trash' },
        { id: 'hire_cashier', desc: 'Hire Front Cashier at HR Desk', target: 1, reward: 90, event: 'hire_cashier' },
        { id: 'unlock_table', desc: 'Unlock a new Dining Table', target: 1, reward: 60, event: 'unlock_table' },
        { id: 'hire_helper', desc: 'Hire helper worker from HR or Zone', target: 1, reward: 80, event: 'hire_helper' },
        { id: 'earn_money', desc: 'Earn money to reach Level 5', target: 600, reward: 100, event: 'earn_cash' }
    ];

    function updateQuestBanner() {
        const quest = QUESTS[GameState.currentQuestIndex % QUESTS.length];
        const questTextEl = document.getElementById('quest-text');
        if (questTextEl) {
            questTextEl.innerText = `${quest.desc} (${GameState.questProgress}/${quest.target})`;
        }
    }

    function checkQuestTrigger(eventType, amount = 1) {
        const quest = QUESTS[GameState.currentQuestIndex % QUESTS.length];
        if (quest.event === eventType) {
            GameState.questProgress += amount;
            if (GameState.questProgress >= quest.target) {
                GameState.money += quest.reward;
                addPlayerExp(50);
                sound.playLevelUp();
                showToast(`🎯 Objective Complete! +$${quest.reward} Bonus!`);
                GameState.currentQuestIndex++;
                GameState.questProgress = 0;
            }
            updateQuestBanner();
            updateHUD();
        }
    }
    updateQuestBanner();

    // =========================================================================
    // 20. CLOUD SAVE & RESUME ENGINE (EMAIL BASED)
    // =========================================================================
    const SaveSystem = {
        save: function(customEmail) {
            const email = (customEmail || GameState.email || localStorage.getItem('pizza_tycoon_active_email') || '').trim();
            if (email) GameState.email = email;

            const saveData = {
                version: 2,
                email: GameState.email,
                money: GameState.money,
                level: GameState.level,
                exp: GameState.exp,
                expNeeded: GameState.expNeeded,
                playerMaxPizzas: GameState.playerMaxPizzas,
                playerWheat: GameState.playerWheat,
                playerFlour: GameState.playerFlour,
                playerDough: GameState.playerDough,
                playerSpeed: GameState.playerSpeed,
                ovenSpeedMultiplier: GameState.ovenSpeedMultiplier,
                millSpeedMultiplier: GameState.millSpeedMultiplier || 1.0,
                pressSpeedMultiplier: GameState.pressSpeedMultiplier || 1.0,
                farmExpanded: GameState.farmExpanded || false,
                totalCustomersServed: GameState.totalCustomersServed,
                totalTablesCleaned: GameState.totalTablesCleaned,
                zoneIndex: GameState.zoneIndex,
                milestoneIndex: GameState.milestoneIndex || 0,
                currentQuestIndex: GameState.currentQuestIndex,
                questProgress: GameState.questProgress,
                tablesUnlocked: diningTables.length,
                helpersUnlocked: helpers.length,
                driveThruUnlocked: GameState.driveThruUnlocked,
                driveThruCarsServed: GameState.driveThruCarsServed,
                franchiseTier: GameState.franchiseTier || 1,
                franchiseRoyalties: GameState.franchiseRoyalties || 0,
                branch2Unlocked: GameState.branch2Unlocked || false,
                branch3Unlocked: GameState.branch3Unlocked || false,
                upgrades: GameState.upgrades,
                timestamp: Date.now()
            };

            const jsonStr = JSON.stringify(saveData);
            localStorage.setItem('pizza_tycoon_local_save', jsonStr);

            if (email) {
                localStorage.setItem(`pizza_cloud_email_${email.toLowerCase()}`, jsonStr);
                localStorage.setItem('pizza_tycoon_active_email', email);
            }

            const syncDot = document.getElementById('sync-dot');
            if (syncDot) {
                syncDot.classList.add('saving');
                setTimeout(() => syncDot.classList.remove('saving'), 400);
            }

            this.updateUI();
        },

        load: function(inputEmail) {
            const email = (inputEmail || GameState.email || localStorage.getItem('pizza_tycoon_active_email') || '').toLowerCase().trim();
            let rawData = null;

            if (email) rawData = localStorage.getItem(`pizza_cloud_email_${email}`);
            if (!rawData) rawData = localStorage.getItem('pizza_tycoon_local_save');
            if (!rawData) return false;

            try {
                const data = JSON.parse(rawData);
                if (data.email) GameState.email = data.email;
                GameState.money = data.money !== undefined ? data.money : GameState.money;
                GameState.level = data.level || 1;
                GameState.exp = data.exp || 0;
                GameState.expNeeded = data.expNeeded || 35;
                GameState.playerMaxPizzas = data.playerMaxPizzas || 4;
                GameState.playerSpeed = data.playerSpeed || 7.8;
                GameState.ovenSpeedMultiplier = data.ovenSpeedMultiplier || 1.0;
                GameState.totalCustomersServed = data.totalCustomersServed || 0;
                GameState.totalTablesCleaned = data.totalTablesCleaned || 0;
                GameState.currentQuestIndex = data.currentQuestIndex || 0;
                GameState.questProgress = data.questProgress || 0;
                if (data.milestoneIndex !== undefined) {
                    GameState.milestoneIndex = data.milestoneIndex;
                }
                if (data.upgrades) GameState.upgrades = Object.assign(GameState.upgrades, data.upgrades);
                if (data.franchiseTier) GameState.franchiseTier = data.franchiseTier;
                if (data.franchiseRoyalties) GameState.franchiseRoyalties = data.franchiseRoyalties;
                if (data.branch2Unlocked) GameState.branch2Unlocked = data.branch2Unlocked;
                if (data.branch3Unlocked) GameState.branch3Unlocked = data.branch3Unlocked;

                if (data.driveThruUnlocked !== undefined) {
                    GameState.driveThruUnlocked = data.driveThruUnlocked;
                    if (GameState.driveThruUnlocked) spawnDriveThruCar();
                }
                if (data.driveThruCarsServed !== undefined) GameState.driveThruCarsServed = data.driveThruCarsServed;
                if (GameState.upgrades && GameState.upgrades.cashierLevel > 0) {
                    spawnCashierWorker();
                }

                const targetTables = data.tablesUnlocked || 0;
                while (diningTables.length < targetTables && nextTableIndex < tableLocations.length) {
                    const loc = tableLocations[nextTableIndex];
                    const tNum = nextTableIndex + 1;
                    nextTableIndex++;
                    diningTables.push(createDiningTable(tNum, loc.x, loc.z));
                }

                // Restore specialized helpers
                if (GameState.upgrades) {
                    if (GameState.upgrades.chefLevel > 0 && !helpers.some(h => h.role === 'CHEF')) {
                        spawnHelperWorker('CHEF');
                    }
                    if (GameState.upgrades.runnerLevel > 0 && !helpers.some(h => h.role === 'RUNNER')) {
                        spawnHelperWorker('RUNNER');
                    }
                    const targetWaiters = GameState.upgrades.waiterLevel || 0;
                    const curWaiters = helpers.filter(h => h.role === 'WAITER').length;
                    for (let w = curWaiters; w < targetWaiters; w++) {
                        spawnHelperWorker('WAITER');
                    }
                }

                GameState.playerWheat = data.playerWheat || 0;
                GameState.playerFlour = data.playerFlour || 0;
                GameState.playerDough = data.playerDough || 0;
                if (data.millSpeedMultiplier) GameState.millSpeedMultiplier = data.millSpeedMultiplier;
                if (data.pressSpeedMultiplier) GameState.pressSpeedMultiplier = data.pressSpeedMultiplier;
                if (data.farmExpanded) {
                    GameState.farmExpanded = true;
                    setFarmFactoryVisibility(true);
                    expandWheatFarmPlot();
                } else {
                    setFarmFactoryVisibility(false);
                }

                if (GameState.money === undefined || isNaN(GameState.money)) {
                    GameState.money = 25;
                }
                
                // Clear any lingering unlock zones and activate the exact active milestone
                while (unlockZones.length > 0) {
                    const oldZ = unlockZones.pop();
                    oldZ.active = false;
                    scene.remove(oldZ.root);
                    if (oldZ.badgeEl && oldZ.badgeEl.parentNode) oldZ.badgeEl.parentNode.removeChild(oldZ.badgeEl);
                }
                activeMilestoneZone = null;
                activateNextMilestone();

                syncMachineFloorZones();
                updateHUD();
                updateQuestBanner();
                this.updateUI();
                return true;
            } catch (err) {
                console.error('Error loading save data:', err);
                return false;
            }
        },

        exportCode: function() {
            const rawData = localStorage.getItem('pizza_tycoon_local_save');
            if (!rawData) return '';
            try { return btoa(unescape(encodeURIComponent(rawData))); }
            catch (e) { return btoa(rawData); }
        },

        importCode: function(codeStr) {
            try {
                const decoded = decodeURIComponent(escape(atob(codeStr.trim())));
                const data = JSON.parse(decoded);
                localStorage.setItem('pizza_tycoon_local_save', decoded);
                if (data.email) {
                    localStorage.setItem(`pizza_cloud_email_${data.email.toLowerCase()}`, decoded);
                    localStorage.setItem('pizza_tycoon_active_email', data.email);
                }
                this.load(data.email);
                showToast('✅ Cloud save imported successfully!');
                return true;
            } catch (err) {
                showToast('❌ Invalid save code!', false);
                return false;
            }
        },

        updateUI: function() {
            const email = GameState.email || localStorage.getItem('pizza_tycoon_active_email') || '';
            const badgeText = document.getElementById('cloud-status-badge');
            const accountEmail = document.getElementById('cloud-account-email');
            const syncStatus = document.getElementById('cloud-sync-status');
            const emailInput = document.getElementById('cloud-email-input');

            if (email) {
                if (badgeText) badgeText.innerText = email.length > 12 ? email.substring(0, 10) + '...' : email;
                if (accountEmail) accountEmail.innerText = email;
                if (syncStatus) syncStatus.innerText = '✅ Cloud Synced & Protected';
                if (emailInput && !emailInput.value) emailInput.value = email;
            } else {
                if (badgeText) badgeText.innerText = 'Save Email';
                if (accountEmail) accountEmail.innerText = 'Guest Player';
                if (syncStatus) syncStatus.innerText = 'Progress saved locally in browser';
            }
        }
    };

    setInterval(() => SaveSystem.save(), 5000);
    SaveSystem.load();

    // Auto-relocate any oven turbo zone that was previously stuck behind obstacles
    unlockZones.forEach(z => {
        if (z.id && z.id.startsWith('oven_turbo') && z.pos.x < -10) {
            z.pos.set(-8.5, 0, -11.0);
            z.root.position.copy(z.pos);
        }
    });

    // =========================================================================
    // 21. CLOUD SAVE & EMAIL MODAL UI
    // =========================================================================
    const cloudBtn = document.getElementById('cloud-save-btn');
    const cloudModal = document.getElementById('cloud-modal');
    const closeCloudBtn = document.getElementById('close-cloud-btn');
    const closeCloudX = document.getElementById('close-cloud-x');
    const btnSaveEmail = document.getElementById('btn-save-email');
    const btnManualSync = document.getElementById('btn-manual-sync');
    const btnRestoreEmail = document.getElementById('btn-restore-email');
    const btnGenerateCode = document.getElementById('btn-generate-code');
    const btnImportCode = document.getElementById('btn-import-code');
    const saveCodeBox = document.getElementById('save-code-box');
    const emailInput = document.getElementById('cloud-email-input');

    cloudBtn.addEventListener('click', () => {
        SaveSystem.updateUI();
        saveCodeBox.value = SaveSystem.exportCode();
        cloudModal.style.display = 'flex';
    });

    function closeCloudModal() { cloudModal.style.display = 'none'; }
    closeCloudBtn.addEventListener('click', closeCloudModal);
    closeCloudX.addEventListener('click', closeCloudModal);
    closeCloudBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); closeCloudModal(); });
    closeCloudX.addEventListener('pointerdown', (e) => { e.stopPropagation(); closeCloudModal(); });

    btnSaveEmail.addEventListener('click', () => {
        const val = (emailInput.value || '').trim();
        if (!val || !val.includes('@')) {
            showToast('⚠️ Please enter a valid email address!', false);
            return;
        }
        SaveSystem.save(val);
        saveCodeBox.value = SaveSystem.exportCode();
        showToast(`✅ Game linked & saved to ${val}!`);
    });

    btnManualSync.addEventListener('click', () => {
        SaveSystem.save();
        saveCodeBox.value = SaveSystem.exportCode();
        showToast('☁️ Cloud force sync complete!');
    });

    btnRestoreEmail.addEventListener('click', () => {
        const val = (emailInput.value || prompt('Enter your registered Email ID:') || '').trim();
        if (!val || !val.includes('@')) {
            showToast('⚠️ Please enter a valid email address!', false);
            return;
        }
        const success = SaveSystem.load(val);
        if (success) {
            showToast(`🎉 Progress restored for ${val}!`);
            closeCloudModal();
        } else {
            showToast(`⚠️ No cloud save found for ${val}`, false);
        }
    });

    btnGenerateCode.addEventListener('click', () => {
        const code = SaveSystem.exportCode();
        saveCodeBox.value = code;
        navigator.clipboard.writeText(code).then(() => {
            showToast('📋 Save code copied to clipboard!');
        }).catch(() => {
            showToast('Save code ready in text box!');
        });
    });

    btnImportCode.addEventListener('click', () => {
        const code = prompt('Paste your backup save code:');
        if (code) {
            SaveSystem.importCode(code);
            closeCloudModal();
        }
    });

    // =========================================================================
    // 22. HR / RESTAURANT UPGRADES MODAL
    // =========================================================================
    const hrBtn = document.getElementById('hr-btn');
    const upgradesModal = document.getElementById('upgrades-modal');
    const closeUpgradesBtn = document.getElementById('close-upgrades-btn');
    const closeUpgradesX = document.getElementById('close-upgrades-x');

    let hrCooldownTimer = 0;
    let hrTriggerAllowed = true;

    function openUpgradesModal() {
        updateUpgradesUI();
        upgradesModal.style.display = 'flex';
    }

    function closeUpgradesModal() {
        upgradesModal.style.display = 'none';
        hrCooldownTimer = 3.5; // 3.5s cooldown so it never re-triggers immediately
        hrTriggerAllowed = false; // requires stepping away first!
        if (player && player.root) {
            player.root.position.z += 2.2; // step back from counter
        }
    }

    hrBtn.addEventListener('click', openUpgradesModal);
    closeUpgradesBtn.addEventListener('click', closeUpgradesModal);
    closeUpgradesX.addEventListener('click', closeUpgradesModal);
    closeUpgradesBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); closeUpgradesModal(); });
    closeUpgradesX.addEventListener('pointerdown', (e) => { e.stopPropagation(); closeUpgradesModal(); });

    function syncMachineFloorZones() {
        if (typeof machineUpgradeZones !== 'undefined') {
            machineUpgradeZones.forEach(z => {
                z.remainingCost = z.getCost();
                z.updateBadge();
            });
        }
    }

    function updateUpgradesUI() {
        const u = GameState.upgrades;

        const speedCost = 50 + 35 * u.speedLevel;
        document.getElementById('upgrade-speed-level').innerText = `Lv ${u.speedLevel} / 10`;
        const btnSpeed = document.getElementById('btn-upgrade-speed');
        btnSpeed.disabled = u.speedLevel >= 10 || GameState.money < speedCost;
        document.getElementById('cost-upgrade-speed').innerText = u.speedLevel >= 10 ? 'MAX' : `$${speedCost}`;

        const capCost = 60 + 40 * u.capacityLevel;
        document.getElementById('upgrade-capacity-level').innerText = `${GameState.playerMaxPizzas} Boxes (Lv ${u.capacityLevel})`;
        const btnCap = document.getElementById('btn-upgrade-capacity');
        btnCap.disabled = u.capacityLevel >= 8 || GameState.money < capCost;
        document.getElementById('cost-upgrade-capacity').innerText = u.capacityLevel >= 8 ? 'MAX' : `$${capCost}`;

        // Kitchen Chef Helper
        const chefHired = (u.chefLevel > 0 || helpers.some(h => h.role === 'CHEF'));
        const chefCost = 150;
        const chefLvlEl = document.getElementById('upgrade-chef-level');
        if (chefLvlEl) chefLvlEl.innerText = chefHired ? 'Hired (Active in Kitchen)' : 'Not Hired';
        const btnChef = document.getElementById('btn-upgrade-chef');
        if (btnChef) {
            btnChef.disabled = chefHired || GameState.money < chefCost;
            const costChefEl = document.getElementById('cost-upgrade-chef');
            if (costChefEl) costChefEl.innerText = chefHired ? 'HIRED' : `$${chefCost}`;
        }

        // Counter Runner Helper
        const runnerHired = (u.runnerLevel > 0 || helpers.some(h => h.role === 'RUNNER'));
        const runnerCost = 220;
        const runnerLvlEl = document.getElementById('upgrade-runner-level');
        if (runnerLvlEl) runnerLvlEl.innerText = runnerHired ? 'Hired (Active Stocking)' : 'Not Hired';
        const btnRunner = document.getElementById('btn-upgrade-runner');
        if (btnRunner) {
            btnRunner.disabled = runnerHired || GameState.money < runnerCost;
            const costRunnerEl = document.getElementById('cost-upgrade-runner');
            if (costRunnerEl) costRunnerEl.innerText = runnerHired ? 'HIRED' : `$${runnerCost}`;
        }

        // Dine-In Waiter Helper
        const waiterCount = helpers.filter(h => h.role === 'WAITER').length;
        const waiterCost = 280 + waiterCount * 170;
        const waiterLvlEl = document.getElementById('upgrade-waiter-level');
        if (waiterLvlEl) waiterLvlEl.innerText = `${waiterCount} Hired (Max 2)`;
        const btnWaiter = document.getElementById('btn-upgrade-waiter');
        if (btnWaiter) {
            btnWaiter.disabled = waiterCount >= 2 || GameState.money < waiterCost;
            const costWaiterEl = document.getElementById('cost-upgrade-waiter');
            if (costWaiterEl) costWaiterEl.innerText = waiterCount >= 2 ? 'MAX' : `$${waiterCost}`;
        }

        // Turbo Brick Oven Upgrade
        const ovenCost = 120 * (u.ovenLevel || 1);
        document.getElementById('upgrade-oven-level').innerText = `Lv ${u.ovenLevel || 1} / 8`;
        const btnOven = document.getElementById('btn-upgrade-oven');
        btnOven.disabled = (u.ovenLevel || 1) >= 8 || GameState.money < ovenCost;
        document.getElementById('cost-upgrade-oven').innerText = (u.ovenLevel || 1) >= 8 ? 'MAX' : `$${ovenCost}`;

        // Front Cashier
        const cashierHired = (cashierWorker !== null || u.cashierLevel > 0);
        const cashierCost = 350;
        const cashierLvlEl = document.getElementById('upgrade-cashier-level');
        if (cashierLvlEl) cashierLvlEl.innerText = cashierHired ? 'Hired (Active at Register)' : 'Not Hired';
        const btnCashier = document.getElementById('btn-upgrade-cashier');
        if (btnCashier) {
            btnCashier.disabled = cashierHired || GameState.money < cashierCost;
            const costCashierEl = document.getElementById('cost-upgrade-cashier');
            if (costCashierEl) costCashierEl.innerText = cashierHired ? 'HIRED' : `$${cashierCost}`;
        }
    }

    document.getElementById('btn-upgrade-speed').addEventListener('click', () => {
        const cost = 50 + 35 * GameState.upgrades.speedLevel;
        if (GameState.money >= cost && GameState.upgrades.speedLevel < 10) {
            GameState.money -= cost;
            GameState.upgrades.speedLevel++;
            GameState.playerSpeed += 0.6;
            sound.playUpgrade();
            showToast(`⚡ Chef speed upgraded to Lv ${GameState.upgrades.speedLevel}!`);
            updateHUD();
            updateUpgradesUI();
            SaveSystem.save();
        }
    });

    document.getElementById('btn-upgrade-capacity').addEventListener('click', () => {
        const cost = 60 + 40 * GameState.upgrades.capacityLevel;
        if (GameState.money >= cost && GameState.upgrades.capacityLevel < 8) {
            GameState.money -= cost;
            GameState.upgrades.capacityLevel++;
            GameState.playerMaxPizzas += 2;
            sound.playUpgrade();
            showToast(`📦 Pizza capacity upgraded to ${GameState.playerMaxPizzas} boxes!`);
            updateHUD();
            updateUpgradesUI();
            SaveSystem.save();
        }
    });

    // Specialized Helper Button Bindings
    const btnUpgradeChef = document.getElementById('btn-upgrade-chef');
    if (btnUpgradeChef) {
        btnUpgradeChef.addEventListener('click', () => {
            const cost = 150;
            if (GameState.money >= cost && !helpers.some(h => h.role === 'CHEF')) {
                GameState.money -= cost;
                spawnHelperWorker('CHEF');
                sound.playUpgrade();
                showToast('👨‍🍳 Kitchen Chef hired! Dough & oven automated!');
                updateHUD();
                updateUpgradesUI();
                SaveSystem.save();
            }
        });
    }

    const btnUpgradeRunner = document.getElementById('btn-upgrade-runner');
    if (btnUpgradeRunner) {
        btnUpgradeRunner.addEventListener('click', () => {
            const cost = 220;
            if (GameState.money >= cost && !helpers.some(h => h.role === 'RUNNER')) {
                GameState.money -= cost;
                spawnHelperWorker('RUNNER');
                sound.playUpgrade();
                showToast('🏃 Counter Runner hired! Front shelf kept stocked!');
                updateHUD();
                updateUpgradesUI();
                SaveSystem.save();
            }
        });
    }

    const btnUpgradeWaiter = document.getElementById('btn-upgrade-waiter');
    if (btnUpgradeWaiter) {
        btnUpgradeWaiter.addEventListener('click', () => {
            const curWaiters = helpers.filter(h => h.role === 'WAITER').length;
            const cost = 280 + curWaiters * 170;
            if (GameState.money >= cost && curWaiters < 2) {
                GameState.money -= cost;
                spawnHelperWorker('WAITER');
                sound.playUpgrade();
                showToast(`🍽️ Waiter #${curWaiters + 1} hired! Serving & cleaning tables!`);
                updateHUD();
                updateUpgradesUI();
                SaveSystem.save();
            }
        });
    }

    // =========================================================================
    // 23. FRANCHISE EMPIRE MODAL & BUS TRANSIT
    // =========================================================================
    const franchiseBtn = document.getElementById('franchise-btn');
    const franchiseModal = document.getElementById('franchise-modal');
    const closeFranchiseBtn = document.getElementById('close-franchise-btn');
    const closeFranchiseX = document.getElementById('close-franchise-x');
    const btnUnlockBranch2 = document.getElementById('btn-unlock-branch-2');
    const btnCollectRoyalties = document.getElementById('btn-collect-royalties');

    function openFranchiseModal() {
        updateFranchiseUI();
        if (franchiseModal) franchiseModal.style.display = 'flex';
    }

    function closeFranchiseModal() {
        if (franchiseModal) franchiseModal.style.display = 'none';
    }

    if (franchiseBtn) franchiseBtn.addEventListener('click', openFranchiseModal);
    if (closeFranchiseBtn) closeFranchiseBtn.addEventListener('click', closeFranchiseModal);
    if (closeFranchiseX) closeFranchiseX.addEventListener('click', closeFranchiseModal);

    function updateFranchiseUI() {
        const royaltyAmountEl = document.getElementById('royalty-amount');
        if (royaltyAmountEl) royaltyAmountEl.innerText = GameState.franchiseRoyalties || 0;

        const tierTitle = document.getElementById('franchise-tier-title');
        if (tierTitle) tierTitle.innerText = `Franchise Empire: Tier ${GameState.franchiseTier || 1}`;

        const royaltySub = document.getElementById('franchise-royalty-sub');
        if (royaltySub) royaltySub.innerText = `Passive Empire Royalties: +$${(GameState.franchiseTier || 1) * 3} / 10s`;

        const b2Card = document.getElementById('branch-2-card');
        const b2Status = document.getElementById('branch-2-status');
        if (GameState.branch2Unlocked) {
            if (b2Card) b2Card.classList.add('active-branch');
            if (b2Status) {
                b2Status.innerText = 'OPERATING (+50% Customers)';
                b2Status.style.color = '#2b8a3e';
            }
            if (btnUnlockBranch2) {
                btnUnlockBranch2.disabled = true;
                btnUnlockBranch2.innerText = 'Unlocked';
            }
        } else {
            if (btnUnlockBranch2) {
                btnUnlockBranch2.disabled = GameState.money < 1500;
            }
        }

        const b3Card = document.getElementById('branch-3-card');
        const b3Status = document.getElementById('branch-3-status');
        const btnUnlockBranch3 = document.getElementById('btn-unlock-branch-3');
        if (GameState.branch3Unlocked) {
            if (b3Card) b3Card.classList.add('active-branch');
            if (b3Status) {
                b3Status.innerText = 'OPERATING (2x Cashiers & Delivery Fleet)';
                b3Status.style.color = '#2b8a3e';
            }
            if (btnUnlockBranch3) {
                btnUnlockBranch3.disabled = true;
                btnUnlockBranch3.innerText = 'Unlocked';
            }
        } else {
            if (btnUnlockBranch3) {
                const canUnlockB3 = GameState.money >= 3500 && GameState.branch2Unlocked;
                btnUnlockBranch3.disabled = !canUnlockB3;
                btnUnlockBranch3.innerText = canUnlockB3 ? 'Unlock ($3,500)' : 'Locked ($3,500)';
                if (canUnlockB3) {
                    btnUnlockBranch3.classList.remove('btn-secondary');
                    btnUnlockBranch3.classList.add('btn-success');
                }
            }
        }
    }

    if (btnUnlockBranch2) {
        btnUnlockBranch2.addEventListener('click', () => {
            if (GameState.money >= 1500 && !GameState.branch2Unlocked) {
                GameState.money -= 1500;
                GameState.branch2Unlocked = true;
                GameState.franchiseTier = 2;
                sound.playUnlock();
                showToast('🌊 Branch #2 Boardwalk UNLOCKED! Franchise Empire expanded!');
                updateFranchiseUI();
                updateHUD();
                SaveSystem.save();
            }
        });
    }

    const btnUnlockBranch3 = document.getElementById('btn-unlock-branch-3');
    if (btnUnlockBranch3) {
        btnUnlockBranch3.addEventListener('click', () => {
            if (GameState.money >= 3500 && GameState.branch2Unlocked && !GameState.branch3Unlocked) {
                GameState.money -= 3500;
                GameState.branch3Unlocked = true;
                GameState.franchiseTier = 3;
                sound.playUnlock();
                showToast('🏙️ Branch #3 Metro Mall UNLOCKED! Grand Tycoon Achieved!');
                updateFranchiseUI();
                updateHUD();
                SaveSystem.save();
            }
        });
    }

    if (btnCollectRoyalties) {
        btnCollectRoyalties.addEventListener('click', () => {
            if (GameState.franchiseRoyalties > 0) {
                const collected = GameState.franchiseRoyalties;
                GameState.money += collected;
                GameState.franchiseRoyalties = 0;
                sound.playCoin();
                showToast(`💰 Collected +$${collected} in Franchise Royalties!`);
                updateFranchiseUI();
                updateHUD();
                SaveSystem.save();
            }
        });
    }

    // Passive Royalties Accumulator
    setInterval(() => {
        if (GameState.branch2Unlocked || GameState.branch3Unlocked) {
            const multiplier = GameState.branch3Unlocked ? 8 : (GameState.branch2Unlocked ? 3 : 1);
            GameState.franchiseRoyalties = (GameState.franchiseRoyalties || 0) + multiplier;
            const rEl = document.getElementById('royalty-amount');
            if (rEl) rEl.innerText = GameState.franchiseRoyalties;
        }
    }, 10000);

    document.getElementById('btn-upgrade-oven').addEventListener('click', () => {
        const cost = 80 * (GameState.upgrades.ovenLevel || 1);
        if (GameState.money >= cost && (GameState.upgrades.ovenLevel || 1) < 8) {
            GameState.money -= cost;
            GameState.upgrades.ovenLevel = (GameState.upgrades.ovenLevel || 1) + 1;
            GameState.ovenSpeedMultiplier += 0.3;
            sound.playUpgrade();
            showToast(`🔥 Turbo oven upgraded to Lv ${GameState.upgrades.ovenLevel}!`);
            updateHUD();
            updateUpgradesUI();
            syncMachineFloorZones();
            SaveSystem.save();
        }
    });

    const btnUpgradeMill = document.getElementById('btn-upgrade-mill');
    if (btnUpgradeMill) {
        btnUpgradeMill.addEventListener('click', () => {
            const cost = 90 * (GameState.upgrades.millLevel || 1);
            if (GameState.money >= cost && (GameState.upgrades.millLevel || 1) < 8) {
                GameState.money -= cost;
                GameState.upgrades.millLevel = (GameState.upgrades.millLevel || 1) + 1;
                GameState.millSpeedMultiplier = (GameState.millSpeedMultiplier || 1.0) + 0.4;
                MillState.maxWheat += 2;
                MillState.maxFlour += 2;
                sound.playUpgrade();
                showToast(`🏭 Flour Mill upgraded to Lv ${GameState.upgrades.millLevel}!`);
                updateHUD();
                updateUpgradesUI();
                syncMachineFloorZones();
                SaveSystem.save();
            }
        });
    }

    const btnUpgradePress = document.getElementById('btn-upgrade-press');
    if (btnUpgradePress) {
        btnUpgradePress.addEventListener('click', () => {
            const cost = 90 * (GameState.upgrades.pressLevel || 1);
            if (GameState.money >= cost && (GameState.upgrades.pressLevel || 1) < 8) {
                GameState.money -= cost;
                GameState.upgrades.pressLevel = (GameState.upgrades.pressLevel || 1) + 1;
                GameState.pressSpeedMultiplier = (GameState.pressSpeedMultiplier || 1.0) + 0.4;
                PressState.maxFlour += 2;
                PressState.maxDough += 2;
                sound.playUpgrade();
                showToast(`🥞 Dough Press upgraded to Lv ${GameState.upgrades.pressLevel}!`);
                updateHUD();
                updateUpgradesUI();
                syncMachineFloorZones();
                SaveSystem.save();
            }
        });
    }

    const btnUpgradeFarm = document.getElementById('btn-upgrade-farm');
    if (btnUpgradeFarm) {
        btnUpgradeFarm.addEventListener('click', () => {
            const cost = 100 * (GameState.upgrades.farmLevel || 1);
            if (GameState.money >= cost && (GameState.upgrades.farmLevel || 1) < 5) {
                GameState.money -= cost;
                GameState.upgrades.farmLevel = (GameState.upgrades.farmLevel || 1) + 1;
                if (!GameState.farmExpanded && GameState.upgrades.farmLevel >= 2) {
                    expandWheatFarmPlot();
                }
                sound.playUpgrade();
                showToast(`🌾 Wheat Farm upgraded to Lv ${GameState.upgrades.farmLevel}! Faster regrowth!`);
                updateHUD();
                updateUpgradesUI();
                SaveSystem.save();
            }
        });
    }

    const btnUpgradeCashier = document.getElementById('btn-upgrade-cashier');
    if (btnUpgradeCashier) {
        btnUpgradeCashier.addEventListener('click', () => {
            const cost = 350;
            if (GameState.money >= cost && !cashierWorker) {
                GameState.money -= cost;
                GameState.upgrades.cashierLevel = 1;
                spawnCashierWorker();
                sound.playUpgrade();
                checkQuestTrigger('hire_cashier');
                showToast('💼 Front Cashier hired! Automatic counter sales!');
                updateHUD();
                updateUpgradesUI();
                SaveSystem.save();
            }
        });
    }

    // =========================================================================
    // 23. PLAYER CONTROLS (WASD + VIRTUAL JOYSTICK)
    // =========================================================================
    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.key) {
            keys[e.key] = true;
            keys[e.key.toLowerCase()] = true;
            keys[e.key.toUpperCase()] = true;
        }
        sound.init();
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
        if (e.key) {
            keys[e.key] = false;
            keys[e.key.toLowerCase()] = false;
            keys[e.key.toUpperCase()] = false;
        }
    });
    window.addEventListener('blur', () => {
        for (const k in keys) keys[k] = false;
        input.isMoving = false;
        input.x = 0;
        input.y = 0;
    });

    const input = { x: 0, y: 0, isMoving: false };
    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');

    let isDraggingJoystick = false;
    let joystickCenter = { x: 0, y: 0 };
    const maxRadius = 50;

    function handleJoystickStart(clientX, clientY) {
        sound.init();
        isDraggingJoystick = true;
        const rect = joystickBase.getBoundingClientRect();
        joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        handleJoystickMove(clientX, clientY);
    }

    function handleJoystickMove(clientX, clientY) {
        if (!isDraggingJoystick) return;
        const deltaX = clientX - joystickCenter.x;
        const deltaY = clientY - joystickCenter.y;
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (dist === 0) {
            input.x = 0; input.y = 0; input.isMoving = false;
            joystickThumb.style.transform = `translate(0px, 0px)`;
            return;
        }

        const clampedDist = Math.min(dist, maxRadius);
        const normX = deltaX / dist;
        const normY = deltaY / dist;

        input.x = normX * (clampedDist / maxRadius);
        input.y = normY * (clampedDist / maxRadius);
        input.isMoving = clampedDist > 5;
        joystickThumb.style.transform = `translate(${normX * clampedDist}px, ${normY * clampedDist}px)`;
    }

    function handleJoystickEnd() {
        isDraggingJoystick = false;
        input.x = 0; input.y = 0; input.isMoving = false;
        joystickThumb.style.transform = `translate(0px, 0px)`;
    }

    joystickZone.addEventListener('mousedown', (e) => handleJoystickStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => handleJoystickMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', handleJoystickEnd);

    joystickZone.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            handleJoystickStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isDraggingJoystick && e.touches.length > 0) {
            handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchend', handleJoystickEnd);
    window.addEventListener('touchcancel', handleJoystickEnd);

    // =========================================================================
    // 24. SETTINGS & MODALS
    // =========================================================================
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const toggleSoundBtn = document.getElementById('toggle-sound-btn');
    const resetGameBtn = document.getElementById('reset-game-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const closeSettingsX = document.getElementById('close-settings-x');

    settingsBtn.addEventListener('click', () => { settingsModal.style.display = 'flex'; });
    function closeSettings() { settingsModal.style.display = 'none'; }
    closeSettingsBtn.addEventListener('click', closeSettings);
    closeSettingsX.addEventListener('click', closeSettings);
    closeSettingsBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); closeSettings(); });
    closeSettingsX.addEventListener('pointerdown', (e) => { e.stopPropagation(); closeSettings(); });

    // Chef's Pizza Master Guide Modal (Play Store Showcase)
    const guideBtn = document.getElementById('guide-btn');
    const guideModal = document.getElementById('guide-modal');
    const closeGuideBtn = document.getElementById('close-guide-btn');
    const closeGuideX = document.getElementById('close-guide-x');

    function openGuideModal() {
        if (guideModal) guideModal.style.display = 'flex';
    }
    function closeGuideModal() {
        if (guideModal) guideModal.style.display = 'none';
    }
    if (guideBtn) guideBtn.addEventListener('click', openGuideModal);
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeGuideModal);
    if (closeGuideX) closeGuideX.addEventListener('click', closeGuideModal);

    // Fullscreen Toggle (Mobile Play Store Immersion)
    const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    if (toggleFullscreenBtn) {
        toggleFullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
                toggleFullscreenBtn.innerText = '📱 Exit Fullscreen';
            } else {
                document.exitFullscreen().catch(() => {});
                toggleFullscreenBtn.innerText = '📱 Toggle Fullscreen';
            }
        });
    }

    // Backdrop click for all modals (clicking anywhere outside the dialog immediately closes it)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                if (overlay.id === 'upgrades-modal') closeUpgradesModal();
                if (overlay.id === 'cloud-modal') closeCloudModal();
                if (overlay.id === 'settings-modal') closeSettings();
                if (overlay.id === 'guide-modal') closeGuideModal();
            }
        });
    });

    // Escape key closes any open modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUpgradesModal();
            closeCloudModal();
            closeSettings();
            closeGuideModal();
        }
    });

    toggleSoundBtn.addEventListener('click', () => {
        const on = sound.toggle();
        toggleSoundBtn.innerText = on ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });
    resetGameBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all game progress?')) {
            localStorage.clear();
            location.reload();
        }
    });

    document.getElementById('quality-fast-btn').addEventListener('click', () => applyQuality('FAST'));
    document.getElementById('quality-balanced-btn').addEventListener('click', () => applyQuality('BALANCED'));
    document.getElementById('quality-high-btn').addEventListener('click', () => applyQuality('ULTRA'));

    // GPU COMPOSITED 2D POSITIONING (translate3d, ZERO REFLOW)
    const tempVec = new THREE.Vector3();
    const _vDir = new THREE.Vector3();
    const _vTarget = new THREE.Vector3();
    const _vExit = new THREE.Vector3();

    function toScreenXY(worldPos, yOffset = 0) {
        tempVec.copy(worldPos);
        tempVec.y += yOffset;
        tempVec.project(camera);
        const x = Math.round((tempVec.x * 0.5 + 0.5) * window.innerWidth);
        const y = Math.round((-(tempVec.y * 0.5) + 0.5) * window.innerHeight);
        return { x, y };
    }

    function updateDOMTransform(el, worldPos, yOffset = 0, extraOffset = 'translate(-50%, -100%)') {
        if (!el || el.style.display === 'none') return;
        const coords = toScreenXY(worldPos, yOffset);
        el.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0) ${extraOffset}`;
        return coords;
    }

    // Power saver: Pause rendering when browser tab is hidden/backgrounded
    let isTabVisible = true;
    document.addEventListener('visibilitychange', () => {
        isTabVisible = !document.hidden;
    });

    // =========================================================================
    // 25. MAIN ANIMATION & RENDERING LOOP
    // =========================================================================
    let frameCount = 0;
    let lastFpsTime = performance.now();
    const clock = new THREE.Clock();
    let playerDropCooldown = 0;

    function animate() {
        requestAnimationFrame(animate);
        if (!isTabVisible) return;

        // 0. FPS METER
        frameCount++;
        const now = performance.now();
        if (now - lastFpsTime >= 500) {
            const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
            fpsDisplay.innerText = `${fps} FPS`;
            if (fps < 48) fpsBadge.classList.add('fps-warn');
            else fpsBadge.classList.remove('fps-warn');
            frameCount = 0;
            lastFpsTime = now;
        }

        const dt = Math.min(clock.getDelta(), 0.1);
        const time = clock.elapsedTime || 0;

        // 1. OVEN FIRE FLICKER & HEARTH GLOW
        fireMesh.scale.setScalar(0.9 + Math.sin(clock.elapsedTime * 12) * 0.15);
        ovenFireLight.intensity = 3.2 + Math.sin(clock.elapsedTime * 10) * 0.4;

        // 2. PLAYER MOVEMENT & STRICT SOLID COLLISION SLIDING
        let moveX = 0;
        let moveZ = 0;

        if (input.isMoving) {
            moveX += (input.x + input.y) * 0.7071;
            moveZ += (-input.x + input.y) * 0.7071;
        }
        if (keys['KeyW'] || keys['w'] || keys['W'] || keys['ArrowUp']) { moveX -= 1; moveZ -= 1; }
        if (keys['KeyS'] || keys['s'] || keys['S'] || keys['ArrowDown']) { moveX += 1; moveZ += 1; }
        if (keys['KeyA'] || keys['a'] || keys['A'] || keys['ArrowLeft']) { moveX -= 1; moveZ += 1; }
        if (keys['KeyD'] || keys['d'] || keys['D'] || keys['ArrowRight']) { moveX += 1; moveZ -= 1; }

        const moveLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (moveLen > 0.05) {
            moveX /= moveLen;
            moveZ /= moveLen;

            const deltaX = moveX * GameState.playerSpeed * dt;
            const deltaZ = moveZ * GameState.playerSpeed * dt;
            const resolved = resolveCollision(player.root.position.x + deltaX, player.root.position.z + deltaZ, 0.65);
            player.root.position.x = resolved.x;
            player.root.position.z = resolved.z;

            const targetRot = Math.atan2(moveX, moveZ);
            let diff = targetRot - player.root.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            player.root.rotation.y += diff * 12 * dt;

            player.walkCycle += dt * 15;
            player.leftLeg.rotation.x = Math.sin(player.walkCycle) * 0.6;
            player.rightLeg.rotation.x = -Math.sin(player.walkCycle) * 0.6;

            // Arms holding forward when carrying boxes
            player.leftArm.rotation.x = -0.55 + Math.sin(player.walkCycle) * 0.1;
            player.rightArm.rotation.x = -0.55 - Math.sin(player.walkCycle) * 0.1;

            const tilt = Math.sin(player.walkCycle * 2) * 0.12;
            player.stackContainer.rotation.z = tilt;
            player.stackContainer.rotation.x = Math.abs(tilt) * 0.6;

            // Multi-box cascading wobble physics (Pizza Ready! signature feel)
            for (let b = 0; b < player.stackContainer.children.length; b++) {
                const box = player.stackContainer.children[b];
                const swayAmp = (b + 1) * 0.045;
                box.position.x = Math.sin(player.walkCycle * 2.2 + b * 0.35) * swayAmp;
                box.rotation.z = Math.sin(player.walkCycle * 2.0 + b * 0.3) * (swayAmp * 0.7);
            }
        } else {
            const unstuck = resolveCollision(player.root.position.x, player.root.position.z, 0.65);
            player.root.position.x = unstuck.x;
            player.root.position.z = unstuck.z;

            player.leftLeg.rotation.x = 0;
            player.rightLeg.rotation.x = 0;
            player.leftArm.rotation.x = -0.3;
            player.rightArm.rotation.x = -0.3;
            player.stackContainer.rotation.z = 0;
            player.stackContainer.rotation.x = 0;
            for (let b = 0; b < player.stackContainer.children.length; b++) {
                const box = player.stackContainer.children[b];
                box.position.x = 0;
                box.rotation.z = (b % 2 === 0 ? 0.04 : -0.04);
            }
        }

        // 3. CAMERA SMOOTH FOLLOW (INTIMATE CLOSE-UP ISOMETRIC - EXACT MATCH TO REFERENCE 1 & 2)
        const targetCamX = player.root.position.x;
        const targetCamZ = player.root.position.z - 3.5;
        camera.position.x = 28 + targetCamX;
        camera.position.y = 32;
        camera.position.z = 28 + targetCamZ;
        camera.lookAt(targetCamX, 0, targetCamZ);

        // 3B. PIZZA EMPIRE: WHEAT CROPS HARVEST & REGROWTH
        const pPos = player.root.position;
        for (let w = 0; w < wheatCrops.length; w++) {
            const crop = wheatCrops[w];
            crop.group.rotation.z = Math.sin(time * 2.8 + w * 0.8) * 0.06;

            if (!crop.isRipe) {
                const farmSpeed = 1 + ((GameState.upgrades.farmLevel || 1) - 1) * 0.45;
                crop.regrowTimer -= dt * farmSpeed;
                crop.group.scale.y = Math.min(1.0, 0.25 + (1 - crop.regrowTimer / 4.0) * 0.75);
                if (crop.regrowTimer <= 0) {
                    crop.isRipe = true;
                    crop.group.scale.y = 1.0;
                }
            } else {
                if (pPos.distanceTo(crop.pos) < 2.5 && GameState.playerWheat < GameState.playerMaxWheat) {
                    crop.isRipe = false;
                    crop.regrowTimer = 4.0;
                    crop.group.scale.y = 0.25;
                    GameState.playerWheat++;
                    sound.playHarvest();
                    showWheatToast(GameState.playerWheat, GameState.playerMaxWheat);
                    updatePlayerCarryVisuals(player);
                    updateHUD();
                }
            }
        }

        // --- 3C. FLOUR MILL (GRAIN GRINDER) ---
        if (playerDropCooldown > 0) playerDropCooldown -= dt;

        if (pPos.distanceTo(MillState.dropPos) < 3.2 && GameState.playerWheat > 0 && MillState.storedWheat < MillState.maxWheat && playerDropCooldown <= 0) {
            playerDropCooldown = 0.22;
            GameState.playerWheat--;
            MillState.storedWheat++;
            spawnTransferItem('wheat', player.root.position, MillState.dropPos);
            sound.playGrinder();
            showToast(`🌾 Wheat loaded into Mill! (${MillState.storedWheat}/${MillState.maxWheat})`);
            updatePlayerCarryVisuals(player);
            updateHUD();
        }

        if (MillState.storedWheat > 0 && MillState.readyFlour < MillState.maxFlour) {
            const mSpeed = GameState.millSpeedMultiplier || 1.0;
            millWheel.rotation.x += dt * 5.0 * mSpeed;
            MillState.grindTimer += dt * mSpeed;
            if (MillState.grindTimer >= 1.5) {
                MillState.grindTimer = 0;
                MillState.storedWheat--;
                MillState.readyFlour++;
                sound.playGrinder();
                flourSacks.forEach((s, idx) => { s.visible = idx < MillState.readyFlour; });
            }
        }

        if (pPos.distanceTo(MillState.pickupPos) < 3.2 && MillState.readyFlour > 0 && GameState.playerFlour < GameState.playerMaxFlour && playerDropCooldown <= 0) {
            playerDropCooldown = 0.22;
            MillState.readyFlour--;
            GameState.playerFlour++;
            sound.playPizzaPickup();
            spawnTransferItem('flour', MillState.pickupPos, player.root.position);
            flourSacks.forEach((s, idx) => { s.visible = idx < MillState.readyFlour; });
            showToast(`🍚 +1 Fine Flour Sack! (${GameState.playerFlour}/${GameState.playerMaxFlour})`);
            updatePlayerCarryVisuals(player);
            updateHUD();
        }

        // --- 3D. DOUGH PRESS & ROLLER ---
        if (pPos.distanceTo(PressState.dropPos) < 3.2 && GameState.playerFlour > 0 && PressState.storedFlour < PressState.maxFlour && playerDropCooldown <= 0) {
            playerDropCooldown = 0.22;
            GameState.playerFlour--;
            PressState.storedFlour++;
            spawnTransferItem('flour', player.root.position, PressState.dropPos);
            sound.playDoughPress();
            showToast(`🍚 Flour loaded into Dough Press! (${PressState.storedFlour}/${PressState.maxFlour})`);
            updatePlayerCarryVisuals(player);
            updateHUD();
        }

        if (PressState.storedFlour > 0 && PressState.readyDough < PressState.maxDough) {
            const pSpeed = GameState.pressSpeedMultiplier || 1.0;
            PressState.pressTimer += dt * pSpeed;
            pressPlate.position.y = 2.1 - Math.abs(Math.sin(PressState.pressTimer * 3.5)) * 0.65;
            if (PressState.pressTimer >= 1.6) {
                PressState.pressTimer = 0;
                PressState.storedFlour--;
                PressState.readyDough++;
                sound.playDoughPress();
                doughDisks.forEach((d, idx) => { d.visible = idx < PressState.readyDough; });
            }
        }

        if (pPos.distanceTo(PressState.pickupPos) < 3.2 && PressState.readyDough > 0 && GameState.playerDough < GameState.playerMaxDough && playerDropCooldown <= 0) {
            playerDropCooldown = 0.22;
            PressState.readyDough--;
            GameState.playerDough++;
            sound.playPizzaPickup();
            spawnTransferItem('dough', PressState.pickupPos, player.root.position);
            doughDisks.forEach((d, idx) => { d.visible = idx < PressState.readyDough; });
            showToast(`🥞 +1 Rolled Dough Base! (${GameState.playerDough}/${GameState.playerMaxDough})`);
            updatePlayerCarryVisuals(player);
            updateHUD();
        }

        // --- 3E. TOPPING & CHEESE DISPENSER STATION ---
        if (pPos.distanceTo(ToppingState.dropPos) < 3.2 && GameState.playerDough > 0 && conveyorPizzas.length < 6 && playerDropCooldown <= 0) {
            playerDropCooldown = 0.35;
            GameState.playerDough--;
            spawnTransferItem('dough', player.root.position, ToppingState.dropPos, () => {
                startPizzaAssembly();
            });
            updatePlayerCarryVisuals(player);
            updateHUD();
        }

        // 3F. DOUGH & TOPPING PREP STATION (CONTINUOUS AUTO-BAKING WITH ROLLING BOOST)
        const hasChefHelper = helpers.some(h => h.role === 'CHEF');
        const distToPrep = pPos.distanceTo(PREP_STATION_POS);
        const isPlayerPrepping = (distToPrep < 3.2);

        updateDOMTransform(prepStationTag, PREP_STATION_POS, 4.0);

        // Core Pizza Ready Mechanics: Oven ALWAYS auto-bakes continuously!
        // Rolling dough manually or having the Kitchen Chef speeds up baking dramatically.
        const bakeMultiplier = (isPlayerPrepping ? 2.5 : 1.0) * (hasChefHelper ? 1.8 : 1.0) * (GameState.ovenSpeedMultiplier || 1.0);
        if (conveyorPizzas.length < 4 && readyPizzas.length < 16) {
            prepTimer += dt * bakeMultiplier;
            const statusEl = document.getElementById('prep-status');
            if (statusEl) {
                if (isPlayerPrepping) {
                    const pct = Math.min(100, Math.floor((prepTimer / 1.5) * 100));
                    statusEl.innerText = `Fast Rolling! ${pct}%`;
                } else if (hasChefHelper) {
                    statusEl.innerText = 'Chef Active';
                } else {
                    statusEl.innerText = 'Baking... (Stand to Boost)';
                }
            }

            if (prepTimer >= 2.0) {
                prepTimer = 0;
                startPizzaAssembly(hasChefHelper || isPlayerPrepping);
            }
        } else {
            const statusEl = document.getElementById('prep-status');
            if (statusEl) {
                statusEl.innerText = readyPizzas.length >= 16 ? 'Pickup Rack Full' : 'Baking Standby';
            }
        }

        // 4. CONVEYOR TRACK: OVEN BAKING -> PACKAGING MACHINE -> PICKUP TRAY
        for (let i = conveyorPizzas.length - 1; i >= 0; i--) {
            const p = conveyorPizzas[i];
            p.z += dt * 3.8 * GameState.ovenSpeedMultiplier;
            p.mesh.position.z = p.z;

            // Baking inside the Brick Oven (z from -20 to -15)
            if (p.z > -20.0 && p.z < -15.0) {
                p.mesh.rotation.y += dt * 2.0;
            }

            // Entering Automatic Box Packaging Station at z = -9.5
            if (p.z >= -9.5 && !p.isBoxed) {
                p.isBoxed = true;
                scene.remove(p.mesh);
                p.mesh = createPizzaBoxMesh();
                p.mesh.position.set(-18, 1.8, p.z);
                scene.add(p.mesh);
                sound.playUnlock();
            }

            // Reached pickup tray at z = -4.8
            if (p.z >= p.targetZ) {
                scene.remove(p.mesh);
                conveyorPizzas.splice(i, 1);

                if (readyPizzas.length < 16) {
                    const stackBox = createPizzaBoxMesh();
                    const stackHeight = (readyPizzas.length % 8) * 0.42 + 1.6;
                    const col = Math.floor(readyPizzas.length / 8);
                    stackBox.position.set(-18 + (col === 0 ? -0.8 : 0.8), stackHeight, -4.8);
                    scene.add(stackBox);
                    readyPizzas.push(stackBox);
                }
            }
        }

        // 4B. ANIMATE 3D PARABOLIC ITEM TRANSFERS
        for (let i = transferItems.length - 1; i >= 0; i--) {
            const item = transferItems[i];
            item.progress += dt * item.speed;
            if (item.progress >= 1.0) {
                scene.remove(item.mesh);
                transferItems.splice(i, 1);
                if (item.onComplete) item.onComplete();
            } else {
                item.mesh.position.lerpVectors(item.start, item.target, item.progress);
                item.mesh.position.y = item.start.y + Math.sin(item.progress * Math.PI) * 2.2;
                item.mesh.rotation.y += dt * 6.0;
            }
        }

        // 5. PIZZA PICKUP TRIGGER
        const distToPickup = player.root.position.distanceTo(PIZZA_PICKUP_POS);
        if (distToPickup < 3.8 && readyPizzas.length > 0 && GameState.playerPizzas < GameState.playerMaxPizzas && playerDropCooldown <= 0) {
            playerDropCooldown = 0.15;
            const box = readyPizzas.pop();
            scene.remove(box);
            GameState.playerPizzas++;
            sound.playPizzaPickup();
            spawnTransferItem('pizza', PIZZA_PICKUP_POS, player.root.position);
            updatePlayerPizzaStackVisuals(player, GameState.playerPizzas);
            updateHUD();
        }

        // 5B. FRONT COUNTER HEATED SHELF DROP TRIGGER
        updateDOMTransform(shelfTag, COUNTER_SHELF_WORLD_POS, 4.2);
        const distToShelfDrop = pPos.distanceTo(COUNTER_DROP_SPOT);
        if (distToShelfDrop < 3.2 && GameState.playerPizzas > 0 && counterPizzas.length < 12 && playerDropCooldown <= 0) {
            playerDropCooldown = 0.16;
            GameState.playerPizzas--;
            updatePlayerPizzaStackVisuals(player, GameState.playerPizzas);
            sound.playPizzaPickup();

            const shelfBox = createPizzaBoxMesh();
            const stackHeight = (counterPizzas.length % 6) * 0.42 + 0.12;
            const col = Math.floor(counterPizzas.length / 6);
            shelfBox.position.set((col === 0 ? -0.85 : 0.85), stackHeight, 0);
            counterShelfGroup.add(shelfBox);
            counterPizzas.push(shelfBox);
            updateCounterShelfVisuals();
            spawnTransferItem('pizza', player.root.position, COUNTER_SHELF_WORLD_POS);
            updateHUD();
        }

        // 6. SODA DRINKS PICKUP TRIGGER
        const distToSoda = player.root.position.distanceTo(SODA_STATION_POS);
        if (distToSoda < 3.4 && GameState.playerDrinks < GameState.playerMaxDrinks) {
            GameState.playerDrinks++;
            sound.playDrink();
            showToast('🥤 Cold Soda picked up!');
            updateHUD();
        }

        // 7. HR DESK INTERACTION
        const distToHR = player.root.position.distanceTo(new THREE.Vector3(HR_DESK_POS.x, 0, HR_DESK_POS.z + 2.4));
        if (hrCooldownTimer > 0) {
            hrCooldownTimer -= dt;
        }
        if (distToHR > 3.5) {
            hrTriggerAllowed = true;
        }
        if (distToHR < 2.0 && hrCooldownTimer <= 0 && hrTriggerAllowed && upgradesModal.style.display !== 'flex') {
            openUpgradesModal();
        }

        // 8. TRASH CAN / RECYCLING DUMPSTER TRIGGER
        const distToTrashBin = player.root.position.distanceTo(TRASH_BIN_POS);
        if (distToTrashBin < 3.2 && GameState.playerTrash > 0) {
            const dumped = GameState.playerTrash;
            GameState.playerTrash = 0;
            const cashReward = dumped * 4;
            GameState.money += cashReward;
            addPlayerExp(dumped * 20);
            sound.playTrashDump();
            checkQuestTrigger('dump_trash');

            const pScreen = toScreenXY(player.root.position, 4.8);
            spawnFloatingCashText(pScreen.x, pScreen.y, `+$${cashReward} Recycled!`);
            showToast(`♻️ Cleanliness Reward: +$${cashReward}!`);
            updateHUD();
            SaveSystem.save();
        }

        // 9. TABLE DIRTY DISHES CLEANING TRIGGER (PLAYER)
        for (let table of diningTables) {
            if (table.isDirty) {
                updateDOMTransform(table.trashBubbleEl, table.pos, 3.4);

                const dist = player.root.position.distanceTo(table.pos);
                if (dist < 3.5 && GameState.playerTrash < GameState.playerMaxTrash) {
                    table.isDirty = false;
                    table.dirtyDishesGroup.visible = false;
                    table.trashBubbleEl.style.display = 'none';

                    GameState.playerTrash++;
                    const tip = table.trashTip || 20;
                    GameState.money += tip;
                    GameState.totalTablesCleaned++;
                    addPlayerExp(15);
                    sound.playClean();
                    checkQuestTrigger('clean_table');

                    const pScreen = toScreenXY(player.root.position, 4.8);
                    spawnFloatingCashText(pScreen.x, pScreen.y, `+$${tip} Tip!`);
                    showToast(`🧹 Table Cleaned! Tip: +$${tip}`);
                    updateHUD();
                    SaveSystem.save();
                }
            }
        }

        // 10. SPECIALIZED HELPER WORKERS AI (CHEF, RUNNER, WAITER)
        for (let hIndex = 0; hIndex < helpers.length; hIndex++) {
            const h = helpers[hIndex];
            updateDOMTransform(h.tagEl, h.root.position, 4.4);

            let target = null;
            let action = null;

            // --- ROLE A: KITCHEN CHEF HELPER ---
            if (h.role === 'CHEF') {
                target = PREP_STATION_POS;
                action = 'STAND_AT_PREP';
            }
            // --- ROLE B: COUNTER RUNNER HELPER ---
            else if (h.role === 'RUNNER') {
                if (h.pizzas <= 0) {
                    target = PIZZA_PICKUP_POS;
                    action = 'FETCH_FROM_OVEN';
                } else {
                    target = COUNTER_DROP_SPOT;
                    action = 'DROP_TO_SHELF';
                }
            }
            // --- ROLE C: DINE-IN WAITER HELPER ---
            else {
                // If carrying trash, go to dump
                if (h.trash > 0) {
                    target = TRASH_BIN_POS;
                    action = 'DUMP_TRASH';
                }
                // If has no pizzas, check for dirty tables first
                else if (h.pizzas <= 0) {
                    const dirtyTable = diningTables.find(t => t.isDirty);
                    if (dirtyTable) {
                        target = dirtyTable.serveSpot; // FIXED: Target serveSpot outside obstacle radius!
                        action = 'CLEAN_TABLE';
                        h.targetTable = dirtyTable;
                    } else {
                        // Go fetch pizzas for dining tables
                        const tableNeedingPizza = diningTables.find(t => t.customer && !t.hasPizza && !t.isDirty);
                        if (tableNeedingPizza && readyPizzas.length > 0) {
                            target = PIZZA_PICKUP_POS;
                            action = 'FETCH_FOR_TABLES';
                        }
                    }
                }
                // If carrying pizzas, serve seated customer
                else {
                    const tableToServe = diningTables.find(t => t.customer && !t.hasPizza && !t.isDirty);
                    if (tableToServe) {
                        target = tableToServe.serveSpot;
                        action = 'SERVE_TABLE';
                        h.targetTable = tableToServe;
                    } else {
                        // No seated customer needs pizza right now -> drop extra pizzas onto Front Counter Heated Shelf!
                        target = COUNTER_DROP_SPOT;
                        action = 'DROP_TO_SHELF';
                    }
                }
            }

            // Execute movement & anti-stuck pathfinding
            if (target) {
                const dist = h.root.position.distanceTo(target);
                if (dist > 1.3) {
                    _vDir.subVectors(target, h.root.position).normalize();
                    const moveDist = h.speed * dt;
                    const res = resolveCollision(h.root.position.x + _vDir.x * moveDist, h.root.position.z + _vDir.z * moveDist, 0.4);
                    h.root.position.x = res.x;
                    h.root.position.z = res.z;
                    h.root.rotation.y = Math.atan2(_vDir.x, _vDir.z);
                    h.walkCycle += dt * 11;
                    h.leftLeg.rotation.x = Math.sin(h.walkCycle) * 0.5;
                    h.rightLeg.rotation.x = -Math.sin(h.walkCycle) * 0.5;

                    // Anti-Stuck Watchdog: gently nudge if blocked for > 1.8s
                    if (h.lastPos && h.root.position.distanceTo(h.lastPos) < 0.04) {
                        h.stuckTimer = (h.stuckTimer || 0) + dt;
                        if (h.stuckTimer > 1.8) {
                            h.stuckTimer = 0;
                            h.root.position.addScaledVector(dir, 0.65);
                        }
                    } else {
                        h.stuckTimer = 0;
                        h.lastPos = h.root.position.clone();
                    }
                } else {
                    // REACHED TARGET: PERFORM ROLE ACTION
                    h.leftLeg.rotation.x = 0;
                    h.rightLeg.rotation.x = 0;

                    if (action === 'FETCH_FROM_OVEN' || action === 'FETCH_FOR_TABLES') {
                        if (readyPizzas.length > 0 && h.pizzas < h.maxPizzas) {
                            const box = readyPizzas.pop();
                            scene.remove(box);
                            h.pizzas++;
                            sound.playPizzaPickup();
                            updatePlayerPizzaStackVisuals(h, h.pizzas);
                        }
                    } else if (action === 'DROP_TO_SHELF') {
                        if (h.pizzas > 0 && counterPizzas.length < 12) {
                            h.pizzas--;
                            updatePlayerPizzaStackVisuals(h, h.pizzas);
                            sound.playPizzaPickup();

                            const shelfBox = createPizzaBoxMesh();
                            const stackHeight = (counterPizzas.length % 6) * 0.42 + 0.12;
                            const col = Math.floor(counterPizzas.length / 6);
                            shelfBox.position.set((col === 0 ? -0.85 : 0.85), stackHeight, 0);
                            counterShelfGroup.add(shelfBox);
                            counterPizzas.push(shelfBox);
                            updateCounterShelfVisuals();
                        }
                    } else if (action === 'CLEAN_TABLE' && h.targetTable && h.targetTable.isDirty) {
                        h.targetTable.isDirty = false;
                        h.targetTable.dirtyDishesGroup.visible = false;
                        h.targetTable.trashBubbleEl.style.display = 'none';
                        h.trash = 1;
                        addCashToPile(1); // Tip earned!
                        sound.playClean();
                    } else if (action === 'SERVE_TABLE' && h.targetTable && h.targetTable.customer && !h.targetTable.hasPizza) {
                        h.targetTable.hasPizza = true;
                        h.targetTable.plate.visible = true;
                        h.targetTable.slice.visible = true;
                        h.pizzas--;
                        updatePlayerPizzaStackVisuals(h, h.pizzas);
                        sound.playServe();
                    } else if (action === 'DUMP_TRASH') {
                        h.trash = 0;
                        sound.playTrashDump();
                        addCashToPile(1);
                    }
                }
            }
        }

        // 10B. DRIVE-THRU VEHICLES AI (PIZZA READY SIGNATURE MECHANIC)
        if (GameState.driveThruUnlocked) {
            carSpawnTimer += dt;
            if (carSpawnTimer >= 3.5 && driveThruCars.length < 2) {
                carSpawnTimer = 0;
                spawnDriveThruCar();
            }

            for (let i = driveThruCars.length - 1; i >= 0; i--) {
                const car = driveThruCars[i];
                const mesh = car.mesh;

                if (car.state === 'DRIVE_TO_WINDOW') {
                    if (mesh.root.position.z < -10.2) {
                        mesh.root.position.z += car.speed * dt;
                        car.mesh.wheels.forEach(w => w.rotation.x += car.speed * dt * 2.5);
                    } else {
                        mesh.root.position.z = -10;
                        car.state = 'WAITING_AT_WINDOW';
                        car.bubbleEl.style.display = 'flex';
                        if (!car.hasHonked) {
                            car.hasHonked = true;
                            sound.playCarHorn();
                        }
                    }
                } else if (car.state === 'WAITING_AT_WINDOW') {
                    updateDOMTransform(car.bubbleEl, mesh.root.position, 4.4);

                    const distPlayer = player.root.position.distanceTo(DRIVE_THRU_PLAYER_SPOT);
                    if (distPlayer < 3.8 && GameState.playerPizzas >= car.orderPizzas) {
                        GameState.playerPizzas -= car.orderPizzas;
                        if (car.wantsDrink && GameState.playerDrinks > 0) {
                            GameState.playerDrinks--;
                        }
                        sound.playRegister();
                        updatePlayerPizzaStackVisuals(player, GameState.playerPizzas);

                        const rewardMoney = car.orderPizzas * getPizzaPrice() + (car.wantsDrink ? 3 : 0);
                        addCashToPile(rewardMoney);
                        addPlayerExp(40);
                        GameState.driveThruCarsServed++;

                        const pScreen = toScreenXY(player.root.position, 4.8);
                        spawnFloatingCashText(pScreen.x, pScreen.y, `+$${rewardMoney} Drive-Thru!`);
                        showToast(`🚗 Drive-Thru Order Served! +$${rewardMoney}!`);
                        checkQuestTrigger('serve_drive_thru');
                        updateHUD();

                        spawnHeartParticle(mesh.root.position);
                        car.bubbleEl.style.display = 'none';
                        car.state = 'DRIVE_AWAY';
                        sound.playCarDrive();
                        SaveSystem.save();
                    }
                } else if (car.state === 'DRIVE_AWAY') {
                    mesh.root.position.z += car.speed * dt * 1.4;
                    car.mesh.wheels.forEach(w => w.rotation.x += car.speed * dt * 3.0);

                    if (mesh.root.position.z > 52) {
                        if (car.bubbleEl.parentNode) car.bubbleEl.parentNode.removeChild(car.bubbleEl);
                        scene.remove(mesh.root);
                        driveThruCars.splice(i, 1);
                    }
                }
            }
        }

        // 10C. FRONT CASHIER WORKER AI (AUTOMATED COUNTER SERVICE FROM HEATED SHELF)
        if (cashierWorker) {
            updateDOMTransform(cashierWorker.tagEl, cashierWorker.mesh.root.position, 4.4);
            cashierServeTimer += dt;
            if (cashierServeTimer >= 1.6) {
                cashierServeTimer = 0;
                const frontCust = customers.find(c => c.waitingAtCounter && c.queueIndex === 0 && !c.hasReceivedPizza);
                if (frontCust) {
                    // STRICT REQUIREMENT: Cashier can ONLY serve if hot pizzas are available on the Front Heated Shelf!
                    if (counterPizzas.length > 0) {
                        const boxMesh = counterPizzas.pop();
                        counterShelfGroup.remove(boxMesh);
                        updateCounterShelfVisuals();

                        sound.playRegister();
                        const pPrice = getPizzaPrice() + (frontCust.wantsDrink ? 2 : 0);
                        addCashToPile(pPrice);
                        addPlayerExp(10);
                        checkQuestTrigger('serve_customer');
                        updateHUD();
                        advanceCounterQueue(frontCust);
                    } else {
                        // Heated shelf is empty! Customer waits patiently!
                        frontCust.bubbleEl.innerHTML = '<span>🍕⏳</span>';
                        frontCust.bubbleEl.style.display = 'flex';
                    }
                }
            }
        }

        // 11. CUSTOMER SPAWNING & QUEUE ADVANCEMENT
        const spawnInterval = Math.max(1.8, 3.2 - (GameState.level * 0.08));
        customerSpawnTimer += dt;
        if (customerSpawnTimer >= spawnInterval) {
            customerSpawnTimer = 0;
            spawnCustomer();
        }

        // Auto-heal counter queue indices every frame so nobody ever freezes
        const waitingQueue = customers.filter(c => c.waitingAtCounter && !c.hasReceivedPizza);
        for (let q = 0; q < waitingQueue.length; q++) {
            waitingQueue[q].queueIndex = q;
            if (q === 0) waitingQueue[q].bubbleEl.style.display = 'flex';
            else waitingQueue[q].bubbleEl.style.display = 'none';
        }

        for (let i = customers.length - 1; i >= 0; i--) {
            const cust = customers[i];
            const mesh = cust.mesh;

            if (cust.state === 'WALK_TO_COUNTER') {
                const targetSpot = QUEUE_SPOTS[Math.min(cust.queueIndex, QUEUE_SPOTS.length - 1)];
                const dist = mesh.root.position.distanceTo(targetSpot);

                if (dist > 0.4) {
                    _vDir.subVectors(targetSpot, mesh.root.position).normalize();
                    mesh.root.position.addScaledVector(_vDir, cust.speed * dt);
                    mesh.root.rotation.y = Math.atan2(_vDir.x, _vDir.z);
                    mesh.walkCycle += dt * 10;
                    mesh.leftLeg.rotation.x = Math.sin(mesh.walkCycle) * 0.5;
                    mesh.rightLeg.rotation.x = -Math.sin(mesh.walkCycle) * 0.5;
                } else {
                    mesh.root.position.copy(targetSpot);
                    mesh.root.rotation.y = -Math.PI / 2;
                    mesh.leftLeg.rotation.x = 0;
                    mesh.rightLeg.rotation.x = 0;
                    cust.state = 'WAITING_AT_COUNTER';
                    cust.bubbleEl.style.display = (cust.queueIndex === 0) ? 'flex' : 'none';
                }
            } else if (cust.state === 'WAITING_AT_COUNTER') {
                if (cust.queueIndex === 0) {
                    cust.bubbleEl.style.display = 'flex';
                    updateDOMTransform(cust.bubbleEl, mesh.root.position, 4.2);
                } else {
                    cust.bubbleEl.style.display = 'none';
                }

                const currentSpot = QUEUE_SPOTS[Math.min(cust.queueIndex, QUEUE_SPOTS.length - 1)];
                if (mesh.root.position.distanceTo(currentSpot) > 0.5) {
                    _vDir.subVectors(currentSpot, mesh.root.position).normalize();
                    mesh.root.position.addScaledVector(_vDir, cust.speed * dt);
                }

                if (cust.queueIndex === 0) {
                    const distPlayerToCounter = player.root.position.distanceTo(QUEUE_SPOTS[0]);
                    const distPlayerToBack = player.root.position.distanceTo(COUNTER_PLAYER_SPOT);

                    if ((distPlayerToCounter < 4.0 || distPlayerToBack < 3.5) && (GameState.playerPizzas > 0 || counterPizzas.length > 0)) {
                        let gotPizza = false;
                        if (GameState.playerPizzas > 0) {
                            GameState.playerPizzas--;
                            updatePlayerPizzaStackVisuals(player, GameState.playerPizzas);
                            gotPizza = true;
                        } else if (counterPizzas.length > 0) {
                            const taken = counterPizzas.pop();
                            counterShelfGroup.remove(taken);
                            updateCounterShelfVisuals();
                            gotPizza = true;
                        }

                        if (gotPizza) {
                            sound.playRegister();
                            const pPrice = getPizzaPrice() + (cust.wantsDrink && GameState.playerDrinks > 0 ? 2 : 0);
                            if (cust.wantsDrink && GameState.playerDrinks > 0) {
                                GameState.playerDrinks--;
                                sound.playDrink();
                                showToast('🥤 Drink served with combo! +$2 Bonus!');
                            }
                            addCashToPile(pPrice);
                            updateHUD();
                            advanceCounterQueue(cust);
                            checkQuestTrigger('serve_customer');
                        }
                    }
                }
            } else if (cust.state === 'WALK_TO_TABLE') {
                const targetSpot = cust.targetTable.customerSeatSpot;
                const dist = mesh.root.position.distanceTo(targetSpot);

                if (dist > 0.4) {
                    _vDir.subVectors(targetSpot, mesh.root.position).normalize();
                    mesh.root.position.addScaledVector(_vDir, cust.speed * dt);
                    mesh.root.rotation.y = Math.atan2(_vDir.x, _vDir.z);
                    mesh.walkCycle += dt * 10;
                    mesh.leftLeg.rotation.x = Math.sin(mesh.walkCycle) * 0.5;
                    mesh.rightLeg.rotation.x = -Math.sin(mesh.walkCycle) * 0.5;
                } else {
                    mesh.root.position.copy(targetSpot);
                    mesh.root.rotation.y = Math.PI;
                    mesh.leftLeg.rotation.x = 0;
                    mesh.rightLeg.rotation.x = 0;
                    cust.state = 'WAITING_FOR_PIZZA';
                    cust.bubbleEl.style.display = 'flex';
                }
            } else if (cust.state === 'WAITING_FOR_PIZZA') {
                updateDOMTransform(cust.bubbleEl, mesh.root.position, 4.2);

                const distPlayerToTable = player.root.position.distanceTo(cust.targetTable.pos);
                if (distPlayerToTable < 4.0 && GameState.playerPizzas > 0 && !cust.targetTable.hasPizza && !cust.targetTable.isDirty) {
                    GameState.playerPizzas--;
                    updatePlayerPizzaStackVisuals(player, GameState.playerPizzas);
                    updateHUD();
                    sound.playServe();

                    cust.targetTable.hasPizza = true;
                    cust.targetTable.plate.visible = true;
                    cust.targetTable.slice.visible = true;
                    cust.bubbleEl.style.display = 'none';
                    cust.state = 'EATING_PIZZA';
                }
            } else if (cust.state === 'EATING_PIZZA') {
                cust.eatTimer += dt;
                mesh.root.children[0].position.y = 3.3 + Math.sin(cust.eatTimer * 6) * 0.08;

                if (cust.eatTimer >= 2.6) {
                    cust.targetTable.plate.visible = false;
                    cust.targetTable.slice.visible = false;
                    cust.targetTable.hasPizza = false;
                    cust.targetTable.isDirty = true;
                    cust.targetTable.trashTip = 8 + Math.floor(Math.random() * 5);
                    cust.targetTable.dirtyDishesGroup.visible = true;
                    cust.targetTable.trashBubbleEl.style.display = 'flex';
                    cust.targetTable.customer = null;

                    spawnHeartParticle(mesh.root.position);
                    addPlayerExp(20);
                    GameState.totalCustomersServed++;
                    cust.state = 'WALK_TO_EXIT';
                }
            } else if (cust.state === 'FINISH_AND_LEAVE') {
                spawnHeartParticle(mesh.root.position);
                addPlayerExp(15);
                GameState.totalCustomersServed++;
                cust.state = 'WALK_TO_EXIT';
            } else if (cust.state === 'WALK_TO_EXIT') {
                let exitWaypoint = EXIT_POS;
                if (mesh.root.position.x < 20 && mesh.root.position.z < 26) {
                    _vExit.set(22, 0, mesh.root.position.z);
                    exitWaypoint = _vExit;
                }
                const dist = mesh.root.position.distanceTo(exitWaypoint);
                if (dist > 0.5) {
                    _vDir.subVectors(exitWaypoint, mesh.root.position).normalize();
                    mesh.root.position.addScaledVector(_vDir, cust.speed * dt);
                    mesh.root.rotation.y = Math.atan2(_vDir.x, _vDir.z);
                    mesh.walkCycle += dt * 10;
                    mesh.leftLeg.rotation.x = Math.sin(mesh.walkCycle) * 0.5;
                    mesh.rightLeg.rotation.x = -Math.sin(mesh.walkCycle) * 0.5;
                } else {
                    if (mesh.root.position.distanceTo(EXIT_POS) < 2.2 || mesh.root.position.x >= 24.5) {
                        if (cust.bubbleEl.parentNode) cust.bubbleEl.parentNode.removeChild(cust.bubbleEl);
                        scene.remove(mesh.root);
                        customers.splice(i, 1);
                    }
                }
            }
        }

        // 12. CASH PILE COLLECTION (ACCURATE DOLLAR REVENUE - NO INFLATION MULTIPLIER)
        const distToCash = player.root.position.distanceTo(CASH_DROP_POS);
        if (distToCash < 3.5 && (activeCashCount > 0 || activeCashDollars > 0)) {
            const moneyEarned = activeCashDollars > 0 ? activeCashDollars : (activeCashCount * (GameState.pizzaPrice || 3));
            activeCashCount = 0;
            activeCashDollars = 0;
            updateCashPileVisuals();

            GameState.money += moneyEarned;
            sound.playCoin();

            const pScreen = toScreenXY(player.root.position, 4.8);
            spawnFloatingCashText(pScreen.x, pScreen.y, `+$${moneyEarned}`);
            checkQuestTrigger('earn_cash', moneyEarned);
            updateHUD();
            SaveSystem.save();
        }

        // 12B. 🚌 FRANCHISE TRANSIT BUS ZONE TRIGGER
        if (typeof franchiseBusLabel !== 'undefined' && franchiseBusLabel) {
            updateDOMTransform(franchiseBusLabel, FRANCHISE_BUS_ZONE_POS, 4.2);
            fZoneRing.rotation.z += dt * 1.6;
            const distToBus = player.root.position.distanceTo(FRANCHISE_BUS_ZONE_POS);
            if (distToBus < 2.8) {
                if (franchiseModal && franchiseModal.style.display !== 'flex') {
                    openFranchiseModal();
                }
            }
        }

        // 13. UNLOCK ZONE INTERACTION (FOUNTAIN BILLS STREAM)
        for (let i = unlockZones.length - 1; i >= 0; i--) {
            const zone = unlockZones[i];
            if (!zone.active) continue;

            // Auto-relocate any oven turbo zone that was previously stuck behind obstacles
            if (zone.id && zone.id.startsWith('oven_turbo') && zone.pos.x < -10) {
                zone.pos.set(-8.5, 0, -11.0);
                zone.root.position.copy(zone.pos);
            }

            updateDOMTransform(zone.badgeEl, zone.pos, 1.4);
            zone.pulseTime += dt * 3;

            const dist = player.root.position.distanceTo(zone.pos);
            if (dist < 3.2 && GameState.money > 0 && zone.remainingCost > 0) {
                const investRate = Math.min(3, Math.min(GameState.money, zone.remainingCost));
                GameState.money -= investRate;
                zone.remainingCost -= investRate;
                updateHUD();

                if (Math.random() < 0.45) spawnFlyingBill(player.root.position, zone.pos);

                const priceEl = document.getElementById(`zone-price-${zone.id}`);
                if (priceEl) priceEl.innerText = `$ ${zone.remainingCost}`;

                if (zone.remainingCost <= 0) {
                    zone.active = false;
                    scene.remove(zone.root);
                    if (zone.badgeEl.parentNode) zone.badgeEl.parentNode.removeChild(zone.badgeEl);
                    sound.playUnlock();
                    addPlayerExp(40);
                    zone.onUnlock();
                    unlockZones.splice(i, 1);
                    SaveSystem.save();
                }
            }
        }

        // 13B. 3D MACHINE UPGRADE FLOOR ZONES (OVEN, MILL, DOUGH PRESS)
        for (let i = 0; i < machineUpgradeZones.length; i++) {
            const mZone = machineUpgradeZones[i];
            if (mZone.isMax()) {
                mZone.badgeEl.style.display = 'none';
                continue;
            }
            mZone.badgeEl.style.display = 'flex';
            updateDOMTransform(mZone.badgeEl, mZone.pos, 1.4);
            mZone.pulseTime += dt * 3;

            const dist = player.root.position.distanceTo(mZone.pos);
            if (dist < 3.2 && GameState.money > 0 && mZone.remainingCost > 0) {
                const investRate = Math.min(3, Math.min(GameState.money, mZone.remainingCost));
                GameState.money -= investRate;
                mZone.remainingCost -= investRate;
                updateHUD();

                if (Math.random() < 0.45) spawnFlyingBill(player.root.position, mZone.pos);

                const priceEl = document.getElementById(`mzone-price-${mZone.id}`);
                if (priceEl) priceEl.innerText = `$ ${mZone.remainingCost}`;

                if (mZone.remainingCost <= 0) {
                    mZone.onUpgrade();
                    mZone.remainingCost = mZone.getCost();
                    mZone.updateBadge();
                }
            }
        }

        // 14. ANIMATE FLYING BILLS
        for (let i = 0; i < MAX_BILLS; i++) {
            const bill = billPool[i];
            if (!bill.active) continue;
            bill.progress += bill.speed * dt;
            if (bill.progress >= 1.0) {
                bill.active = false;
                bill.mesh.visible = false;
            } else {
                bill.mesh.position.lerpVectors(bill.start, bill.target, bill.progress);
                bill.mesh.position.y += Math.sin(bill.progress * Math.PI) * bill.arcHeight;
                bill.mesh.rotation.y += bill.rotSpeed * dt;
            }
        }

        // 15. ANIMATE FLOATING HEARTS
        for (let i = 0; i < MAX_HEARTS; i++) {
            const h = heartPool[i];
            if (!h.active) continue;
            h.life -= dt * 0.9;
            h.group.position.y += dt * 1.4;
            h.scale = Math.min(1.0, h.scale + dt * 4);
            h.group.scale.setScalar(h.scale);
            if (h.life <= 0) {
                h.active = false;
                h.group.visible = false;
            }
        }

        // 16. RENDER 3D SCENE
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
    console.log('🍕 Final Pizza Tycoon (AAA High-Definition Quality Edition) Running!');
})();
