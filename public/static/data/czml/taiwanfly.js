const redFly = [
  {
    "description": "CZML Document",
    "id": "document",
    "name": 'red1',
    "availability": "2025-04-01T04:00:00Z/2025-06-01T14:00:00Z",
    "clock": {
      "currentTime": "2025-06-01T10:00:00",
      "multiplier": 1,
      "range": "LOOP_STOP",
      "interval": "2025-06-01T10:00:00/2025-06-01T20:00:00",
      "step": "SYSTEM_CLOCK_MULTIPLIER",//"SYSTEM_CLOCK",//"TICK_DEPENDENT",//"SYSTEM_CLOCK_MULTIPLIER"
    },
    "version": "1.0"
  },
  {
    "id": "red1",
    "model": {
      "gltf": 'static/data/gltf/B52.gltf',
      "scale": 8,
      "luminanceAtZenith": 1.0,
    },
    "orientation": {
      "velocityReference": "#position"
    },
    "path": {
      "show": false,
    },
    "position": {
      "interpolationAlgorithm": "LAGRANGE",
      "epoch": "2025-06-01T10:00:00",
      "cartographicDegrees": [
        0, 125.67075625347395, 23.970692813978705, 10000,
        3000, 121.66961224860133, 24.034142218604842, 10000,
      ],
      "interpolationDegree": 3
    },
    "properties": {
      airplaneAction: {
        side: 'red'
      }
    }
  },
]

const redFly1 = [
  {
    "description": "CZML Document",
    "id": "document",
    "name": 'fightRed1',
    "availability": "2025-04-01T04:00:00Z/2025-06-01T14:00:00Z",
    "clock": {
      "currentTime": "2025-06-01T10:00:00",
      "multiplier": 1,
      "range": "LOOP_STOP",
      "interval": "2025-06-01T10:00:00/2025-06-01T20:00:00",
      "step": "SYSTEM_CLOCK_MULTIPLIER",//"SYSTEM_CLOCK",//"TICK_DEPENDENT",//"SYSTEM_CLOCK_MULTIPLIER"
    },
    "version": "1.0"
  },
  {
    "id": "fightRed1",
    "model": {
      "gltf": 'static/data/gltf/B52.gltf',
      "scale": 10,
      "luminanceAtZenith": 1.0,
    },
    "path": {
      "show": false,
    },
    "orientation": {
      "velocityReference": "#position"
    },
    "position": {
      "interpolationAlgorithm": "LAGRANGE",
      "epoch": "2025-06-01T10:00:00",
      "cartographicDegrees": [
        0, 121.4011348476314, 23.54653267009182, 10000,
        20, 121.36590094547789, 23.615807929287868, 10000,
        40, 121.32559801541188, 23.687360502993222, 10000,
        60, 121.30034007989182, 23.74968884663625, 10000,
        80, 121.27245701674555, 23.827536820597256, 10000,
        100, 121.25720949665661, 23.885260876412662, 10000,
        120, 121.26714651023835, 23.929183825156386, 10000,
        140, 121.31733119941512, 23.98243336203016, 10000,
        160, 121.40281898806789, 24.019545545474084, 10000,
        180, 121.46070508592398, 24.017308938912386, 10000,
        200, 121.54120692314517, 24.042786238459602, 10000,
        220, 121.5410900199606, 24.098227258632853, 10000,
        240, 121.52090484491981, 24.160589659846394, 10000,
        260, 121.4881169045064, 24.199843259236413, 10000,
        280, 121.42002367192529, 24.229816831004424, 10000,
        300, 121.35193538666184, 24.236659520460137, 10000,
        320, 121.27411436526899, 24.107127416246502, 10000,
        340, 121.27427777893075, 24.044745364251575, 10000,
        360, 121.29955664721922, 24.003211877555888, 10000,
        380, 121.3877335126297, 23.950232885052387, 10000,
        400, 121.49843995052932, 23.906463006446163, 10000,
      ],
      "interpolationDegree": 6
    },
    "properties": {
      airplaneAction: {
        side: 'red'
      }
    }
  }
]

const blueFly = [
  {
    "description": "CZML Document",
    "id": "document",
    "name": 'blueFly',
    "availability": "2025-04-01T04:00:00Z/2025-06-01T14:00:00Z",
    "clock": {
      "currentTime": "2025-06-01T10:00:00",
      "multiplier": 1,
      "range": "LOOP_STOP",
      "interval": "2025-06-01T10:00:00/2025-06-01T20:00:00",
      "step": "SYSTEM_CLOCK_MULTIPLIER",//"SYSTEM_CLOCK",//"TICK_DEPENDENT",//"SYSTEM_CLOCK_MULTIPLIER"
    },
    "version": "1.0"
  },
  {
    "id": "blueFly",
    "model": {
      "gltf": 'static/data/gltf/B52.gltf',
      "scale": 10,
      "luminanceAtZenith": 1.0,
    },
    "path": {
      "show": false,
    },
    "orientation": {
      "velocityReference": "#position"
    },
    "position": {
      "interpolationAlgorithm": "LAGRANGE",
      "epoch": "2025-06-01T10:00:00",
      "cartographicDegrees": [
        0, 121.4011348476314, 23.54653267009182, 10000,
        30, 121.36590094547789, 23.615807929287868, 10000,
        50, 121.32559801541188, 23.687360502993222, 10000,
        70, 121.30034007989182, 23.74968884663625, 10000,
        90, 121.27245701674555, 23.827536820597256, 10000,
        110, 121.25720949665661, 23.885260876412662, 10000,
        130, 121.26714651023835, 23.929183825156386, 10000,
        150, 121.31733119941512, 23.98243336203016, 10000,
        170, 121.40281898806789, 24.019545545474084, 10000,
        190, 121.46070508592398, 24.017308938912386, 10000,
        210, 121.54120692314517, 24.042786238459602, 10000,
        230, 121.5410900199606, 24.098227258632853, 10000,
        250, 121.52090484491981, 24.160589659846394, 10000,
        270, 121.4881169045064, 24.199843259236413, 10000,
        290, 121.42002367192529, 24.229816831004424, 10000,
        310, 121.35193538666184, 24.236659520460137, 10000,
        330, 121.27411436526899, 24.107127416246502, 10000,
        350, 121.27427777893075, 24.044745364251575, 10000,
        370, 121.29955664721922, 24.003211877555888, 10000,
        390, 121.3877335126297, 23.950232885052387, 10000,
        410, 121.49843995052932, 23.906463006446163, 10000,
      ],
      "interpolationDegree": 6
    },
    "properties": {
      airplaneAction: {
        side: 'blue'
      }
    }
  }
]

export { redFly, redFly1, blueFly };