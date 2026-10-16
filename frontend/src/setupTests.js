import '@testing-library/jest-dom';

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
global.IntersectionObserver = MockIntersectionObserver;

window.matchMedia = window.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}

jest.mock('three', () => {
  function MockObject3D() {
    this.position = { set: jest.fn(), x: 0, y: 0, z: 0 };
    this.rotation = { set: jest.fn(), x: 0, y: 0, z: 0 };
    this.scale = { set: jest.fn(), setScalar: jest.fn(), x: 1, y: 1, z: 1 };
    this.add = jest.fn();
    this.remove = jest.fn();
    this.dispose = jest.fn();
    this.lookAt = jest.fn();
  }

  function MockRenderer() {
    this.setSize = jest.fn();
    this.setPixelRatio = jest.fn();
    this.setClearColor = jest.fn();
    this.render = jest.fn();
    this.dispose = jest.fn();
    this.domElement = typeof global.document !== 'undefined' ? global.document.createElement('canvas') : {};
    this.toneMapping = 0;
    this.toneMappingExposure = 1;
    this.outputColorSpace = '';
  }

  function MockGeometry() {
    this.dispose = jest.fn();
    this.scale = jest.fn();
  }

  function MockMaterial() {
    this.dispose = jest.fn();
  }

  return {
    Scene: MockObject3D,
    PerspectiveCamera: MockObject3D,
    WebGLRenderer: MockRenderer,
    Group: MockObject3D,
    CylinderGeometry: MockGeometry,
    BoxGeometry: MockGeometry,
    SphereGeometry: MockGeometry,
    TorusGeometry: MockGeometry,
    MeshStandardMaterial: MockMaterial,
    MeshPhysicalMaterial: MockMaterial,
    Mesh: MockObject3D,
    AmbientLight: MockObject3D,
    DirectionalLight: MockObject3D,
    PointLight: MockObject3D,
    Clock: function () { this.getElapsedTime = jest.fn(() => 0); },
    Color: function () {},
    ACESFilmicToneMapping: 4,
    SRGBColorSpace: 'srgb',
  };
});

jest.mock('lenis', () => {
  const MockLenis = jest.fn().mockImplementation(function () {
    return {
      raf: jest.fn(),
      destroy: jest.fn(),
      scrollTo: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };
  });
  MockLenis.default = MockLenis;
  return MockLenis;
});
