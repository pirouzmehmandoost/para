import * as THREE from 'three';
import type { EventListener } from 'three';

type Object3DEventTypes = 'added' | 'removed';

type Object3DEventHandler = EventListener<
  THREE.Object3DEventMap[Object3DEventTypes],
  Object3DEventTypes,
  THREE.Object3D
>;

type ChildAddedHandler = EventListener<
  THREE.Object3DEventMap['childadded'],
  'childadded',
  THREE.Object3D
>;

export interface RegistryEntry {
  target: THREE.Object3D;
  index: number;
  targetUUID: string;
  parentUUID: string;
  consumerDemoted: boolean;
}

interface ListenerRecord {
  target: THREE.Object3D;
  type: Object3DEventTypes;
  handler: Object3DEventHandler;
}

class TargetRegistry {
  private _scene: THREE.Object3D;
  private _targets: Record<string, THREE.Object3D> = {};
  private _promoted: Record<string, RegistryEntry> = {};
  private _demoted: Record<string, RegistryEntry> = {};
  private _positions: THREE.Vector3[] = [];
  private _listeners: ListenerRecord[] = [];
  private _defaultFallback: THREE.Vector3 = new THREE.Vector3();
  private _activeFilter: ((obj: THREE.Object3D) => boolean) | null = null;
  private _sceneChildAddedHandler: ChildAddedHandler | null = null;

  constructor(scene: THREE.Object3D, defaultFallback?: THREE.Vector3) {
    if (!scene || !scene.isObject3D || !(scene as THREE.Scene).isScene) {
      throw new TypeError(`TargetRegistry.ts: scene must be of type THREE.Scene.`);
    } else {
      this._scene = scene;
    }

    if (typeof defaultFallback !== 'undefined') {
      if (defaultFallback?.isVector3) {
        this._defaultFallback.copy(defaultFallback);
      } else {
        throw new TypeError(
          `TargetRegistry.ts: defaultFallback must be THREE.Vector3. Received: ${typeof defaultFallback}`,
        );
      }
    }
  }

  // Public methods:

  register(targets: THREE.Object3D[]): void {
    this._cleanupListeners();
    this._removeSceneChildAddedListener();
    this._promoted = {};
    this._demoted = {};
    this._positions = [];
    this._targets = {};
    this._activeFilter = null;

    if (!targets.length) return;

    this._targets = Object.fromEntries(
      targets.filter((t) => t?.isObject3D).map((t) => [t.uuid, t]),
    );

    const sceneObjects: Record<string, THREE.Object3D> = {};

    this._scene.traverse((obj) => {
      if (obj.isObject3D) sceneObjects[obj.uuid] = obj;
    });

    for (const key in this._targets) {
      const t = this._targets[key];

      if (!t?.uuid?.length) continue;

      const uuid = t.uuid;
      const found = sceneObjects[uuid] ?? null;

      if (found) {
        const entry: RegistryEntry = {
          target: found,
          index: this._positions.length,
          targetUUID: uuid,
          parentUUID: found.parent?.uuid ?? '',
          consumerDemoted: false,
        };

        this._promoted[uuid] = entry;
        this._positions.push(new THREE.Vector3().copy(this._defaultFallback));
        this._addListener(found, 'removed', this._makeRemovedHandler(uuid));
      } else {
        const entry: RegistryEntry = {
          target: t,
          index: -1,
          targetUUID: uuid,
          parentUUID: t.parent?.uuid ?? '',
          consumerDemoted: false,
        };

        this._demoted[uuid] = entry;
        this._addListener(t, 'added', this._makeAddedHandler(uuid));
      }
    }
  }

  registerByFilter(filter: (obj: THREE.Object3D) => boolean): void {
    this._cleanupListeners();
    this._removeSceneChildAddedListener();
    this._promoted = {};
    this._demoted = {};
    this._positions = [];
    this._targets = {};
    this._activeFilter = filter;

    this._scene.traverse((obj) => {
      if (filter(obj)) {
        this._promoteByObject(obj);
      }
    });

    this._attachSceneChildAddedListener();
  }

  setFallbackPosition(position: THREE.Vector3): void {
    this._defaultFallback.copy(position);
  }

  getPositions(): readonly THREE.Vector3[] {
    return this._positions;
  }

