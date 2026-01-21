import kaplay from "kaplay";
import "kaplay/global";

function getQueryParams(score) {
  const queryParams = new URLSearchParams(window.location.search);

  if (score) {
    let scoreValid = Number(score)
    if (scoreValid) {
      queryParams.set('score', Number(score).toString());
    }
  }
  return queryParams.toString();
}

// Set high score before the game run loop starts
let highScore = localStorage.getItem("highScore") || 0
localStorage.setItem("highScore", highScore)

// Purple palette - Snyk brand guidelines (for game-over text and UI)
SNYK_COLOR_PURPLE = [68, 28, 153];        // #441C99 - brand purple
SNYK_COLOR_PURPLE_LIGHT = [107, 61, 196]; // #6B3DC4 - light purple
SNYK_COLOR_PURPLE_DARK = [46, 17, 102];   // #2E1166 - dark purple
SNYK_COLOR_PURPLE_DEEP = [26, 11, 61];    // #1A0B3D - deep purple
SNYK_COLOR_ORANGE = [244, 143, 177];
// UI box and text colors for start/end screens
SNYK_COLOR_BOX_DARK = [120, 42, 65];      // #782A41 - dark box background
SNYK_COLOR_PINK = [249, 122, 153];        // #F97A99 - pink text accent
SNYK_COLOR_ELECTRIC_BLUE = [20, 93, 235]; // #145DEB - electric blue button fill
SNYK_COLOR_CYAN = [20, 196, 235];         // #14C4EB - cyan accent line

// initialize context
kaplay({
  crisp: false,
  width: 1080,
  height: 720,
  background: [211, 92, 121],  // #D35C79 - pink to match registration page
  scale: 1,
  letterbox: true,  // Properly handles scaling and mouse coordinates when canvas is resized
  canvas: document.getElementById('game'),
})

loadFont("apl386", "/fonts/apl386.ttf");
loadFont('jersey', '/fonts/Jersey10-Regular.ttf');

loadSprite("background", "sprites/bg-snyk-terrain.png")

// Cloud sprites for background parallax effect
loadSprite("cloud1", "sprites/cloud1.png")
loadSprite("cloud2", "sprites/cloud2.png")

loadSprite('share-linkedin', 'sprites/8bit-li.png')
loadSprite('share-twitter', 'sprites/8bit-tw.png')
loadSprite('share-bluesky', 'sprites/8bit-bs.svg')

loadSprite("background-menu", "sprites/bg-snyk-menu.png")


loadSprite('logo-small', 'sprites/vuln-vortex-logo.png')
loadSprite("logo", "sprites/fetch-the-flag-ctf-logo.svg")
loadSprite("intro-players", "sprites/Group1327.png")

// Work created by me
loadPedit("npmbox", "sprites/npmbox-animated.pedit")
loadPedit("npmbox-dev", "sprites/npmbox-dev.pedit");
loadPedit("rail", "sprites/rail.pedit")
loadPedit("rail2", "sprites/rail.pedit")

loadSprite("Patch-Jumper", "sprites/power-up.png")
loadSprite("Mode-protected", "sprites/protected.png");
loadSprite("Mode-filterdevs", "sprites/ai-fix.png");

// official Snyk source
loadSprite("dog", "sprites/player.png", {
  sliceX: 3,
  sliceY: 2,
  anims: {
    idle: {
      from: 0, to: 0
    },
    run: {
      from: 0, to: 2, loop: true
    }
  }
})

// source music from mixkit: https://mixkit.co/free-stock-music/
loadSound("jump-fast", "sounds/fast-simple-chop-5-6270.mp3");
loadSound("score", "sounds/score.mp3");
loadSound("soundThunder", "sounds/mixkit-distant-thunder-explosion-1278.wav");
loadSound("soundPackageCollide", "sounds/mixkit-epic-impact-afar-explosion-2782.wav");
loadSound("soundItem1", "sounds/mixkit-fast-small-sweep-transition-166.wav");
loadSound("soundItem2", "sounds/mixkit-fairy-teleport-868.wav");
loadSound("soundItem3", "sounds/mixkit-magic-sparkle-whoosh-2350.wav");
loadSound("game-background-music2", "sounds/game-background-music2.mp3");
loadSound("game-nonplay", "sounds/deep-ambient-version-60s-9889.mp3");
const gameMusic = play('game-background-music2', {loop: true, volume: 0.3})
const soundThunder = play('soundThunder', {loop: false, volume: 0.6})

