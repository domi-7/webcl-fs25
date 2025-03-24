import { MasterController, SelectionController, MasterView, DetailView } from './person.js';
import {TestSuite}                                                       from "../../kolibri-dist-0.9.10/kolibri/util/test.js";

const personSuite = TestSuite("person");

personSuite.add("crud", assert => {

    // setup
    const masterContainer = document.createElement("div");
    const detailContainer = document.createElement("div");
    detailContainer.innerHTML = "<div>to replace</div>";

    const masterController    = MasterController();
    const selectionController = SelectionController();

    // create the sub-views, incl. binding

    MasterView(masterController, selectionController, masterContainer);
    DetailView(selectionController, detailContainer);

    const elementsPerRow = 3;

    assert.is(masterContainer.children.length, 0 * elementsPerRow);

    masterController.addPerson();

    assert.is(masterContainer.children.length, 1 * elementsPerRow);

     masterController.addPerson();

    assert.is(masterContainer.children.length, 2*elementsPerRow);

    const firstInput = masterContainer.querySelectorAll("input[type=text]")[0];
    const firstDeleteButton = masterContainer.querySelectorAll("button")[0];

    firstDeleteButton.click();

    assert.is(masterContainer.children.length, 1 * elementsPerRow);


});

// TODO: test for memory leak (difficult)
// NOTE: This kind of memory leak test using WeakRef and gc() does not work in the browser,
// because manual garbage collection is not exposed in browser environments.
// It can only be tested in Node.js with --expose-gc.
// We did not use node.js because we would have had to simulate a browser environment.

personSuite.run();
