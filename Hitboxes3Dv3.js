(function(Scratch) {
  'use strict';

  /**
   * 🔥 3D Physics Engine MAX for TurboWarp
   * Complete Unity-like physics engine with 50+ blocks
   * Multi-language support: English & Russian (TurboWarp language)
   * Author: rakhimshirinov09-hue
   * Created: 2026-02-20
   * Modified: Added support for sphere, box, and mesh (OBJ) hitboxes, improved mesh performance with AABB, added JSON reporters
   */

  class TurboPhysicsEngineMAX {
    
    constructor() {
      // Language will be set from Scratch.vm.locale
      this.language = 'en';
      this.bodies = {};
      this.gravity = 0.3;
      this.dt = 0.016;
      this.timeScale = 1.0;
      
      this.rayResult = {
        hit: false,
        dist: 0,
        target: "",
        point: { x: 0, y: 0, z: 0 },
        normal: { x: 0, y: 0, z: 0 }
      };
      
      this.contacts = {};
      this.collisionPairs = [];
    }

    /**
     * Detect language from TurboWarp
     */
    _detectLanguage() {
      try {
        // Try to get language from Scratch.vm.locale
        if (typeof Scratch !== 'undefined' && Scratch.vm && Scratch.vm.locale) {
          const locale = Scratch.vm.locale.toLowerCase();
          if (locale.startsWith('ru')) return 'ru';
          if (locale.startsWith('en')) return 'en';
        }
      } catch (e) {
        // Fallback to browser language
      }
      
      // Fallback to browser language
      const browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
      return browserLang.startsWith('ru') ? 'ru' : 'en';
    }

    /**
     * Get text based on TurboWarp language
     */
    _getText(enText, ruText) {
      // Get current language from TurboWarp
      this.language = this._detectLanguage();
      return this.language === 'ru' ? ruText : enText;
    }

    /**
     * Get block text based on language
     */
    _getBlockText(key) {
      const blocks = {
        // TRANSFORM
        createObject: this._getText(
          '📦 create object [ID] type [TYPE] shape [SHAPE]',
          '📦 создать объект [ID] тип [TYPE] форма [SHAPE]'
        ),
        deleteObject: this._getText(
          '🗑️ delete object [ID]',
          '🗑️ удалить объект [ID]'
        ),
        setPosition: this._getText(
          '📍 set position [ID] x [X] y [Y] z [Z]',
          '📍 позиция [ID] x [X] y [Y] z [Z]'
        ),
        changePosition: this._getText(
          '➕ change position [ID] by x [X] y [Y] z [Z]',
          '➕ изменить позицию [ID] на x [X] y [Y] z [Z]'
        ),
        setRotation: this._getText(
          '🔄 rotation [ID] rx [RX] ry [RY] rz [RZ]',
          '🔄 вращение [ID] rx [RX] ry [RY] rz [RZ]'
        ),
        changeRotation: this._getText(
          '🔄➕ rotate [ID] by rx [RX] ry [RY] rz [RZ]',
          '🔄➕ повернуть [ID] на rx [RX] ry [RY] rz [RZ]'
        ),
        setSize: this._getText(
          '📏 size [ID] w [W] h [H] d [D]',
          '📏 размер [ID] w [W] h [H] d [D]'
        ),
        lookAt: this._getText(
          '👀 look at [ID] x [X] y [Y] z [Z]',
          '👀 смотреть [ID] на x [X] y [Y] z [Z]'
        ),
        getPosition: this._getText(
          '📍 position [ID] axis [AXIS]',
          '📍 позиция [ID] ось [AXIS]'
        ),
        getRotation: this._getText(
          '🔄 rotation [ID] axis [AXIS]',
          '🔄 поворот [ID] ось [AXIS]'
        ),
        getSize: this._getText(
          '📏 size [ID] axis [AXIS]',
          '📏 размер [ID] ось [AXIS]'
        ),
        getDistance: this._getText(
          '📏 distance between [ID1] and [ID2]',
          '📏 расстояние между [ID1] и [ID2]'
        ),
        
        // RIGIDBODY
        setMass: this._getText(
          '⚖️ mass [ID] [MASS]',
          '⚖️ масса [ID] [MASS]'
        ),
        getMass: this._getText(
          '⚖️ mass [ID]',
          '⚖️ масса [ID]'
        ),
        enableGravity: this._getText(
          '⬇️ enable gravity [ID]',
          '⬇️ включить гравитацию [ID]'
        ),
        disableGravity: this._getText(
          '⬆️ disable gravity [ID]',
          '⬆️ отключить гравитацию [ID]'
        ),
        addForce: this._getText(
          '💥 add force [ID] x [X] y [Y] z [Z]',
          '💥 добавить силу [ID] x [X] y [Y] z [Z]'
        ),
        addImpulse: this._getText(
          '⚡ impulse [ID] x [X] y [Y] z [Z]',
          '⚡ импульс [ID] x [X] y [Y] z [Z]'
        ),
        setVelocity: this._getText(
          '🎯 velocity [ID] x [X] y [Y] z [Z]',
          '🎯 скорость [ID] x [X] y [Y] z [Z]'
        ),
        getVelocity: this._getText(
          '🎯 velocity [ID] axis [AXIS]',
          '🎯 скорость [ID] ось [AXIS]'
        ),
        getSpeed: this._getText(
          '⏱️ total speed [ID]',
          '⏱️ полная скорость [ID]'
        ),
        addTorque: this._getText(
          '🌀 torque [ID] x [X] y [Y] z [Z]',
          '🌀 крутящий момент [ID] x [X] y [Y] z [Z]'
        ),
        freezeAxis: this._getText(
          '❄️ freeze [ID] axis [AXIS]',
          '❄️ заморозить [ID] ось [AXIS]'
        ),
        unfreezeAxis: this._getText(
          '🔥 unfreeze [ID] axis [AXIS]',
          '🔥 разморозить [ID] ось [AXIS]'
        ),
        setFriction: this._getText(
          '🧊 friction [ID] [FRICTION]',
          '🧊 трение [ID] [FRICTION]'
        ),
        setBounce: this._getText(
          '🎾 bounce [ID] [BOUNCE]',
          '🎾 упругость [ID] [BOUNCE]'
        ),
        
        // COLLISION
        isTouching: this._getText(
          '🔗 [ID1] touching [ID2]?',
          '🔗 [ID1] касается [ID2]?'
        ),
        isOnGround: this._getText(
          '🏔️ [ID] on ground?',
          '🏔️ [ID] на земле?'
        ),
        getTouchingObjects: this._getText(
          '📋 objects touching [ID]',
          '📋 объекты касающиеся [ID]'
        ),
        setColliderSize: this._getText(
          '📦 collider [ID] w [W] h [H] d [D]',
          '📦 коллайдер [ID] w [W] h [H] d [D]'
        ),
        getContactPoint: this._getText(
          '💥 contact point [ID1] [ID2] axis [AXIS]',
          '💥 точка контакта [ID1] [ID2] ось [AXIS]'
        ),
        getContactNormal: this._getText(
          '⬆️ contact normal [ID1] [ID2] axis [AXIS]',
          '⬆️ нормаль контакта [ID1] [ID2] ось [AXIS]'
        ),
        
        // RAYCAST
        raycastFromObject: this._getText(
          '🔫 raycast from [ID] distance [DIST]',
          '🔫 луч из [ID] длина [DIST]'
        ),
        raycastFromPosition: this._getText(
          '🔫 raycast from x [X] y [Y] z [Z] angle [RY] distance [DIST]',
          '🔫 луч из x [X] y [Y] z [Z] угол [RY] дальность [DIST]'
        ),
        raycastInDirection: this._getText(
          '🔫 raycast from [ID] vector [DX] [DY] [DZ] distance [DIST]',
          '🔫 луч из [ID] вектор [DX] [DY] [DZ] дальность [DIST]'
        ),
        rayHit: this._getText(
          '💥 raycast hit?',
          '💥 луч попал?'
        ),
        rayTarget: this._getText(
          '🎯 raycast target',
          '🎯 цель луча'
        ),
        rayDistance: this._getText(
          '📏 raycast distance',
          '📏 дистанция луча'
        ),
        rayPoint: this._getText(
          '📍 raycast point axis [AXIS]',
          '📍 точка луча ось [AXIS]'
        ),
        rayNormal: this._getText(
          '⬆️ raycast normal axis [AXIS]',
          '⬆️ нормаль луча ось [AXIS]'
        ),
        
        // CHARACTER CONTROLLER
        moveForward: this._getText(
          '⬆️ move [ID] forward [SPEED]',
          '⬆️ двигать [ID] вперёд [SPEED]'
        ),
        moveRight: this._getText(
          '➡️ move [ID] right [SPEED]',
          '➡️ двигать [ID] вправо [SPEED]'
        ),
        moveUp: this._getText(
          '⬆️ move [ID] up [SPEED]',
          '⬆️ двигать [ID] вверх [SPEED]'
        ),
        jump: this._getText(
          '⬆️ jump [ID] force [FORCE]',
          '⬆️ прыжок [ID] сила [FORCE]'
        ),
        setMaxSpeed: this._getText(
          '🚀 max speed [ID] [SPEED]',
          '🚀 макс скорость [ID] [SPEED]'
        ),
        setRotationLimit: this._getText(
          '🔒 rotation limit [ID] from [MIN] to [MAX]',
          '🔒 ограничение наклона [ID] от [MIN] до [MAX]'
        ),
        
        // SIMULATION
        step: this._getText(
          '⚙️ update physics',
          '⚙️ обсчитать физику'
        ),
        setTimeScale: this._getText(
          '⏱️ time speed [SCALE]',
          '⏱️ скорость времени [SCALE]'
        ),
        setGlobalGravity: this._getText(
          '🌍 gravity [G]',
          '🌍 гравитация [G]'
        ),
        exists: this._getText(
          '✅ object [ID] exists?',
          '✅ объект [ID] существует?'
        ),
        getObjectCount: this._getText(
          '📊 object count',
          '📊 количество объектов'
        ),
        deleteAll: this._getText(
          '🧹 delete all',
          '🧹 удалить всё'
        ),
        getType: this._getText(
          '📄 type [ID]',
          '📄 тип [ID]'
        ),
        getDirection: this._getText(
          '➡️ direction [ID] [DIR] axis [AXIS]',
          '➡️ направление [ID] [DIR] ось [AXIS]'
        ),
        loadMesh: this._getText(
          '📐 load mesh [ID] from OBJ [OBJ]',
          '📐 загрузить меш [ID] из OBJ [OBJ]'
        ),
        getAllObjectsJSON: this._getText(
          '📋 all objects JSON',
          '📋 все объекты JSON'
        ),
        getTouchingJSON: this._getText(
          '📋 touching [ID] JSON',
          '📋 касающиеся [ID] JSON'
        )
      };
      
      return blocks[key] || '';
    }

    /**
     * Get extension info for Scratch
     */
    getInfo() {
      const blocks = this._getBlockText.bind(this);
      
      return {
        id: 'turbophysicsenginemax',
        name: this._getText('🔥 3D Physics Engine MAX', '🔥 3D Physics Engine MAX'),
        color1: '#FF6B00',
        color2: '#FF8C00',
        color3: '#E55400',
        blocks: [
          
          // TRANSFORM BLOCKS (12)
          {
            opcode: 'createObject',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('createObject'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              TYPE: { type: Scratch.ArgumentType.STRING, menu: 'objTypes', defaultValue: 'dynamic' },
              SHAPE: { type: Scratch.ArgumentType.STRING, menu: 'shapes', defaultValue: 'box' }
            }
          },
          
          {
            opcode: 'deleteObject',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('deleteObject'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'setPosition',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setPosition'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'changePosition',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('changePosition'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'setRotation',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setRotation'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              RX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              RY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              RZ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'changeRotation',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('changeRotation'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              RX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              RY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              RZ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'setSize',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setSize'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              D: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          
          {
            opcode: 'lookAt',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('lookAt'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'getPosition',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getPosition'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'x' }
            }
          },
          
          {
            opcode: 'getRotation',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getRotation'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'rotAxes', defaultValue: 'ry' }
            }
          },
          
          {
            opcode: 'getSize',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getSize'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'sizeAxes', defaultValue: 'w' }
            }
          },
          
          {
            opcode: 'getDistance',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getDistance'),
            arguments: {
              ID1: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              ID2: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj2' }
            }
          },
          
          // RIGIDBODY BLOCKS (15)
          {
            opcode: 'setMass',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setMass'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              MASS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          
          {
            opcode: 'getMass',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getMass'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'enableGravity',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('enableGravity'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'disableGravity',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('disableGravity'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'addForce',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('addForce'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'addImpulse',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('addImpulse'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'setVelocity',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setVelocity'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'getVelocity',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getVelocity'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'x' }
            }
          },
          
          {
            opcode: 'getSpeed',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getSpeed'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'addTorque',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('addTorque'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          
          {
            opcode: 'freezeAxis',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('freezeAxis'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'y' }
            }
          },
          
          {
            opcode: 'unfreezeAxis',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('unfreezeAxis'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'y' }
            }
          },
          
          {
            opcode: 'setFriction',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setFriction'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              FRICTION: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.1 }
            }
          },
          
          {
            opcode: 'setBounce',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setBounce'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              BOUNCE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 }
            }
          },
          
          // COLLISION BLOCKS (8)
          {
            opcode: 'isTouching',
            blockType: Scratch.BlockType.BOOLEAN,
            text: blocks('isTouching'),
            arguments: {
              ID1: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              ID2: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj2' }
            }
          },
          
          {
            opcode: 'isOnGround',
            blockType: Scratch.BlockType.BOOLEAN,
            text: blocks('isOnGround'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'getTouchingObjects',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getTouchingObjects'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'setColliderSize',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setColliderSize'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              D: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          
          {
            opcode: 'getContactPoint',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getContactPoint'),
            arguments: {
              ID1: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              ID2: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj2' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'x' }
            }
          },
          
          {
            opcode: 'getContactNormal',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getContactNormal'),
            arguments: {
              ID1: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              ID2: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj2' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'y' }
            }
          },
          
          // RAYCAST BLOCKS (8)
          {
            opcode: 'raycastFromObject',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('raycastFromObject'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              DIST: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          
          {
            opcode: 'raycastFromPosition',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('raycastFromPosition'),
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              RY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              DIST: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          
          {
            opcode: 'raycastInDirection',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('raycastInDirection'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              DX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              DY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              DZ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              DIST: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          
          {
            opcode: 'rayHit',
            blockType: Scratch.BlockType.BOOLEAN,
            text: blocks('rayHit')
          },
          
          {
            opcode: 'rayTarget',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('rayTarget')
          },
          
          {
            opcode: 'rayDistance',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('rayDistance')
          },
          
          {
            opcode: 'rayPoint',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('rayPoint'),
            arguments: { AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'x' } }
          },
          
          {
            opcode: 'rayNormal',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('rayNormal'),
            arguments: { AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'y' } }
          },
          
          // CHARACTER CONTROLLER (6)
          {
            opcode: 'moveForward',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('moveForward'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'player' },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          
          {
            opcode: 'moveRight',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('moveRight'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'player' },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          
          {
            opcode: 'moveUp',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('moveUp'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'player' },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          
          {
            opcode: 'jump',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('jump'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'player' },
              FORCE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          
          {
            opcode: 'setMaxSpeed',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setMaxSpeed'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'player' },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          
          {
            opcode: 'setRotationLimit',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setRotationLimit'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'player' },
              MIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: -90 },
              MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 }
            }
          },
          
          // SIMULATION (8)
          {
            opcode: 'step',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('step')
          },
          
          {
            opcode: 'setTimeScale',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setTimeScale'),
            arguments: { SCALE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          },
          
          {
            opcode: 'setGlobalGravity',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('setGlobalGravity'),
            arguments: { G: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 } }
          },
          
          {
            opcode: 'exists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: blocks('exists'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'getObjectCount',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getObjectCount')
          },
          
          {
            opcode: 'deleteAll',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('deleteAll')
          },
          
          {
            opcode: 'getType',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getType'),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' } }
          },
          
          {
            opcode: 'getDirection',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getDirection'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              DIR: { type: Scratch.ArgumentType.STRING, menu: 'directions', defaultValue: 'forward' },
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'axes', defaultValue: 'x' }
            }
          },

          // NEW BLOCK FOR MESH
          {
            opcode: 'loadMesh',
            blockType: Scratch.BlockType.COMMAND,
            text: blocks('loadMesh'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' },
              OBJ: { type: Scratch.ArgumentType.STRING, defaultValue: 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3' }
            }
          },

          // NEW JSON REPORTERS
          {
            opcode: 'getAllObjectsJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getAllObjectsJSON')
          },
          
          {
            opcode: 'getTouchingJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: blocks('getTouchingJSON'),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'obj1' }
            }
          }
        ],
        
        menus: {
          objTypes: ['dynamic', 'static', 'kinematic'],
          shapes: ['box', 'sphere', 'mesh'],
          axes: ['x', 'y', 'z'],
          rotAxes: ['rx', 'ry', 'rz'],
          sizeAxes: ['w', 'h', 'd'],
          directions: ['forward', 'back', 'right', 'left', 'up', 'down']
        }
      };
    }

    // ========== MATHEMATICS UTILITIES ==========
    
    _normalize(v) {
      const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      if (len < 0.00001) return { x: 0, y: 0, z: 0 };
      return { x: v.x / len, y: v.y / len, z: v.z / len };
    }

    _dot(a, b) {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    _cross(a, b) {
      return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
      };
    }

    _length(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    _distanceSquared(p1, p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;
      return dx * dx + dy * dy + dz * dz;
    }

    _distance(p1, p2) {
      return Math.sqrt(this._distanceSquared(p1, p2));
    }

    _clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    _normalizeAngle(angle) {
      return ((angle % 360) + 360) % 360;
    }

    // ========== BODY MANAGEMENT ==========

    _ensureBody(id) {
      const strId = String(id);
      if (!this.bodies[strId]) {
        this.bodies[strId] = {
          id: strId,
          type: 'dynamic',
          colliderType: 'box',
          x: 0, y: 0, z: 0,
          rx: 0, ry: 0, rz: 0,
          vx: 0, vy: 0, vz: 0,
          wx: 0, wy: 0, wz: 0,
          w: 10, h: 10, d: 10,
          radius: 5,
          vertices: [],
          faces: [],
          aabbMin: {x: -5, y: -5, z: -5},
          aabbMax: {x: 5, y: 5, z: 5},
          ox: 0, oy: 0, oz: 0,
          mass: 1,
          useGravity: true,
          friction: 0.1,
          bounce: 0.5,
          freezeX: false,
          freezeY: false,
          freezeZ: false,
          maxSpeed: 50,
          rotLimit: [-90, 90],
          wasOnGround: false,
          isOnGround: false
        };
      }
      return this.bodies[strId];
    }

    // ========== COLLISION DETECTION ==========

    _checkAABBOverlap(b1, b2) {
      const min1 = {x: b1.x + b1.aabbMin.x, y: b1.y + b1.aabbMin.y, z: b1.z + b1.aabbMin.z};
      const max1 = {x: b1.x + b1.aabbMax.x, y: b1.y + b1.aabbMax.y, z: b1.z + b1.aabbMax.z};
      const min2 = {x: b2.x + b2.aabbMin.x, y: b2.y + b2.aabbMin.y, z: b2.z + b2.aabbMin.z};
      const max2 = {x: b2.x + b2.aabbMax.x, y: b2.y + b2.aabbMax.y, z: b2.z + b2.aabbMax.z};
      return (min1.x < max2.x && max1.x > min2.x) &&
             (min1.y < max2.y && max1.y > min2.y) &&
             (min1.z < max2.z && max1.z > min2.z);
    }

    _checkSphereCollision(b1, b2) {
      return this._distance(b1, b2) < (b1.radius + b2.radius);
    }

    _checkSphereBox(sphere, box) {
      const closest = {
        x: this._clamp(sphere.x, box.x + box.aabbMin.x, box.x + box.aabbMax.x),
        y: this._clamp(sphere.y, box.y + box.aabbMin.y, box.y + box.aabbMax.y),
        z: this._clamp(sphere.z, box.z + box.aabbMin.z, box.z + box.aabbMax.z)
      };
      const dist = this._distance(sphere, closest);
      return dist < sphere.radius;
    }

    _checkCollision(b1, b2) {
      let type1 = b1.colliderType;
      let type2 = b2.colliderType;
      if (type1 === 'mesh') type1 = 'box'; // Use AABB for mesh
      if (type2 === 'mesh') type2 = 'box';

      if (type1 === 'box' && type2 === 'box') {
        return this._checkAABBOverlap(b1, b2);
      } else if (type1 === 'sphere' && type2 === 'sphere') {
        return this._checkSphereCollision(b1, b2);
      } else if (type1 === 'sphere' && type2 === 'box') {
        return this._checkSphereBox(b1, b2);
      } else if (type1 === 'box' && type2 === 'sphere') {
        return this._checkSphereBox(b2, b1);
      }
      return false;
    }

    _getAABBOverlapAmount(b1, b2) {
      const min1 = {x: b1.x + b1.aabbMin.x, y: b1.y + b1.aabbMin.y, z: b1.z + b1.aabbMin.z};
      const max1 = {x: b1.x + b1.aabbMax.x, y: b1.y + b1.aabbMax.y, z: b1.z + b1.aabbMax.z};
      const min2 = {x: b2.x + b2.aabbMin.x, y: b2.y + b2.aabbMin.y, z: b2.z + b2.aabbMin.z};
      const max2 = {x: b2.x + b2.aabbMax.x, y: b2.y + b2.aabbMax.y, z: b2.z + b2.aabbMax.z};

      const ox = Math.max(0, Math.min(max1.x, max2.x) - Math.max(min1.x, min2.x));
      const oy = Math.max(0, Math.min(max1.y, max2.y) - Math.max(min1.y, min2.y));
      const oz = Math.max(0, Math.min(max1.z, max2.z) - Math.max(min1.z, min2.z));

      return {x: ox, y: oy, z: oz, minAxis: this._getMinAxis(ox, oy, oz)};
    }

    _getMinAxis(x, y, z) {
      if (x <= y && x <= z) return 'x';
      if (y <= z) return 'y';
      return 'z';
    }

    _getManifold(b1, b2) {
      let type1 = b1.colliderType;
      let type2 = b2.colliderType;
      if (type1 === 'mesh') type1 = 'box';
      if (type2 === 'mesh') type2 = 'box';

      if (type1 === 'box' && type2 === 'box') {
        const overlap = this._getAABBOverlapAmount(b1, b2);
        if (overlap.x === 0 || overlap.y === 0 || overlap.z === 0) return null;
        const axis = overlap.minAxis;
        const penetration = overlap[axis];
        const sign = Math.sign(b2[axis] - b1[axis]);
        const normal = {x: 0, y: 0, z: 0};
        normal[axis] = sign;
        const point = {x: (b1.x + b2.x)/2, y: (b1.y + b2.y)/2, z: (b1.z + b2.z)/2};
        return {penetration, normal, point};
      } else if (type1 === 'sphere' && type2 === 'sphere') {
        const dist = this._distance(b1, b2);
        const penetration = b1.radius + b2.radius - dist;
        if (penetration <= 0) return null;
        const normal = this._normalize({x: b2.x - b1.x, y: b2.y - b1.y, z: b2.z - b1.z});
        const point = {
          x: b1.x + normal.x * b1.radius,
          y: b1.y + normal.y * b1.radius,
          z: b1.z + normal.z * b1.radius
        };
        return {penetration, normal, point};
      } else if (type1 === 'sphere' && type2 === 'box') {
        return this._getSphereBoxManifold(b1, b2);
      } else if (type1 === 'box' && type2 === 'sphere') {
        const m = this._getSphereBoxManifold(b2, b1);
        if (!m) return null;
        m.normal = {x: -m.normal.x, y: -m.normal.y, z: -m.normal.z};
        return m;
      }
      return null;
    }

    _getSphereBoxManifold(sphere, box) {
      const closest = {
        x: this._clamp(sphere.x, box.x + box.aabbMin.x, box.x + box.aabbMax.x),
        y: this._clamp(sphere.y, box.y + box.aabbMin.y, box.y + box.aabbMax.y),
        z: this._clamp(sphere.z, box.z + box.aabbMin.z, box.z + box.aabbMax.z)
      };
      const dist = this._distance(sphere, closest);
      if (dist >= sphere.radius) return null;
      const penetration = sphere.radius - dist;
      const normalVec = {x: sphere.x - closest.x, y: sphere.y - closest.y, z: sphere.z - closest.z};
      const normal = dist > 0 ? this._normalize(normalVec) : {x: 0, y: 1, z: 0};
      const point = closest;
      return {penetration, normal, point};
    }

    _getDirection(obj, dir) {
      const ry = obj.ry * Math.PI / 180;
      const rx = obj.rx * Math.PI / 180;
      
      const dirMap = {
        forward: { 
          x: Math.cos(ry) * Math.cos(rx), 
          y: Math.sin(rx), 
          z: Math.sin(ry) * Math.cos(rx) 
        },
        back: { 
          x: -Math.cos(ry) * Math.cos(rx), 
          y: -Math.sin(rx), 
          z: -Math.sin(ry) * Math.cos(rx) 
        },
        right: { 
          x: Math.sin(ry), 
          y: 0, 
          z: -Math.cos(ry) 
        },
        left: { 
          x: -Math.sin(ry), 
          y: 0, 
          z: Math.cos(ry) 
        },
        up: { x: 0, y: 1, z: 0 },
        down: { x: 0, y: -1, z: 0 }
      };
      
      return dirMap[dir] || dirMap.forward;
    }

    // ========== TRANSFORM COMMANDS ==========

    createObject(args) {
      const id = String(args.ID);
      const body = this._ensureBody(id);
      body.type = String(args.TYPE) || 'dynamic';
      body.colliderType = String(args.SHAPE) || 'box';
      if (body.colliderType === 'sphere') {
        body.radius = 5;
        body.aabbMin = {x: -5, y: -5, z: -5};
        body.aabbMax = {x: 5, y: 5, z: 5};
      } else if (body.colliderType === 'mesh') {
        body.vertices = [];
        body.faces = [];
        body.aabbMin = {x: Infinity, y: Infinity, z: Infinity};
        body.aabbMax = {x: -Infinity, y: -Infinity, z: -Infinity};
      } else {
        body.aabbMin = {x: -5, y: -5, z: -5};
        body.aabbMax = {x: 5, y: 5, z: 5};
      }
    }

    deleteObject(args) {
      delete this.bodies[String(args.ID)];
    }

    setPosition(args) {
      const b = this._ensureBody(String(args.ID));
      b.x = Number(args.X) || 0;
      b.y = Number(args.Y) || 0;
      b.z = Number(args.Z) || 0;
    }

    changePosition(args) {
      const b = this._ensureBody(String(args.ID));
      b.x += Number(args.X) || 0;
      b.y += Number(args.Y) || 0;
      b.z += Number(args.Z) || 0;
    }

    setRotation(args) {
      const b = this._ensureBody(String(args.ID));
      b.rx = this._normalizeAngle(Number(args.RX) || 0);
      b.ry = this._normalizeAngle(Number(args.RY) || 0);
      b.rz = this._normalizeAngle(Number(args.RZ) || 0);
    }

    changeRotation(args) {
      const b = this._ensureBody(String(args.ID));
      b.rx = this._normalizeAngle(b.rx + (Number(args.RX) || 0));
      b.ry = this._normalizeAngle(b.ry + (Number(args.RY) || 0));
      b.rz = this._normalizeAngle(b.rz + (Number(args.RZ) || 0));
    }

    setSize(args) {
      const b = this._ensureBody(String(args.ID));
      if (b.colliderType === 'sphere') {
        b.radius = Math.max(0.01, Number(args.W) || 5);
        const r = b.radius;
        b.aabbMin = {x: -r, y: -r, z: -r};
        b.aabbMax = {x: r, y: r, z: r};
      } else if (b.colliderType === 'box') {
        b.w = Math.max(0.01, Number(args.W) || 10);
        b.h = Math.max(0.01, Number(args.H) || 10);
        b.d = Math.max(0.01, Number(args.D) || 10);
        b.aabbMin = {x: -b.w/2, y: -b.h/2, z: -b.d/2};
        b.aabbMax = {x: b.w/2, y: b.h/2, z: b.d/2};
      } else if (b.colliderType === 'mesh' && b.vertices.length > 0) {
        const oldW = b.aabbMax.x - b.aabbMin.x;
        const oldH = b.aabbMax.y - b.aabbMin.y;
        const oldD = b.aabbMax.z - b.aabbMin.z;
        const scaleX = (Number(args.W) || oldW) / oldW;
        const scaleY = (Number(args.H) || oldH) / oldH;
        const scaleZ = (Number(args.D) || oldD) / oldD;
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let v of b.vertices) {
          v.x *= scaleX;
          v.y *= scaleY;
          v.z *= scaleZ;
          minX = Math.min(minX, v.x);
          minY = Math.min(minY, v.y);
          minZ = Math.min(minZ, v.z);
          maxX = Math.max(maxX, v.x);
          maxY = Math.max(maxY, v.y);
          maxZ = Math.max(maxZ, v.z);
        }
        b.aabbMin = {x: minX, y: minY, z: minZ};
        b.aabbMax = {x: maxX, y: maxY, z: maxZ};
        b.w = maxX - minX;
        b.h = maxY - minY;
        b.d = maxZ - minZ;
      }
    }

    lookAt(args) {
      const b = this._ensureBody(String(args.ID));
      const tx = Number(args.X) - b.x;
      const ty = Number(args.Y) - b.y;
      const tz = Number(args.Z) - b.z;
      
      const horizontalDist = Math.sqrt(tx * tx + tz * tz);
      
      b.ry = this._normalizeAngle(Math.atan2(tz, tx) * 180 / Math.PI - 90);
      b.rx = this._normalizeAngle(Math.atan2(ty, horizontalDist) * 180 / Math.PI);
    }

    getPosition(args) {
      const b = this._ensureBody(String(args.ID));
      const axis = String(args.AXIS).toLowerCase();
      return b[axis] !== undefined ? b[axis] : 0;
    }

    getRotation(args) {
      const b = this._ensureBody(String(args.ID));
      const axis = String(args.AXIS).toLowerCase();
      return b[axis] !== undefined ? b[axis] : 0;
    }

    getSize(args) {
      const b = this._ensureBody(String(args.ID));
      const axis = String(args.AXIS).toLowerCase();
      if (b.colliderType === 'sphere') {
        return b.radius;
      } else {
        return b[axis] !== undefined ? b[axis] : 10;
      }
    }

    getDistance(args) {
      const b1 = this._ensureBody(String(args.ID1));
      const b2 = this._ensureBody(String(args.ID2));
      return this._distance(b1, b2);
    }

    // ========== RIGIDBODY COMMANDS ==========

    setMass(args) {
      const b = this._ensureBody(String(args.ID));
      b.mass = Math.max(0.001, Number(args.MASS) || 1);
    }

    getMass(args) {
      const b = this._ensureBody(String(args.ID));
      return b.mass;
    }

    enableGravity(args) {
      const b = this._ensureBody(String(args.ID));
      b.useGravity = true;
    }

    disableGravity(args) {
      const b = this._ensureBody(String(args.ID));
      b.useGravity = false;
    }

    addForce(args) {
      const b = this._ensureBody(String(args.ID));
      if (b.type === 'static') return;
      
      const fx = Number(args.X) || 0;
      const fy = Number(args.Y) || 0;
      const fz = Number(args.Z) || 0;
      const mass = b.mass || 1;
      
      b.vx += (fx / mass) * this.dt * this.timeScale;
      b.vy += (fy / mass) * this.dt * this.timeScale;
      b.vz += (fz / mass) * this.dt * this.timeScale;
    }

    addImpulse(args) {
      const b = this._ensureBody(String(args.ID));
      if (b.type === 'static') return;
      
      b.vx += Number(args.X) || 0;
      b.vy += Number(args.Y) || 0;
      b.vz += Number(args.Z) || 0;
    }

    setVelocity(args) {
      const b = this._ensureBody(String(args.ID));
      b.vx = Number(args.X) || 0;
      b.vy = Number(args.Y) || 0;
      b.vz = Number(args.Z) || 0;
    }

    getVelocity(args) {
      const b = this._ensureBody(String(args.ID));
      const axis = 'v' + String(args.AXIS).toLowerCase();
      return b[axis] !== undefined ? b[axis] : 0;
    }

    getSpeed(args) {
      const b = this._ensureBody(String(args.ID));
      return Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
    }

    addTorque(args) {
      const b = this._ensureBody(String(args.ID));
      if (b.type === 'static') return;
      
      const tx = Number(args.X) || 0;
      const ty = Number(args.Y) || 0;
      const tz = Number(args.Z) || 0;
      const mass = b.mass || 1;
      
      const factor = (this.dt * this.timeScale) / (mass * 100);
      b.wx += tx * factor;
      b.wy += ty * factor;
      b.wz += tz * factor;
    }

    freezeAxis(args) {
      const b = this._ensureBody(String(args.ID));
      const axis = 'freeze' + String(args.AXIS).toUpperCase();
      b[axis] = true;
    }

    unfreezeAxis(args) {
      const b = this._ensureBody(String(args.ID));
      const axis = 'freeze' + String(args.AXIS).toUpperCase();
      b[axis] = false;
    }

    setFriction(args) {
      const b = this._ensureBody(String(args.ID));
      b.friction = this._clamp(Number(args.FRICTION) || 0.1, 0, 1);
    }

    setBounce(args) {
      const b = this._ensureBody(String(args.ID));
      b.bounce = this._clamp(Number(args.BOUNCE) || 0.5, 0, 1);
    }

    // ========== COLLISION COMMANDS ==========

    isTouching(args) {
      const b1 = this.bodies[String(args.ID1)];
      const b2 = this.bodies[String(args.ID2)];
      
      if (!b1 || !b2) return false;
      return this._checkCollision(b1, b2);
    }

    isOnGround(args) {
      const b = this._ensureBody(String(args.ID));
      let halfHeight = (b.aabbMax.y - b.aabbMin.y) / 2 + 0.1;
      this._performRaycast(b.x, b.y, b.z, 0, -1, 0, halfHeight, String(args.ID));
      return this.rayResult.hit;
    }

    getTouchingObjects(args) {
      const b = this._ensureBody(String(args.ID));
      const touching = [];
      
      for (const id in this.bodies) {
        if (id === String(args.ID)) continue;
        if (this._checkCollision(b, this.bodies[id])) {
          touching.push(id);
        }
      }
      
      return touching.length > 0 ? touching.join(', ') : '';
    }

    setColliderSize(args) {
      this.setSize(args);
    }

    getContactPoint(args) {
      const key = [String(args.ID1), String(args.ID2)].sort().join('|');
      if (!this.contacts[key]) return 0;
      return this.contacts[key].point[String(args.AXIS)] || 0;
    }

    getContactNormal(args) {
      const key = [String(args.ID1), String(args.ID2)].sort().join('|');
      if (!this.contacts[key]) return 0;
      return this.contacts[key].normal[String(args.AXIS)] || 0;
    }

    // ========== RAYCAST COMMANDS ==========

    raycastFromObject(args) {
      const b = this._ensureBody(String(args.ID));
      const dist = Number(args.DIST) || 100;
      const ry = b.ry * Math.PI / 180;
      const rx = b.rx * Math.PI / 180;
      const dx = Math.cos(ry) * Math.cos(rx);
      const dy = Math.sin(rx);
      const dz = Math.sin(ry) * Math.cos(rx);
      const dir = this._normalize({x: dx, y: dy, z: dz});
      this._performRaycast(b.x, b.y, b.z, dir.x, dir.y, dir.z, dist, String(args.ID));
    }

    raycastFromPosition(args) {
      const x = Number(args.X) || 0;
      const y = Number(args.Y) || 0;
      const z = Number(args.Z) || 0;
      const ry = Number(args.RY) || 0;
      const dist = Number(args.DIST) || 100;
      
      const ryRad = ry * Math.PI / 180;
      const dx = Math.cos(ryRad);
      const dz = Math.sin(ryRad);
      const dir = this._normalize({x: dx, y: 0, z: dz});
      this._performRaycast(x, y, z, dir.x, dir.y, dir.z, dist, null);
    }

    raycastInDirection(args) {
      const b = this._ensureBody(String(args.ID));
      const dx = Number(args.DX) || 1;
      const dy = Number(args.DY) || 0;
      const dz = Number(args.DZ) || 0;
      const dist = Number(args.DIST) || 100;
      
      const dir = this._normalize({ x: dx, y: dy, z: dz });
      this._performRaycast(b.x, b.y, b.z, dir.x, dir.y, dir.z, dist, String(args.ID));
    }

    _performRaycast(ox, oy, oz, dx, dy, dz, maxDist, ignoreID) {
      let closest = Infinity;
      let hitID = "";
      let hit = false;
      let hitPoint = { x: 0, y: 0, z: 0 };
      let hitNormal = { x: 0, y: 0, z: 0 };

      const origin = { x: ox, y: oy, z: oz };
      const dir = { x: dx, y: dy, z: dz };

      for (const id in this.bodies) {
        if (id === ignoreID) continue;
        const b = this.bodies[id];
        const result = this._rayIntersect(b, origin, dir, maxDist);
        if (result && result.dist < closest) {
          closest = result.dist;
          hitID = id;
          hit = true;
          hitPoint = result.point;
          hitNormal = result.normal;
        }
      }

      this.rayResult = { hit, dist: closest === Infinity ? 0 : closest, target: hitID, point: hitPoint, normal: hitNormal };
    }

    _rayIntersect(b, origin, dir, maxDist) {
      if (b.colliderType === 'box') {
        return this._rayAABBIntersect(origin, dir, b, maxDist);
      } else if (b.colliderType === 'sphere') {
        return this._raySphere(origin, dir, b, maxDist);
      } else if (b.colliderType === 'mesh') {
        return this._rayMesh(origin, dir, b, maxDist);
      }
      return null;
    }

    _rayAABBIntersect(origin, dir, b, maxDist) {
      const min = { x: b.x + b.aabbMin.x, y: b.y + b.aabbMin.y, z: b.z + b.aabbMin.z };
      const max = { x: b.x + b.aabbMax.x, y: b.y + b.aabbMax.y, z: b.z + b.aabbMax.z };

      let tmin = 0;
      let tmax = maxDist;

      const axes = ['x', 'y', 'z'];
      for (let i = 0; i < 3; i++) {
        const axis = axes[i];
        if (Math.abs(dir[axis]) < 0.0001) {
          if (origin[axis] < min[axis] || origin[axis] > max[axis]) return null;
        } else {
          let t1 = (min[axis] - origin[axis]) / dir[axis];
          let t2 = (max[axis] - origin[axis]) / dir[axis];
          if (t1 > t2) [t1, t2] = [t2, t1];
          tmin = Math.max(tmin, t1);
          tmax = Math.min(tmax, t2);
          if (tmin > tmax) return null;
        }
      }

      if (tmin < 0) return null;
      const hitDist = tmin;
      const hitPoint = { x: origin.x + dir.x * hitDist, y: origin.y + dir.y * hitDist, z: origin.z + dir.z * hitDist };

      const epsilon = 0.001;
      const normal = { x: 0, y: 0, z: 0 };
      if (Math.abs(hitPoint.x - min.x) < epsilon) normal.x = -1;
      else if (Math.abs(hitPoint.x - max.x) < epsilon) normal.x = 1;
      else if (Math.abs(hitPoint.y - min.y) < epsilon) normal.y = -1;
      else if (Math.abs(hitPoint.y - max.y) < epsilon) normal.y = 1;
      else if (Math.abs(hitPoint.z - min.z) < epsilon) normal.z = -1;
      else if (Math.abs(hitPoint.z - max.z) < epsilon) normal.z = 1;

      return { dist: hitDist, point: hitPoint, normal };
    }

    _raySphere(origin, dir, sphere, maxDist) {
      const oc = { x: origin.x - sphere.x, y: origin.y - sphere.y, z: origin.z - sphere.z };
      const a = this._dot(dir, dir);
      const b = 2 * this._dot(dir, oc);
      const c = this._dot(oc, oc) - sphere.radius * sphere.radius;
      const disc = b * b - 4 * a * c;
      if (disc < 0) return null;
      let t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t < 0) t = (-b + Math.sqrt(disc)) / (2 * a);
      if (t < 0 || t > maxDist) return null;
      const point = { x: origin.x + dir.x * t, y: origin.y + dir.y * t, z: origin.z + dir.z * t };
      const normal = this._normalize({ x: point.x - sphere.x, y: point.y - sphere.y, z: point.z - sphere.z });
      return { dist: t, point, normal };
    }

    _rayMesh(origin, dir, b, maxDist) {
      const aabbResult = this._rayAABBIntersect(origin, dir, b, maxDist);
      if (!aabbResult) return null;

      let minT = maxDist;
      let hitPoint = null;
      let hitNormal = null;
      for (let f of b.faces) {
        const v0 = { x: b.x + b.vertices[f.a].x, y: b.y + b.vertices[f.a].y, z: b.z + b.vertices[f.a].z };
        const v1 = { x: b.x + b.vertices[f.b].x, y: b.y + b.vertices[f.b].y, z: b.z + b.vertices[f.b].z };
        const v2 = { x: b.x + b.vertices[f.c].x, y: b.y + b.vertices[f.c].y, z: b.z + b.vertices[f.c].z };
        const t = this._rayTriangle(origin, dir, v0, v1, v2);
        if (t !== null && t < minT && t > 0) {
          minT = t;
          hitPoint = { x: origin.x + dir.x * t, y: origin.y + dir.y * t, z: origin.z + dir.z * t };
          const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
          const edge2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };
          let n = this._cross(edge1, edge2);
          n = this._normalize(n);
          if (this._dot(n, dir) > 0) {
            n.x = -n.x;
            n.y = -n.y;
            n.z = -n.z;
          }
          hitNormal = n;
        }
      }
      if (hitPoint) return { dist: minT, point: hitPoint, normal: hitNormal };
      return null;
    }

    _rayTriangle(rayOrigin, rayDir, v0, v1, v2) {
      const epsilon = 0.000001;
      const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
      const edge2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };
      const h = this._cross(rayDir, edge2);
      const a = this._dot(edge1, h);
      if (a > -epsilon && a < epsilon) return null;
      const f = 1 / a;
      const s = { x: rayOrigin.x - v0.x, y: rayOrigin.y - v0.y, z: rayOrigin.z - v0.z };
      const u = f * this._dot(s, h);
      if (u < 0 || u > 1) return null;
      const q = this._cross(s, edge1);
      const v = f * this._dot(rayDir, q);
      if (v < 0 || u + v > 1) return null;
      const t = f * this._dot(edge2, q);
      if (t < epsilon) return null;
      return t;
    }

    rayHit() { return this.rayResult.hit; }
    rayTarget() { return this.rayResult.target; }
    rayDistance() { return this.rayResult.dist; }
    rayPoint(args) { return this.rayResult.point[String(args.AXIS)] || 0; }
    rayNormal(args) { return this.rayResult.normal[String(args.AXIS)] || 0; }

    // ========== CHARACTER CONTROLLER ==========

    moveForward(args) {
      const b = this._ensureBody(String(args.ID));
      const speed = Number(args.SPEED) || 5;
      const ry = b.ry * Math.PI / 180;
      
      b.vx = Math.cos(ry) * speed;
      b.vz = Math.sin(ry) * speed;
    }

    moveRight(args) {
      const b = this._ensureBody(String(args.ID));
      const speed = Number(args.SPEED) || 5;
      const ry = b.ry * Math.PI / 180;
      
      b.vx += Math.sin(ry) * speed;
      b.vz -= Math.cos(ry) * speed;
    }

    moveUp(args) {
      const b = this._ensureBody(String(args.ID));
      b.vy = Number(args.SPEED) || 5;
    }

    jump(args) {
      const b = this._ensureBody(String(args.ID));
      if (this.isOnGround({ ID: String(args.ID) })) {
        b.vy = Number(args.FORCE) || 10;
      }
    }

    setMaxSpeed(args) {
      const b = this._ensureBody(String(args.ID));
      b.maxSpeed = Math.max(0.1, Number(args.SPEED) || 20);
    }

    setRotationLimit(args) {
      const b = this._ensureBody(String(args.ID));
      const min = Number(args.MIN) || -90;
      const max = Number(args.MAX) || 90;
      b.rotLimit = [Math.min(min, max), Math.max(min, max)];
    }

    // ========== PHYSICS SIMULATION ==========

    step() {
      const dt = this.dt * this.timeScale;
      
      // Apply gravity
      for (const id in this.bodies) {
        const b = this.bodies[id];
        if (b.type === 'static' || !b.useGravity) continue;
        b.vy -= this.gravity * dt;
      }
      
      // Update positions
      for (const id in this.bodies) {
        const b = this.bodies[id];
        if (b.type === 'static') continue;
        
        if (!b.freezeX) b.x += b.vx * dt;
        if (!b.freezeY) b.y += b.vy * dt;
        if (!b.freezeZ) b.z += b.vz * dt;
        
        // Apply friction
        b.vx *= 1 - b.friction * dt;
        b.vy *= 1 - b.friction * dt;
        b.vz *= 1 - b.friction * dt;
        
        // Update rotation
        b.rx = this._normalizeAngle(b.rx + b.wx * dt);
        b.ry = this._normalizeAngle(b.ry + b.wy * dt);
        b.rz = this._normalizeAngle(b.rz + b.wz * dt);
        
        // Angular friction
        b.wx *= 0.95;
        b.wy *= 0.95;
        b.wz *= 0.95;
        
        // Speed limit
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
        if (speed > b.maxSpeed) {
          const factor = b.maxSpeed / speed;
          b.vx *= factor;
          b.vy *= factor;
          b.vz *= factor;
        }
      }
      
      // Collision detection
      this.contacts = {};
      const ids = Object.keys(this.bodies);
      
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const id1 = ids[i];
          const id2 = ids[j];
          const b1 = this.bodies[id1];
          const b2 = this.bodies[id2];
          
          const manifold = this._getManifold(b1, b2);
          if (!manifold) continue;
          
          const key = [id1, id2].sort().join('|');
          this.contacts[key] = {
            point: manifold.point,
            normal: manifold.normal
          };
          
          // Response
          if (b1.type !== 'static' && b2.type !== 'static') {
            const m1 = b1.mass || 1;
            const m2 = b2.mass || 1;
            const ratio1 = m2 / (m1 + m2);
            const ratio2 = m1 / (m1 + m2);
            const sep = manifold.penetration + 0.001;
            b1.x -= manifold.normal.x * sep * ratio1;
            b1.y -= manifold.normal.y * sep * ratio1;
            b1.z -= manifold.normal.z * sep * ratio1;
            b2.x += manifold.normal.x * sep * ratio2;
            b2.y += manifold.normal.y * sep * ratio2;
            b2.z += manifold.normal.z * sep * ratio2;
          } else if (b1.type === 'static') {
            b2.x += manifold.normal.x * (manifold.penetration + 0.001);
            b2.y += manifold.normal.y * (manifold.penetration + 0.001);
            b2.z += manifold.normal.z * (manifold.penetration + 0.001);
          } else {
            b1.x -= manifold.normal.x * (manifold.penetration + 0.001);
            b1.y -= manifold.normal.y * (manifold.penetration + 0.001);
            b1.z -= manifold.normal.z * (manifold.penetration + 0.001);
          }
        }
      }
    }

    setTimeScale(args) {
      this.timeScale = Math.max(0, Number(args.SCALE) || 1);
    }

    setGlobalGravity(args) {
      this.gravity = Number(args.G) || 0.3;
    }

    exists(args) {
      return !!this.bodies[String(args.ID)];
    }

    getObjectCount() {
      return Object.keys(this.bodies).length;
    }

    deleteAll() {
      this.bodies = {};
      this.contacts = {};
      this.collisionPairs = [];
    }

    getType(args) {
      const b = this._ensureBody(String(args.ID));
      return b.type;
    }

    getDirection(args) {
      const b = this._ensureBody(String(args.ID));
      const dir = this._getDirection(b, String(args.DIR));
      return dir[String(args.AXIS)] || 0;
    }

    // ========== MESH LOADING ==========

    loadMesh(args) {
      const b = this._ensureBody(String(args.ID));
      b.colliderType = 'mesh';
      b.vertices = [];
      b.faces = [];
      const lines = String(args.OBJ).split('\n');
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('v ')) {
          const parts = line.split(/\s+/).slice(1).map(Number);
          const x = parts[0] || 0;
          const y = parts[1] || 0;
          const z = parts[2] || 0;
          b.vertices.push({ x, y, z });
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          minZ = Math.min(minZ, z);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);
        } else if (line.startsWith('f ')) {
          const parts = line.split(/\s+/).slice(1).map(p => parseInt(p.split('/')[0]) - 1);
          if (parts.length >= 3) {
            b.faces.push({ a: parts[0], b: parts[1], c: parts[2] });
          }
        }
      }

      // Center vertices
      if (b.vertices.length > 0) {
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        minX = Infinity; minY = Infinity; minZ = Infinity;
        maxX = -Infinity; maxY = -Infinity; maxZ = -Infinity;
        for (let v of b.vertices) {
          v.x -= centerX;
          v.y -= centerY;
          v.z -= centerZ;
          minX = Math.min(minX, v.x);
          minY = Math.min(minY, v.y);
          minZ = Math.min(minZ, v.z);
          maxX = Math.max(maxX, v.x);
          maxY = Math.max(maxY, v.y);
          maxZ = Math.max(maxZ, v.z);
        }
        b.x += centerX;
        b.y += centerY;
        b.z += centerZ;
        b.aabbMin = {x: minX, y: minY, z: minZ};
        b.aabbMax = {x: maxX, y: maxY, z: maxZ};
        b.w = maxX - minX;
        b.h = maxY - minY;
        b.d = maxZ - minZ;
      }
    }

    // ========== JSON REPORTERS ==========

    getAllObjectsJSON() {
      return JSON.stringify(Object.keys(this.bodies));
    }

    getTouchingJSON(args) {
      const b = this._ensureBody(String(args.ID));
      const touching = [];
      
      for (const id in this.bodies) {
        if (id === String(args.ID)) continue;
        if (this._checkCollision(b, this.bodies[id])) {
          touching.push(id);
        }
      }
      
      return JSON.stringify(touching);
    }
  }

  // Register extension
  Scratch.extensions.register(new TurboPhysicsEngineMAX());

})(Scratch);