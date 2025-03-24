import {VALUE, VALID, EDITABLE, LABEL} from "../../kolibri-dist-0.9.10/kolibri/presentationModel.js";

export {personListItemProjector, personFormProjector}

/**
 * Binds a text attribute to a given <input> element.
 * This ensures that changes in the UI are reflected in the model,
 * and the other way around.
 *
 * @param {Object} textAttr - The text attribute object to bind.
 * @param {HTMLInputElement} inputElement - The DOM input element to bind.
 */
const bindTextInput = (textAttr, inputElement) => {

    //changes the user makes are written to the text attribute
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    //changes in the text attribute are reflected in the input element
    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    //valid changes are reflected in the input element
    textAttr.getObs(VALID, true).onChange(
        valid => valid
            ? inputElement.classList.remove("invalid")
            : inputElement.classList.add("invalid")
    );

    //editable changes are reflected in the input element
    textAttr.getObs(EDITABLE, false).onChange(
        isEditable => {
            if (isEditable) {
                inputElement.removeAttribute("readonly");
                inputElement.classList.remove("disabled-style");
            } else {
                inputElement.setAttribute("readonly", true);
                inputElement.classList.add("disabled-style");
            }
        });

    // show label as pop-over (tooltip/title) on the input element
    textAttr.getObs(LABEL).onChange(label => {
        inputElement.title = label;
    });

};

/**
 * Creates an <input> element that's bound to the given text attribute,
 * returning the finished DOM element for display.
 *
 * @param {Object} textAttr - The text attribute for the input field
 * @returns {HTMLInputElement} - A text input element
 */
const personTextProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

/**
 * Projects a single Person onto the given rootElement, including
 * delete button, input fields, and click bindings to update selection.
 *
 * @param {Object} masterController - The controller for creating/removing Person objects
 * @param {Object} selectionController - The controller managing selection
 * @param {HTMLElement} rootElement - The DOM element to which we'll append Person UI
 * @param {Object} person - The person object holding firstname/lastname attributes
 */
const personListItemProjector = (masterController, selectionController, rootElement, person) => {

    const deleteButton = document.createElement("Button");
    deleteButton.setAttribute("class", "delete");
    deleteButton.innerHTML = "&times;";
    deleteButton.onclick = _ => masterController.removePerson(person);

    const firstnameInputElement = personTextProjector(person.firstname);
    const lastnameInputElement = personTextProjector(person.lastname);

    // Make inputs editable
    person.firstname.getObs(EDITABLE).setValue(true);
    person.lastname.getObs(EDITABLE).setValue(true);

    const selectPerson = () => selectionController.setSelectedPerson(person);
    firstnameInputElement.onclick = selectPerson;
    lastnameInputElement.onclick = selectPerson;

    selectionController.onPersonSelected(
        selected => selected === person
            ? deleteButton.classList.add("selected")
            : deleteButton.classList.remove("selected")
    );

    masterController.onPersonRemove((removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(deleteButton);
        rootElement.removeChild(firstnameInputElement);
        rootElement.removeChild(lastnameInputElement);
        if (selectionController.getSelectedPerson() === removedPerson) {
            selectionController.setSelectedPerson(null);
        }
        removeMe();
    });

    rootElement.appendChild(deleteButton);
    rootElement.appendChild(firstnameInputElement);
    rootElement.appendChild(lastnameInputElement);
    selectPerson();
};

/**
 * Renders a detail form for a specific Person, or shows a "folded back" form
 * if no Person is selected. Includes label bindings and read-only logic.
 *
 * @param {Object} detailController - The controller for the detail form
 * @param {HTMLElement} rootElement - The DOM element that contains the form
 * @param {Object|null} person - The currently selected person (or null if none)
 */
const personFormProjector = (detailController, rootElement, person) => {
    // Ensure the card is folded back initially
    const detailCard = rootElement.closest('.card');
    if (detailCard != null) {
        if (!person || person.firstname.getObs(VALUE).getValue() === "") {
            detailCard.classList.add("folded-back");
        } else {
            detailCard.classList.remove("folded-back");
        }
    }

    rootElement.innerHTML = '';

    const isReadonly = !person || person.firstname.getObs(VALUE).getValue() === "";

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="detail-form">
            <LABEL for="firstname"></LABEL>
            <INPUT TYPE="text" size="20" id="firstname">   
            <LABEL for="lastname"></LABEL>
            <INPUT TYPE="text" size="20" id="lastname">   
        </DIV>
    </FORM>`;

    const firstnameInput = divElement.querySelector("#firstname");
    const lastnameInput  = divElement.querySelector("#lastname");
    const firstnameLabel = divElement.querySelector("label[for='firstname']");
    const lastnameLabel  = divElement.querySelector("label[for='lastname']");

    if (!isReadonly) {
        // Person is selected or being added, make inputs editable
        bindTextInput(person.firstname, firstnameInput);
        bindTextInput(person.lastname, lastnameInput);

        person.firstname.getObs(LABEL).onChange(label => firstnameLabel.textContent = label);
        person.lastname.getObs(LABEL).onChange(label => lastnameLabel.textContent = label);

        // Explicitly make inputs editable when a person is selected or when adding a new person
        person.firstname.getObs(EDITABLE).setValue(true);
        person.lastname.getObs(EDITABLE).setValue(true);
    } else {
        // No person selected, make inputs readonly
        firstnameInput.setAttribute("readonly", true);
        lastnameInput.setAttribute("readonly", true);
        firstnameInput.classList.add("disabled-style");
        lastnameInput.classList.add("disabled-style");

        firstnameInput.value = '';
        lastnameInput.value = '';
        firstnameLabel.textContent = '';
        lastnameLabel.textContent = '';
    }

    if (rootElement.firstChild) {
        rootElement.firstChild.replaceWith(divElement);
    } else {
        rootElement.appendChild(divElement);
    }
};