let gameMusicIntro

let score = 0
let packagesAnimType = 'regular'
let playerProtected = false
let devDepsCounter = 0

// jump mode:
const scorePhase1 = 1200
// protected mode:
const scorePhase2 = 2000
// devdeps:
const scorePhase3 = 2800
// currently unused:
// const scorePhase4 = 5000
// const scorePhase5 = 10000

const vulnerablePackagesList = [
  {
    name: 'node-forge',
    cve: 'CVE-2022-0122',
    vulnerability: 'Open Redirect',
    link: 'https://security.snyk.io/vuln/SNYK-JS-NODEFORGE-2330875',
  },
  {
    name: 'uppy',
    cve: 'CVE-2022-0086',
    vulnerability: 'Server-side Request Forgery',
    link: 'https://security.snyk.io/vuln/SNYK-JS-UPPY-2329723',
  },
  {
    name: 'mermaid',
    cve: 'CVE-2021-43861',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-MERMAID-2328372',
  },
  {
    name: 'momnet',
    cve: 'SNYK-JS-MOMNET-2324797',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-MOMNET-2324797',
  },
  {
    name: 'js-data',
    cve: 'CVE-2021-23574',
    vulnerability: 'Prototype Pollution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSDATA-1584361',
  },
  {
    name: 'json-2-csv',
    cve: 'SNYK-JS-JSON2CSV-1932013',
    vulnerability: 'CSV Injection',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSON2CSV-1932013',
  },
  {
    name: 'wafer-form',
    cve: 'SNYK-JS-WAFERFORM-2313722',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-WAFERFORM-2313722',
  },
  {
    name: 'md-to-pdf',
    cve: 'CVE-2021-23639',
    vulnerability: 'Remote Code Execution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-MDTOPDF-1657880',
  },
  {
    name: 'http-server-node',
    cve: 'CVE-2021-23797',
    vulnerability: 'Directory Traversal',
    link: 'https://security.snyk.io/vuln/SNYK-JS-HTTPSERVERNODE-1727656',
  },
  {
    name: 'next',
    cve: 'CVE-2021-43803',
    vulnerability: 'Denial of Service',
    link: 'https://security.snyk.io/vuln/SNYK-JS-NEXT-2312745',
  },
  {
    name: 'github-todos',
    cve: 'CVE-2021-44684',
    vulnerability: 'Command Injection',
    link: 'https://security.snyk.io/vuln/SNYK-JS-GITHUBTODOS-2311792',
  },
  {
    name: 'hexo',
    cve: 'CVE-2021-25987',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-HEXO-1932976',
  },
  {
    name: 'json-schema',
    cve: 'CVE-2021-3918',
    vulnerability: 'Prototype Pollution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSONSCHEMA-1920922',
  },
  {
    name: 'coa',
    cve: 'SNYK-JS-COA-1911118',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-COA-1911118',
  },
  {
    name: 'rc',
    cve: 'SNYK-JS-RC-1911120',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-RC-1911120',
  },
  {
    name: 'tinymce',
    cve: 'SNYK-JS-TINYMCE-1910225',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-TINYMCE-1910225',
  },
  {
    name: 'jquery-ui',
    cve: 'CVE-2021-41184',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JQUERYUI-1767175',
  },
  {
    name: 'fastify-static',
    cve: 'CVCVE-2021-2296E',
    vulnerability: 'Open Redirect',
    link: 'https://security.snyk.io/vuln/SNYK-JS-FASTIFYSTATIC-1728398',
  },
  {
    name: 'teddy',
    cve: 'CVE-2021-23447',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-TEDDY-1579557',
  },
  {
    name: 'marked',
    cve: 'CVE-2016-10531',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/npm:marked:20150520',
  },
  {
    name: 'dustjs-linkedin',
    cve: 'npm:dustjs-linkedin:20160819',
    vulnerability: 'Code Injection',
    link: 'https://security.snyk.io/vuln/npm:dustjs-linkedin:20160819',
  },
  {
    name: 'typeorm',
    cve: 'CVE-2020-8158',
    vulnerability: 'Prototype Pollution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-TYPEORM-590152',
  },
  {
    name: 'moment',
    cve: 'CVE-2017-18214',
    vulnerability: 'Regular Expression Denial of Service',
    link: 'https://security.snyk.io/vuln/npm:moment:20170905',
  },
  {
    name: 'react-bootstrap-table',
    cve: 'CVE-2021-23398',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-REACTBOOTSTRAPTABLE-1314285',
  },
  {
    name: 'react-tooltip',
    cve: 'SNYK-JS-REACTTOOLTIP-72363',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-REACTTOOLTIP-72363',
  },
  {
    name: 'react-svg',
    cve: 'npm:react-svg:20180427',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/npm:react-svg:20180427',
  },
  {
    name: 'jspdf',
    cve: 'CVE-2021-23353',
    vulnerability: 'Regular Expression Denial of Service',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSPDF-1073626',
  }
]