  getPromoted(): Readonly<Record<string, RegistryEntry>> {
    return this._promoted;
  }

  getDemoted(): Readonly<Record<string, RegistryEntry>> {
    return this._demoted;
  }

  refreshPosition(index: number, position: THREE.Vector3): void {
    if (index >= 0 && index < this._positions.length && this._positions[index]) {
      this._positions[index].copy(position);
    }
  }

  demote(uuid: string): boolean {
    const entry = this._promoted[uuid];

    if (!entry) return false;

    const demotedIndex = entry.index;

    this._removePositionAtIndex(demotedIndex);
    this._decrementPromotedIndicesAbove(demotedIndex);
    delete this._promoted[uuid];
    entry.index = -1;
    entry.consumerDemoted = true;
    this._demoted[uuid] = entry;

    this._removeListenersForTarget(entry.target, 'removed');

    return true;
  }

  promote(uuid: string): boolean {
    const entry = this._demoted[uuid];

    if (!entry) return false;

    const isEntryInScene = this._scene.getObjectByProperty('uuid', entry.target.uuid);

    const parentUUID = entry.target.parent?.uuid;
    const isParentInScene = parentUUID
      ? this._scene?.getObjectByProperty('uuid', parentUUID)?.isObject3D
      : null;

    if (!isEntryInScene || !isParentInScene) return false;

    this._promoteEntry(entry);

    return true;
  }

  addTarget(target: THREE.Object3D): boolean {
    if (!target?.uuid?.length) return false;

    const uuid = target.uuid;

    if (this._promoted[uuid] || this._demoted[uuid]) return false;

    const inScene = !!this._scene.getObjectByProperty('uuid', uuid);

    if (inScene) {
      const entry: RegistryEntry = {
        target,
        index: this._positions.length,
        targetUUID: uuid,
        parentUUID: target.parent?.uuid ?? '',
        consumerDemoted: false,
      };

      this._promoted[uuid] = entry;
      this._targets[uuid] = target;

      this._positions.push(new THREE.Vector3().copy(this._defaultFallback));
      this._addListener(target, 'removed', this._makeRemovedHandler(uuid));
    } else {
      const entry: RegistryEntry = {
        target,
        index: -1,
        targetUUID: uuid,
        parentUUID: target.parent?.uuid ?? '',
        consumerDemoted: false,
      };

      this._demoted[uuid] = entry;
      this._targets[uuid] = target;
      this._addListener(target, 'added', this._makeAddedHandler(uuid));
    }

    return true;
  }

  removeTarget(uuid: string): boolean {
    const promoted = this._promoted[uuid];

    if (promoted) {
      const removedIndex = promoted.index;

      this._removeListenersForTarget(promoted.target, 'removed');
      this._removePositionAtIndex(removedIndex);
      this._decrementPromotedIndicesAbove(removedIndex);
      delete this._promoted[uuid];
    } else {
      const demoted = this._demoted[uuid];

      if (!demoted) return false;

      this._removeListenersForTarget(demoted.target, 'added');
      delete this._demoted[uuid];
    }

    if (this._targets[uuid]) delete this._targets[uuid];

    return true;
  }

  deregister(): void {
    this._cleanupListeners();
    this._removeSceneChildAddedListener();
    this._promoted = {};
    this._demoted = {};
    this._positions = [];
    this._targets = {};
    this._activeFilter = null;
  }

  // Private methods

  private _promoteEntry(entry: RegistryEntry): void {
    const uuid = entry.targetUUID;

    delete this._demoted[uuid];
    entry.consumerDemoted = false;
    entry.index = this._positions.length;
    entry.parentUUID = entry.target.parent?.uuid ?? '';
    this._promoted[uuid] = entry;

    this._positions.push(new THREE.Vector3().copy(this._defaultFallback));

    this._removeListenersForTarget(entry.target, 'added');
    this._addListener(entry.target, 'removed', this._makeRemovedHandler(uuid));
  }

