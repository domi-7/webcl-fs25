// personMemoryLeakTest.mjs
// Run with: node --expose-gc personMemoryLeakTest.mjs

class TestObservableList {
    constructor() {
        this._items = [];
        this._onAdd = [];
        this._onDel = [];
    }

    add(item) {
        this._items.push(item);
        this._onAdd.forEach(cb => cb(item));
    }

    remove(item) {
        const index = this._items.indexOf(item);
        if (index >= 0) this._items.splice(index, 1);
        this._onDel.forEach(cb => cb(item));
    }

    onAdd(cb) { this._onAdd.push(cb); }
    onDel(cb) { this._onDel.push(cb); }

    getItems() { return this._items; }
}

function MasterControllerWithInjectedList(personListModel) {
    const onPersonAddListeners = [];
    const onPersonRemoveListeners = [];

    function notifyAdd(p) {
        onPersonAddListeners.forEach(cb => cb(p));
    }

    function notifyRemove(p) {
        onPersonRemoveListeners.forEach(cb => cb(p));
    }

    return {
        addPerson: () => {
            const p = {};  // simplified person object
            personListModel.add(p);
            notifyAdd(p);
            return p;
        },
        removePerson: (p) => {
            personListModel.remove(p);
            notifyRemove(p);
        },
        onPersonAdd: cb => onPersonAddListeners.push(cb),
        onPersonRemove: cb => onPersonRemoveListeners.push(cb),
        getAllPersons: () => personListModel.getItems(),
    };
}

function runMemoryLeakTest() {
    if (typeof global.gc !== "function") {
        console.error("GC is not exposed. Run the file with: node --expose-gc personMemoryLeakTest.mjs");
        process.exit(1);
    }

    const list = new TestObservableList();
    const controller = MasterControllerWithInjectedList(list);

    let person = controller.addPerson();
    const weakRef = new WeakRef(person);
    controller.removePerson(person);

    // Remove last strong reference
    person = null;

    global.gc();

    // Wait a moment before checking if GC ran
    setTimeout(() => {
        const deref = weakRef.deref();
        if (deref === undefined) {
            console.log("✅ Person was garbage collected.");
        } else {
            console.error("❌ Person was NOT garbage collected.");
        }
    }, 60);
}

runMemoryLeakTest();