function createRandomPicker(array) {
  // Make a copy of the original array to avoid modifying it
  const originalArray = [...array];
  // Track items we've already picked
  let remainingItems = [...originalArray];

  return function() {
    // If we've used all items, reset the remaining items
    if (remainingItems.length === 0) {
      remainingItems = [...originalArray];
    }

    // Pick a random index from the remaining items
    const randomIndex = Math.floor(Math.random() * remainingItems.length);

    // Get the item at that index
    const selectedItem = remainingItems[randomIndex];

    // Remove the selected item from remaining items
    remainingItems.splice(randomIndex, 1);

    return selectedItem;
  };
}

const getRandomPackageData = createRandomPicker(vulnerablePackagesList);

function getPackageRandomSize() {
  return rand(0.7, 1.4)
}

scene("game", () => {
  let pageName = 'game';
  history.pushState({ scene: 'game' }, 'Vuln Vortex', '/game?' + getQueryParams())
  const url = new URL(window.location.href)
  window.dataLayer.push({
    'event': 'page_view',
    'page_category': pageName,
    'page_name': pageName,
    'page_type': pageName,
    'path': url.pathname,
    'referrer': document.referrer,
    'site_domain': url.hostname,
    'template_name': 'snyk.io',
    'url': url.href,
  });

  gameMusicIntro.stop()

  let SPAWN_PACKAGES_TOP_SPEED = 3.5
  gameMusic.play()

  let helpers = ['Patch-Jumper', 'Protected',  'Protected', 'Mode-filterdevs', 'Mode-filterdevs', 'Protected', 'Mode-filterdevs']
  score = 0
  playerProtected = false
  packagesAnimType = 'regular'

  let JUMP_FORCE = 785
  const FLOOR_HEIGHT = 60
  const MOVE_SPEED = 200
  
  // define gravity
	setGravity(2400)

  // add Snyk background
  add([
    sprite("background"),
    pos(0, 0),
    scale(0.50)
  ])

  // Cloud parallax system - slower movement creates depth effect
  const CLOUD_SPEED_MIN = 30
  const CLOUD_SPEED_MAX = 60
  const cloudTypes = ["cloud1", "cloud2"]

  function spawnCloud(initialX = null) {
    const cloudType = cloudTypes[randi(0, cloudTypes.length)]
    const cloudSpeed = rand(CLOUD_SPEED_MIN, CLOUD_SPEED_MAX)
    const cloudY = rand(40, 180)
    const cloudScale = rand(0.15, 0.3)
    const cloudOpacity = rand(0.5, 0.8)
    const startX = initialX !== null ? initialX : width() + rand(50, 150)

    add([
      sprite(cloudType),
      pos(startX, cloudY),
      move(LEFT, cloudSpeed),
      scale(cloudScale),
      opacity(cloudOpacity),
      "cloud",
    ])
  }

  // Spawn initial clouds at various positions across the screen
  for (let i = 0; i < 2; i++) {
    spawnCloud(rand(0, width()))
  }

  // Periodically spawn new clouds from the right
  loop(12, () => {
    spawnCloud()
  })

  // Clean up clouds that drift off-screen
  onUpdate("cloud", (cloud) => {
    if (cloud.pos.x < -200) {
      destroy(cloud)
      // Spawn a replacement cloud
      spawnCloud()
    }
  })

  const scoreLabel = add([
    text(score, {
      font: 'jersey',
    }),
    pos(24, 24),
    fixed()
  ])

  // increment score every frame
  onUpdate(() => {
    score++
    scoreLabel.text = score
  })

  // add the bottom solid platform
  platform = add([ 
    rect(width(), FLOOR_HEIGHT),
    pos(0, height() - FLOOR_HEIGHT),
    area(),
    body({ isStatic: true }),
    opacity(0),
  ])

  // add a character to screen
  const player = add([
    sprite("dog"),
    pos(80, 40),
    area(),
    body(),
    scale(1),
    "player",
  ])
  player.flipX = true
  
  // enable camera position movement
  // player.action(() => {
  // center camera to player
  // var currCam = camPos();
  // if (currCam.x < player.pos.x) {
  //     camPos(player.pos.x, currCam.y);
  //   }
  // });

  player.onGround(() => {
    player.play('run')
  });

  onDraw("player", () => {
    if (player.pos.x <0) {
      player.moveTo(0, player.pos.y)
    } else if (player.pos.x > width()-player.width) {
      player.moveTo(width()-player.width, player.pos.y)
    }
  })

  function jump() {
    if (player.isGrounded()) {
      play('jump-fast', {loop: false})
      player.jump(JUMP_FORCE)
      player.play('idle')
    }
  }

  onKeyPress("space", jump)
  onKeyPress("up", jump)
  onMousePress(jump)


  onKeyPress('right', () => {
    player.flipX = true
  })

  onKeyPress('left', () => {
    player.flipX = false
  })

  onKeyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  onKeyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  player.onCollide("package", (element) => {
    if (playerProtected !== true) {
      addKaboom(player.pos)
      play('soundPackageCollide', {loop: false})
      shake()
      go("lose", { packageInfo: element.packageInfo})
    }
  })

  player.onCollide("Patch-Jumper", (element) => {
    play('soundItem3', {loop: false})
    addKaboom(player.pos)
    shake()

    // upgrade the jump force!
    JUMP_FORCE = 1000
    
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Patch-Jumper')
    helpers.splice(helperIndex, 1)

    destroy(element)
  })

  player.onCollide("DevDeps", (element) => {
    addKaboom(player.pos)
    play('soundPackageCollide', {loop: false})
    shake()
    go("lose", { packageInfo: element.packageInfo})
  })

  player.onCollide("Mode-protected", (element) => {
    play('soundItem2', {loop: false})
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Protected')
    helpers.splice(helperIndex, 1)

    addKaboom(player.pos)
    shake(5)
    destroy(element)

    // new spawned packages should have the "weak" animation
    packagesAnimType = 'weak'
    playerProtected = true
    get('package').forEach((element) => {
      element.play(packagesAnimType);
    });
    // and after 5 seconds it expires back to "regular"
    wait(5, () => {
      packagesAnimType = 'regular'
      get('package').forEach((element) => {
        element.play(packagesAnimType);
      });
      playerProtected = false
    })
  })

  player.onCollide("Mode-filterdevs", (element) => {
    play('soundItem3', {loop: false})
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Mode-filterdevs')
    helpers.splice(helperIndex, 1)

    addKaboom(player.pos)
    shake(5)
    destroy(element)

    destroyAll("DevDeps")
  })

  let colorama = 0
  let coloramaIndex = [BLUE, MAGENTA]
  let radiusProtector = 40

  onDraw(() => {
    if (playerProtected) {
      drawCircle({
          pos: vec2(player.pos.x + 40, player.pos.y + 20),
          radius: radiusProtector,
          opacity: 0,
          outline: { color: coloramaIndex[colorama], width: 1 },
      })
    }
	})

  loop(0.1, () => {
    colorama = Number(!colorama)
    radiusProtector++
    if (radiusProtector >= 55) {
      radiusProtector = 45
    }
  })

  loop(5, () => {
    // Phase2 begins
    if (score >= scorePhase2) {
      if (helpers.includes('Protected')) {
        add([
          sprite("Mode-protected"),
          area(),
          anchor('botleft'),
          pos(width(), 80),
          move(LEFT, 130),
          "Mode-protected",
          fixed(),
          body({ isStatic: true }),
          scale(0.7),
          body()
        ])
      }
    }
    // Phase2 ends
  })

  // play thunder sound effect
  loop(15, () => {
    soundThunder.stop()
    soundThunder.play()
  })

  loop(4, () => {
    // Phase3 begins
    if (score >= scorePhase3 && devDepsCounter >= 6) {
      devDepsCounter = 0
      if (helpers.includes('Mode-filterdevs')) {
        add([
          sprite("Mode-filterdevs"),
          area(),
          anchor('botleft'),
          pos(width(), 80),
          move(LEFT, 150),
          "Mode-filterdevs",
          fixed(),
          body({ isStatic: true }),
          scale(2.5),
          body()
        ])
      }
    }
    // Phase3 ends
  })

  loop(1.7, () => {
    // Phase3 begins
    if (score >= scorePhase3) {
      if (helpers.includes('Mode-filterdevs')) {
        devDepsCounter++
        
        const randomPackage = getRandomPackageData()
        add([
          sprite("npmbox-dev"),
          area(),
          anchor('botleft'),
          pos(width(), height() - FLOOR_HEIGHT),
          move(LEFT, 150),
          "DevDeps",
          fixed(),
          body({ isStatic: true }),
          scale(0.5),
          { packageInfo: randomPackage }
        ])
      }
    }
    // Phase3 ends
  })

  let railTimeout = 1
  loop(1, () => {

    // if this helper doesn't exist in our array box, then it means the user
    // already took it. great for them, let's add some rails now to the screen
    if (!helpers.includes('Patch-Jumper')) {
      // print rails to the screen
      let randomNumber = randi(0, 30)

      if (railTimeout > 0) {
        railTimeout -= 1
        return
      }

      if (randomNumber % 5 === 0) {
        // on the first rail apperance we want to increase
        // the speed in which packages are being spawned
        SPAWN_PACKAGES_TOP_SPEED = 2.2

        railTimeout = 1
        add([
          sprite("rail2"),
          anchor('botleft'),
          pos(width() + 50, height() - (FLOOR_HEIGHT * 3)),
          move(LEFT, 180),
          "rail",
          scale(5),
          area(),
          fixed(),
          body({ isStatic: true })
        ])
      }
    }
  })

  loop(3, () => {
    // Phase1 begins
    if (score >= scorePhase1 && score <= scorePhase2) {
      // show the patch jumper helper
      if (helpers.includes('Patch-Jumper')) {
        const PatchJumper = add([
          sprite("Patch-Jumper"),
          area(),
          anchor('botleft'),
          pos(width(), height() - (FLOOR_HEIGHT * 2)),
          move(LEFT, 200),
          "Patch-Jumper",
          fixed(),
          body({ isStatic: true }),
          scale(0.5)
        ])
      }
    }
  })  

  onUpdate("Patch-Jumper", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("package", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("rail", (element) => {
    // scaled element to be 5x so need to account for bigger size
    // of just element.width
    if (element.pos.x < -300) {
      destroy(element)
    }
  })

  onUpdate("label", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("DevDeps", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("Mode-filterdevs", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("Mode-protected", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  function spawnPackages() {

    const randomPackage = getRandomPackageData()
    
    const npmPackage = add([
      sprite("npmbox", {anim: packagesAnimType}),
      area(),
      anchor('botleft'),
      pos(width(), height() - FLOOR_HEIGHT),
      move(LEFT, 240),
      "package",
      scale(1),
      { packageInfo: randomPackage },
    ])

    add([
      text(randomPackage.name, { size: '22', font: 'jersey' }),
      move(LEFT, 240),
      anchor('botleft'),
      color(255, 255, 255),
      'label',
      pos(width()-20, height() - 100),
      scale(getPackageRandomSize())
    ])

    wait(rand(0.8, SPAWN_PACKAGES_TOP_SPEED), () => {
      spawnPackages()
    })
  }

  spawnPackages()

}) //end game scene

scene("lose", ({packageInfo}) => {
  let pageName = 'game-over';
  history.pushState({ scene: 'lose' }, 'Vuln Vortex', '/game-over?' + getQueryParams())
  const url = new URL(window.location.href)
  window.dataLayer.push({
    'event': 'page_view',
    'page_category': pageName,
    'page_name': pageName,
    'page_type': pageName,
    'path': url.pathname,
    'referrer': document.referrer,
    'site_domain': url.hostname,
    'template_name': 'snyk.io',
    'url': url.href,
  });

  gameMusic.stop()
  gameMusicIntro.play()
  
  XPosStart = 80 * 3

  // add Snyk background - solid color rectangle matching registration page (#D35C79)
  add([
    rect(width(), height()),
    pos(0, 0),
    color(211, 92, 121),
  ])

  // Dark box behind content to make text pop
  add([
    rect(970, 650, { radius: 10 }),
    pos(XPosStart - 180, 50),
    color(...SNYK_COLOR_BOX_DARK),
    opacity(0.95),
  ])
  
  add([
    pos(XPosStart, 80),
    sprite("logo"),
    scale(0.18)
  ])

  const YPosStartText = 200
  add([
		text("GAME OVER", {
      size: 64,
      font: 'jersey',
    }),
    pos(XPosStart, YPosStartText),
    color(255, 255, 255)
	])

  const vulnTitle = String(packageInfo.vulnerability).toUpperCase()
  const vulnCVE = packageInfo.cve
  const vulnPackageName = packageInfo.name 
  const vulnURL = packageInfo.link

  if (score > parseInt(highScore)) {
    localStorage.setItem("highScore", score)
    highScore = score
  }

	add([
		text(`YOUR SCORE: ${score}`, {
      size: 36,
      font: 'jersey',
    }),
		pos(XPosStart, YPosStartText + 80),
    color(...SNYK_COLOR_PINK)
	])

  add([
    text(`HIGH SCORE: ${highScore}`, {
      size: 36,
      font: 'jersey',
    }),
    pos(XPosStart * 2, YPosStartText + 80),
    color(255, 255, 255)
  ])

  add([
		text(`SHARE ON:`, {
      size: 24,
      font: 'jersey',
    }),
		pos(XPosStart, YPosStartText + 135),
    color(255, 255, 255)
	])

  const btnShareLinkedIn = add([
    pos(XPosStart + 90, YPosStartText + 122),
    sprite("share-linkedin"),
    area(),
    scale(0.8)
  ])

  btnShareLinkedIn.onClick(() => {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://www.vulnvortex.com/api/invite${encodeURIComponent(`?${getQueryParams(score)}`)}`
    window.open(linkedInShareUrl, '_blank');
  });

  const btnShareTwitter = add([
    pos(XPosStart + 130, YPosStartText + 122),
    sprite("share-twitter"),
    area(),
    scale(0.8)
  ])

  btnShareTwitter.onClick(() => {
    window.open(`https://twitter.com/intent/tweet?text=I%20just%20scored%20${score}%20on%20Vuln%20Vortex%20game%20by%20@SnykSec%20%23vulnvortex%20%23snyk https://www.vulnvortex.com/api/invite?${getQueryParams(score)}`, '_blank');
  });

  const btnShareBluesky = add([
    pos(XPosStart + 180, YPosStartText + 133),
    sprite("share-bluesky"),
    area(),
    scale(0.8)
  ])

  btnShareBluesky.onClick(() => {
    window.open(`https://bsky.app/intent/compose?text=I%20just%20scored%20${score}%20on%20Vuln%20Vortex%20game%20by%20@SnykSec%20%23vulnvortex%20%23snyk%20https://www.vulnvortex.com/api/invite?${getQueryParams(score)}`, '_blank');
  });

  add([
		text(`------------------------------------------------------------`, {
      size: 22,
      font: 'jersey',
    }),
		pos(XPosStart, YPosStartText + 170),
    color(...SNYK_COLOR_PINK)
	])

  add([
    text(`Even NahamSec and Patch can't dodge every vulnerability :(\n\nPress SPACE to retry or click RESTART\n\nIn CTF competitions, knowing how to spot and exploit weaknesses\nis the difference between Game Over and the leaderboard.`, {
      font: 'jersey',
      size: 28,
      styles: {
        "orange": {
          color: rgb(...SNYK_COLOR_ORANGE),
        },
      }
    }),
		pos(XPosStart, YPosStartText + 200),
    area({ cursor: "pointer", height: 250 }),
    color(255, 255, 255)
	])

  add([
		text('Media assets credit to: opengameart.org, mixkit.co.', { font: 'jersey', size: 16 }),
		pos(XPosStart, height() / 2 + 320),
    color(...SNYK_COLOR_PINK)
	])

  const restartGame = () => {
    score = 0
    go("game")
  }

  const btnRestart = add([
    rect(150, 55, { fill: false }),
    pos(XPosStart + 80, YPosStartText + 432),
    area(),
    anchor("center"),
    outline(2, rgb(...SNYK_COLOR_PINK)),
    color(...SNYK_COLOR_PINK),
  ]);

  // add a child object that displays the text
  btnRestart.add([
      text('RESTART GAME', {
        size: 22,
        font: 'jersey',
      }),
      anchor("center"),
      color(255, 255, 255),
  ]);

  btnRestart.onClick(restartGame);

  const btnCTFWidth = 220
  const btnCTFHeight = 55
  const btnSeeVulnerability = add([
    rect(btnCTFWidth, btnCTFHeight, { radius: 4 }),
    pos(XPosStart + 290, YPosStartText + 432),
    area(),
    anchor("center"),
    color(...SNYK_COLOR_ELECTRIC_BLUE),
  ]);

  // Cyan bottom accent line
  add([
    rect(btnCTFWidth, 4),
    pos(XPosStart + 290, YPosStartText + 432 + btnCTFHeight/2 - 4),
    anchor("center"),
    color(...SNYK_COLOR_CYAN),
  ]);

  // add a child object that displays the text
  btnSeeVulnerability.add([
      text('Learn How to Solve CTFs', {
        size: 22,
        font: 'jersey',
      }),
      anchor("center"),
      color(255, 255, 255),
  ]);

  btnSeeVulnerability.onHoverUpdate(() => {
    btnSeeVulnerability.color = rgb(...SNYK_COLOR_CYAN);
    setCursor("pointer");
  });

  btnSeeVulnerability.onHoverEnd(() => {
    btnSeeVulnerability.color = rgb(...SNYK_COLOR_ELECTRIC_BLUE);
  });

  btnSeeVulnerability.onClick(() => window.open('https://go.snyk.io/0115-ctf-101-isc2.html', '_blank'));

  setTimeout(() => onKeyPress('space', restartGame), 2000);

})

scene('credits-0', () => {
  let pageName = 'intro';
  history.pushState({ scene: 'credits-0' }, 'Vuln Vortex', '/intro?' + getQueryParams())
  const url = new URL(window.location.href)
  window.dataLayer.push({
    'event': 'page_view',
    'page_category': pageName,
    'page_name': pageName,
    'page_type': pageName,
    'path': url.pathname,
    'referrer': document.referrer,
    'site_domain': url.hostname,
    'template_name': 'snyk.io',
    'url': url.href,
  });

  // add Snyk background - solid color rectangle matching registration page (#D35C79)
  add([
    rect(width(), height()),
    pos(0, 0),
    color(211, 92, 121),
  ])

  gameMusic.stop()
  soundThunder.stop()

  // Dark box behind logo and button to make them pop
  add([
    rect(850, 600, { radius: 10 }),
    pos(width()/2, height()/2),
    anchor('center'),
    color(...SNYK_COLOR_BOX_DARK),
    opacity(0.95),
  ])

  add([
    pos(width()/2 + 200, 380),
    sprite("intro-players"),
    scale(0.18)
  ])

  focus()

  add([
    pos(width()/2, height()/2 - 50),
    sprite("logo"),
    rotate(0),
    area(),
    anchor('center'),
    scale(0.5),
  ])

  const txt = 'PRESS SPACE TO START'
  const btnWidth = 250
  const btnHeight = 55
  const btn = add([
    rect(btnWidth, btnHeight, { radius: 4 }),
    pos(width()/2, height()/2 + 180),
    area(),
    scale(1),
    anchor("center"),
    color(...SNYK_COLOR_ELECTRIC_BLUE),
  ]);

  // Cyan bottom accent line
  add([
    rect(btnWidth, 4),
    pos(width()/2, height()/2 + 180 + btnHeight/2 - 4),
    anchor("center"),
    color(...SNYK_COLOR_CYAN),
  ]);

  // add a child object that displays the text
  btn.add([
      text(txt, {
        size: 20,
        font: 'jersey',
      }),
      anchor("center"),
      color(255, 255, 255),
  ]);

  btn.onHoverUpdate(() => {
    btn.color = rgb(...SNYK_COLOR_CYAN);
    setCursor("pointer");
  });

  btn.onHoverEnd(() => {
      btn.color = rgb(...SNYK_COLOR_ELECTRIC_BLUE);
  });

  btn.onClick(startGame);
  onKeyPress('space', startGame);

})

function startGame() {
  gameMusicIntro = play('game-nonplay', {loop: true, volume: 0.3})
  go('game');
}


go('credits-0')