  private _makeRemovedHandler(uuid: string): Object3DEventHandler {
    const handler: Object3DEventHandler = () => {
      const entry = this._promoted[uuid];
      if (!entry) return;

      const staleIndex = entry.index;

      if (this._scene.getObjectByProperty('uuid', uuid)) return;

      this._removePositionAtIndex(staleIndex);
      this._decrementPromotedIndicesAbove(staleIndex);

      delete this._promoted[uuid];
      this._demoted[uuid] = entry;

      const parent = this._scene.getObjectByProperty('uuid', entry.parentUUID);
      const isTracked = this._activeFilter !== null || !!this._targets[uuid];

      if (!parent || !isTracked) {
        delete this._demoted[uuid];
        this._removeListenersForTarget(entry.target, 'removed');
      } else {
        entry.index = -1;
        entry.consumerDemoted = false;
        this._removeListenersForTarget(entry.target, 'removed');
        this._addListener(entry.target, 'added', this._makeAddedHandler(uuid));
      }
    };
    return handler;
  }

  private _makeAddedHandler(uuid: string): Object3DEventHandler {
    const handler: Object3DEventHandler = () => {
      const entry = this._demoted[uuid];
      if (!entry) return;

      if (entry.consumerDemoted) return;

      const parentUUID = entry.target.parent?.uuid;
      if (!parentUUID) return;
      const parentInScene = this._scene.getObjectByProperty('uuid', parentUUID);
      if (!parentInScene?.isObject3D) return;

      this._promoteEntry(entry);
    };
    return handler;
  }

  private _promoteByObject(obj: THREE.Object3D): void {
    const uuid = obj.uuid;
    const entry: RegistryEntry = {
      target: obj,
      index: this._positions.length,
      targetUUID: uuid,
      parentUUID: obj.parent?.uuid ?? '',
      consumerDemoted: false,
    };

    this._promoted[uuid] = entry;
    this._targets[uuid] = obj;

    this._positions.push(new THREE.Vector3().copy(this._defaultFallback));
    this._addListener(obj, 'removed', this._makeRemovedHandler(uuid));
  }

  private _attachSceneChildAddedListener(): void {
    if (this._sceneChildAddedHandler || !this._activeFilter) return;

    const filter = this._activeFilter;

    this._sceneChildAddedHandler = (event) => {
      event.child.traverse((obj) => {
        if (filter(obj) && !this._promoted[obj.uuid] && !this._demoted[obj.uuid]) {
          this._promoteByObject(obj);
        }
      });

      for (const uuid in this._demoted) {
        const entry = this._demoted[uuid];
        if (entry.consumerDemoted) continue;

        const parentUUID = entry.target.parent?.uuid;
        if (!parentUUID) continue;

        const parentInScene = this._scene.getObjectByProperty('uuid', parentUUID);
        if (!parentInScene?.isObject3D) continue;

        this._promoteEntry(entry);
      }
    };

    this._scene.addEventListener('childadded', this._sceneChildAddedHandler);
  }

  private _removeSceneChildAddedListener(): void {
    if (!this._sceneChildAddedHandler) return;

    this._scene.removeEventListener('childadded', this._sceneChildAddedHandler);
    this._sceneChildAddedHandler = null;
  }

  private _removePositionAtIndex(index: number): void {
    if (index >= 0 && index < this._positions.length) {
      this._positions.splice(index, 1);
    }
  }

  private _decrementPromotedIndicesAbove(threshold: number): void {
    for (const key in this._promoted) {
      if (this._promoted[key].index > threshold) {
        this._promoted[key].index -= 1;
      }
    }
  }

  private _addListener(
    target: THREE.Object3D,
    type: Object3DEventTypes,
    handler: Object3DEventHandler,
  ): void {
    target.addEventListener(type, handler);
    this._listeners.push({ target, type, handler });
  }

  private _removeListenersForTarget(target: THREE.Object3D, type: Object3DEventTypes): void {
    for (let i = this._listeners.length - 1; i >= 0; i--) {
      const rec = this._listeners[i];
      if (rec.target === target && rec.type === type) {
        rec.target.removeEventListener(rec.type, rec.handler);
        this._listeners.splice(i, 1);
      }
    }
  }

  private _cleanupListeners(): void {
    for (let i = 0; i < this._listeners.length; i++) {
      const rec = this._listeners[i];
      rec.target.removeEventListener(rec.type, rec.handler);
    }

    this._listeners = [];
  }
}

export default TargetRegistry;
