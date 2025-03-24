//.mjs files are ES modules per default
// allows us to use import/export syntax

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

        this._onDel.length = 0;
        this._onAdd.length = 0;
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
            const p = {};
            personListModel.add(p);
            notifyAdd(p);
            return p;
        },
        removePerson: (p) => {
            personListModel.remove(p);
            notifyRemove(p);
            onPersonAddListeners.length = 0;
            onPersonRemoveListeners.length = 0;
        },
        onPersonAdd: cb => onPersonAddListeners.push(cb),
        onPersonRemove: cb => onPersonRemoveListeners.push(cb),
    };
}

async function runMemoryLeakTest() {

    let wasCollected = false;

    await (async function isolate() {
        const list = new TestObservableList();
        const controller = MasterControllerWithInjectedList(list);

        let person = controller.addPerson();

        // Create a WeakRef, which will allow the person object to be garbage collected
        const weakRef = new WeakRef(person);

        controller.removePerson(person);

        person = null;

        global.gc();

        console.log("GC called, waiting...");

        await new Promise(resolve => setTimeout(resolve, 1000));

        const deref = weakRef.deref();
        wasCollected = (deref === undefined);
    })();

    if (wasCollected) {
        console.log("Person was garbage collected.");
    } else {
        console.error("Person was NOT garbage collected.");
    }
}

runMemoryLeakTest().catch(console.error);