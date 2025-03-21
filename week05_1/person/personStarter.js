import { MasterController, SelectionController, MasterView, DetailView } from './person.js';

const masterController    = MasterController();
const selectionController = SelectionController();

// create the sub-views, incl. binding

MasterView(masterController, selectionController, document.getElementById('masterContainer'));
DetailView(selectionController, document.getElementById('detailContainer'));

// binding of the main view

document.getElementById('plus').onclick = _ => {
    const newPerson = masterController.addPerson();
    selectionController.setSelectedPerson(newPerson);
};

// Ensure detail card starts in folded-back state
//TODO possibly do better?
document.addEventListener('DOMContentLoaded', () => {
    const detailCard = document.getElementById('detailContainer').closest('.card');
    detailCard.classList.add('folded-back');
});
