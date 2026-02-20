(function(Scratch) {
  'use strict';

  /**
   * 🔥 3D Physics Engine MAX for TurboWarp
   * Complete Unity-like physics engine with 50+ blocks
   * Multi-language support: English & Russian (TurboWarp language)
   * Author: rakhimshirinov09-hue
   * Created: 2026-02-20
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
          '📦 create object [ID] type [TYPE]',
          '📦 создать объект [ID] тип [TYPE]'
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
              TYPE: { type: Scratch.ArgumentType.STRING, menu: 'objTypes', defaultValue: 'dynamic' }
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
          }
        ],
        
        menus: {
          objTypes: ['dynamic', 'static', 'kinematic'],
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
          x: 0, y: 0, z: 0,
          rx: 0, ry: 0, rz: 0,
          vx: 0, vy: 0, vz: 0,
          wx: 0, wy: 0, wz: 0,
          w: 10, h: 10, d: 10,
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

    _checkAABBCollision(b1, b2) {
      return Math.abs(b1.x - b2.x) < (b1.w + b2.w) / 2 &&
             Math.abs(b1.y - b2.y) < (b1.h + b2.h) / 2 &&
             Math.abs(b1.z - b2.z) < (b1.d + b2.d) / 2;
    }

    _getAABBOverlap(b1, b2) {
      const dx = Math.abs(b1.x - b2.x);
      const dy = Math.abs(b1.y - b2.y);
      const dz = Math.abs(b1.z - b2.z);
      
      return {
        x: (b1.w + b2.w) / 2 - dx,
        y: (b1.h + b2.h) / 2 - dy,
        z: (b1.d + b2.d) / 2 - dz,
        minAxis: this._getMinAxis((b1.w + b2.w) / 2 - dx, (b1.h + b2.h) / 2 - dy, (b1.d + b2.d) / 2 - dz)
      };
    }

    _getMinAxis(x, y, z) {
      if (Math.abs(x) < Math.abs(y) && Math.abs(x) < Math.abs(z)) return 'x';
      if (Math.abs(y) < Math.abs(z)) return 'y';
      return 'z';
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
      b.w = Math.max(0.01, Number(args.W) || 10);
      b.h = Math.max(0.01, Number(args.H) || 10);
      b.d = Math.max(0.01, Number(args.D) || 10);
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
      return b[axis] !== undefined ? b[axis] : 10;
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
      return this._checkAABBCollision(b1, b2);
    }

    isOnGround(args) {
      const b = this._ensureBody(String(args.ID));
      const raycastDist = 0.1;
      
      for (const id in this.bodies) {
        if (id === String(args.ID)) continue;
        const other = this.bodies[id];
        
        if (b.y - b.h / 2 <= other.y + other.h / 2 + raycastDist &&
            b.y - b.h / 2 >= other.y + other.h / 2 - raycastDist &&
            Math.abs(other.x - b.x) < (other.w + b.w) / 2 &&
            Math.abs(other.z - b.z) < (other.d + b.d) / 2) {
          return true;
        }
      }
      
      return false;
    }

    getTouchingObjects(args) {
      const b = this._ensureBody(String(args.ID));
      const touching = [];
      
      for (const id in this.bodies) {
        if (id === String(args.ID)) continue;
        if (this._checkAABBCollision(b, this.bodies[id])) {
          touching.push(id);
        }
      }
      
      return touching.length > 0 ? touching.join(', ') : '';
    }

    setColliderSize(args) {
      const b = this._ensureBody(String(args.ID));
      b.w = Math.max(0.01, Number(args.W) || 10);
      b.h = Math.max(0.01, Number(args.H) || 10);
      b.d = Math.max(0.01, Number(args.D) || 10);
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
      
      const dx = Math.cos(ry);
      const dz = Math.sin(ry);
      
      this._performRaycast(b.x, b.y, b.z, dx, 0, dz, dist, String(args.ID));
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
      
      this._performRaycast(x, y, z, dx, 0, dz, dist, null);
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
      let closest = maxDist;
      let hitID = "";
      let hit = false;
      let hitPoint = { x: ox + dx * maxDist, y: oy + dy * maxDist, z: oz + dz * maxDist };
      let hitNormal = { x: 0, y: 1, z: 0 };
      
      for (const id in this.bodies) {
        if (id === ignoreID) continue;
        
        const b = this.bodies[id];
        const tx = b.x - ox;
        const ty = b.y - oy;
        const tz = b.z - oz;
        
        const proj = tx * dx + ty * dy + tz * dz;
        
        if (proj < 0 || proj > maxDist) continue;
        
        const px = ox + dx * proj;
        const py = oy + dy * proj;
        const pz = oz + dz * proj;
        
        if (Math.abs(px - b.x) < b.w / 2 &&
            Math.abs(py - b.y) < b.h / 2 &&
            Math.abs(pz - b.z) < b.d / 2) {
          
          if (proj < closest) {
            closest = proj;
            hitID = id;
            hit = true;
            hitPoint = { x: px, y: py, z: pz };
            
            const nx = Math.abs(px - b.x) > b.w / 2 ? Math.sign(px - b.x) : 0;
            const ny = Math.abs(py - b.y) > b.h / 2 ? Math.sign(py - b.y) : 0;
            const nz = Math.abs(pz - b.z) > b.d / 2 ? Math.sign(pz - b.z) : 0;
            
            hitNormal = this._normalize({ x: nx || dx, y: ny || dy, z: nz || dz });
          }
        }
      }
      
      this.rayResult = { hit, dist: closest, target: hitID, point: hitPoint, normal: hitNormal };
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
          
          if (!this._checkAABBCollision(b1, b2)) continue;
          
          const key = [id1, id2].sort().join('|');
          const overlap = this._getAABBOverlap(b1, b2);
          
          // Store contact
          this.contacts[key] = {
            point: {
              x: (b1.x + b2.x) / 2,
              y: (b1.y + b2.y) / 2,
              z: (b1.z + b2.z) / 2
            },
            normal: overlap.minAxis === 'x' ? 
              { x: Math.sign(b2.x - b1.x), y: 0, z: 0 } :
            overlap.minAxis === 'y' ? 
              { x: 0, y: Math.sign(b2.y - b1.y), z: 0 } :
              { x: 0, y: 0, z: Math.sign(b2.z - b1.z) }
          };
          
          // Response
          if (b1.type !== 'static' && b2.type !== 'static') {
            const m1 = b1.mass || 1;
            const m2 = b2.mass || 1;
            const ratio1 = m2 / (m1 + m2);
            const ratio2 = m1 / (m1 + m2);
            
            if (overlap.minAxis === 'x') {
              const sep = (Math.abs(overlap.x) / 2 + 0.001) * Math.sign(overlap.x);
              b1.x -= sep * ratio1;
              b2.x += sep * ratio2;
            } else if (overlap.minAxis === 'y') {
              const sep = (Math.abs(overlap.y) / 2 + 0.001) * Math.sign(overlap.y);
              b1.y -= sep * ratio1;
              b2.y += sep * ratio2;
            } else {
              const sep = (Math.abs(overlap.z) / 2 + 0.001) * Math.sign(overlap.z);
              b1.z -= sep * ratio1;
              b2.z += sep * ratio2;
            }
          } else if (b1.type === 'static') {
            if (overlap.minAxis === 'x') b2.x += overlap.x * 1.001;
            else if (overlap.minAxis === 'y') b2.y += overlap.y * 1.001;
            else b2.z += overlap.z * 1.001;
          } else {
            if (overlap.minAxis === 'x') b1.x -= overlap.x * 1.001;
            else if (overlap.minAxis === 'y') b1.y -= overlap.y * 1.001;
            else b1.z -= overlap.z * 1.001;
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
  }

  // Register extension
  Scratch.extensions.register(new TurboPhysicsEngineMAX());

})(Scratch);