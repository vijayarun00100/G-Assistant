window.addEventListener("beforeunload", () => { eel.close_python })

let mails;
let notes;
let map;
let taskList;
let emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ig;

window.onload = function () {
    map = L.map('map').setView([12.8406, 80.1534], 13);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var stuSplit = L.latLng(12.8406, 80.1534);
    var myMarker = L.marker(stuSplit,
        { title: 'unselected' })
        .addTo(map);

    myModal = document.getElementById('mapModal');
    myModal.addEventListener('shown.bs.modal', event => {
        map.invalidateSize();
    });

    refresh();
};

function SearchMail() {
    document.getElementById("newMailsContainer").innerHTML = `
    <div class="text-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;
    let searchString = document.getElementById("MailSearchTextBox").value;
    eel.SearchMail(searchString)(displayMail);

    return false;
}

function refresh() {
    document.getElementById("newMailsContainer").innerHTML = `
    <div class="text-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;
    eel.loadNewMail()(displayMail);
}

function fetchPreviousMail() {
    document.getElementById("newMailsContainer").innerHTML = `
    <div class="text-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;
    eel.load_prevmail()(displayMail);
}

function mailBarClicked(i) {
    let card = document.getElementById(i + "MsgContentCard");
    displayToggle(card);
}

function displayToggle(element) {
    if (element.style.display == 'none') {
        element.style.display = '';
    } else {
        element.style.display = 'none';
    }
}

function markAsRead(i) {
    eel.markAsRead(mails[i]['msgnumber']);
    mails.splice(i, 1);
    displayMail(mails);
}

function deleteMail(i) {
    eel.deleteMail(mails[i]['msgnumber']);
    mails.splice(i, 1);
    displayMail(mails);
}

function displayMail(mailsObject) {
    mails = mailsObject;
    console.log(mails);
    newMailsContainer = document.getElementById("newMailsContainer");
    newMailsContainer.classList.add('vstack');
    newMailsContainer.classList.remove('hstack');
    newMailsContainer.innerHTML = '';
    for (let i = 0; i < mailsObject.length; i++) {
        let mailObject = mailsObject[mailsObject.length - i - 1];
        mailIndex = mailsObject.length - i - 1;

        if (mailObject['textOnly'] == true) {
            mailBody = `<p style='max-height:100%; overflow-y:scroll; text-align:left;'>${mailObject['minicontent'].replaceAll("\r\n", "<br>").replaceAll("\n", "<br>")}</p>`;
        } else {
            mailBody = `<iframe src="${mailObject["content"]}"  frameborder="0" class="embed-responsive-item" width="100%" height="100%"></iframe>`;
        }

        newMailsContainer.innerHTML += `
        <div class="row border border-black newMailBar border-2 align-items-center justify-content-between" id = "${mailIndex}MsgBar" onclick = 'mailBarClicked(${mailIndex});'>
            <div class="col-2 text-truncate" style='margin-top:8px;'>
                <p class="h5">${mailObject["from"]}</p>
            </div>
            <div class="col-8 text-truncate" style='text-align:left;'>
                <b> ${mailObject["subject"]} </b> - ${mailObject["minicontent"]}
            </div>
        </div>
        <div class="card text-center" style="display: none;" id = "${mailIndex}MsgContentCard">
            <div class="card-header">
                ${mailObject["from"]}
            </div>
            <div class="card-body">
                <h5 class="card-title">${mailObject["subject"]}</h5>
                <div class="embed-responsive" style="height:50vh;">${mailBody}</div>
                <div style="display:flex; justify-content:space-between; width:100%;">
                    <div style="display:flex;column-gap:3px;">
                        <button class="btn btn-outline-primary" style="margin-top: 5px;" onclick="openMap(${mailIndex});">
                            Maps
                        </button>
                        <button class="btn btn-outline-primary" style="margin-top: 5px;" onclick="displayActionItems(${mailIndex});">
                            TaskList
                        </button>
                        <button class="btn btn-outline-primary" style="margin-top: 5px;" onclick="summarizeMail(${mailIndex});">
                            Summary
                        </button>
                    </div>
                    <div style="display:flex;column-gap:3px;">
                        <button class="btn btn-outline-primary" style="margin-top: 5px;" onclick="generateResponseToMail(${mailIndex});">
                            Respond
                        </button>
                        <button class="btn btn-outline-primary" style="margin-top: 5px;" onclick="saveMail(${mailIndex});">
                            Save
                        </button>
                        <button class="btn btn-outline-primary" style="margin-top: 5px;" onclick="markAsRead(${mailIndex});">
                            Mark As Read
                        </button>
                        <button class="btn btn-danger" style="margin-top: 5px;" onclick="deleteMail(${mailIndex});">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-footer text-body-secondary">
                ${mailObject["date"]}
            </div>
        </div>
        `
    }
}

function saveMail(mailIdx) {
    eel.saveMail(mails[mailIdx]);
}

function fetchSavedMail() {
    eel.fetchSavedMail()(displayMail);
}

function summarizeMail(emailIndex) {
    myModalElement = document.getElementById('summaryModal');
    modalTitle = document.getElementById('summaryModalTitle');
    modalContent = document.getElementById('summaryModalContent');
    myModal = new bootstrap.Modal(document.getElementById('summaryModal'));

    modalContent.innerHTML = `
    <div class="text-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;

    myModal.show();

    textContent = mails[emailIndex]['minicontent'];
    eel.summarizeEmail(textContent)(function (summaryText) {
        modalTitle.innerHTML = mails[emailIndex]['subject'];
        modalContent.innerHTML = `<textarea class="form-control" style='height:40vh;' id='modaltextarea'>${summaryText}</textarea>`;
    });
}

function saveNote() {
    noteTitle = document.getElementById('summaryModalTitle').innerHTML;
    noteText = document.getElementById('modaltextarea').value;
    eel.saveNote(noteTitle, noteText);
}

function deleteNote(noteIndex) {
    noteTitle = notes[noteIndex]['title'];
    noteText = notes[noteIndex]['text'];
    eel.deleteNote(noteText, noteTitle)(fetchNotes);
}

function fetchNotes() {
    eel.fetchNotes()(function (notesArray) {
        notes = notesArray;
        notesContainer = document.getElementById("newMailsContainer");
        notesContainer.innerHTML = '';
        notesContainer.classList.remove('vstack');
        notesContainer.classList.add('hstack');

        for (let i = 0; i < notesArray.length; i++) {
            noteObject = notesArray[i];
            notesContainer.innerHTML += `
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${noteObject['title']}</h5>
                    <p class="card-text">${noteObject['text']}</p>
                    <button class="btn btn-danger" onclick="deleteNote(${i});">
                        Delete
                    </button>
                </div>
            </div>
            `;
        }
    });
}

function openMap(emailIndex) {
    emailObject = mails[emailIndex];
    emailText = emailObject['minicontent'];

    mapModalTitle = document.getElementById('mapModalTitle');
    loadElement = document.getElementById('mapLoadingDiv');
    mapElement = document.getElementById('map');

    mapElement.style.display = 'none';
    loadElement.style.display = '';

    mapModalTitle.innerHTML = 'Loading...';

    mapModalElement = document.getElementById('mapModal');
    mapModal = new bootstrap.Modal(mapModalElement);
    mapModal.show();

    eel.getLocationLatLong(emailText)(function (coords) {

        mapElement.style.display = '';
        loadElement.style.display = 'none';

        mapModalTitle.innerHTML = coords[2];

        map.flyTo([coords[0], coords[1]]);
        markerlatlng = L.latlng(coords[0], coords[1]);
        L.marker(markerlatlng, { title: coords[2] }).addTo(map);
        map.invalidateSize();
    });
}

function generateResponseToMail(emailIndex) {
    emailObject = mails[emailIndex];

    myModalElement = document.getElementById('responseMailModal');
    modalTitle = document.getElementById('responseMailModalTitle');
    modalContent = document.getElementById('responseMailModalContent');
    myModal = new bootstrap.Modal(document.getElementById('responseMailModal'));
    modalFooter = document.getElementById('responseMailModalFooter');

    modalContent.innerHTML = `
            <div class="text-center">
                <div class="spinner-border" role="status">
                    
                </div>
            </div>
        `;
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <a type="button" class="btn btn-outline-primary" id="responseMailModalSend" onclick="sendReplyMail(${emailIndex});">Send</a>
    `;
    myModal.show();

    eel.generateResponseToMail(emailObject['minicontent'])(function (responseText) {
        modalTitle.innerHTML = mails[emailIndex]['subject'];
        modalContent.innerHTML = `<textarea class="form-control" style='height:40vh;' id='responseBodytextarea'>${responseText}</textarea>`;
    });
}

function sendReplyMail(emailIndex) {
    emailObject = mails[emailIndex];
    body = document.getElementById('responseBodytextarea').value;
    to = emailObject['from'];
    toList = to.match(emailRegex);
    subject = "Reply: " + emailObject['subject'];
    eel.sendMail(body, toList, subject);
}

function displayActionItems(emailIndex) {
    let emailObject = mails[emailIndex];

    let myModalElement = document.getElementById('taskListModal');
    let modalTitle = document.getElementById('taskListModalTitle');
    let modalContent = document.getElementById('taskListModalContent');
    let modalFooter = document.getElementById('taskListModalFooter');
    let myModal = new bootstrap.Modal(document.getElementById('taskListModal'));

    modalTitle.innerHTML = emailObject['subject'];

    modalContent.innerHTML = `
    <div class="text-center">
        <div class="spinner-border" role="status">
            
        </div>
    </div>
    `;

    myModal.show();

    eel.extractActionItemsJSON(emailObject['minicontent'])(function (taskListLocal) {
        taskList = taskListLocal;
        console.log(taskList);
        modalContent.innerHTML = `
        <form action="" onsubmit="return false;">
            <ul class="list-group" id="taskList-list-group">
            </ul>
        </form>
        `;
        let modalListElement = document.getElementById('taskList-list-group');
        for (let i = 0; i < taskList['items'].length; i++) {
            task = taskList['items'][i];
            modalListElement.innerHTML +=
                `<li class="list-group-item">
                    <input class="form-check-input me-1" type="checkbox" name="taskListCheckboxes" value="${i}" id="${i}taskListCheckboxes">
                    <label class="form-check-label" for="taskListCheckboxes">
                        <div class="row" style="display:flex; align-items:space-between;">
                            <p>${task['name']}</p>
                            <span>Date: ${task['date']}</span>
                            <span>Time: ${task['time']}</span>
                            <button class='btn btn-primary' onclick='createReminder("${task['date']}", "${task['name']}");'>Remind</button>
                        </div>
                    </label>
                </li>`;
        }
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class='btn btn-outline-primary' id='taskListModalSave' onclick="saveTaskList('${emailObject['subject']}');">Save</button>
        `;
    });
}

function createReminder(dateString, subject) {
    eel.createReminder(dateString, subject)(function () {
        console.log("DONE");
    });
}

function saveTaskList(subject) {
    let checkboxes = document.getElementsByName("taskListCheckboxes");
    let bools = [];

    for (let i = 0; i < checkboxes.length; i++) {
        let checkbox = checkboxes[i];
        bools.push(checkbox.checked);
    }

    let newTaskList = { 'items': [] };
    for (let i = 0; i < taskList['items'].length; i++) {
        if (bools[i]) {
            newTaskList['items'].push(taskList['items'][i]);
        }
    }

    let anyTrue = false;
    for (let i = 0; i < bools.length; i++) {
        anyTrue = anyTrue || bools[i];
    }

    if (anyTrue == false) {
        console.log("NONE SELECTED");
        return null;
    }

    console.log(newTaskList);

    eel.addTaskList(subject, newTaskList)(function () {
        console.log(subject, newTaskList);
    });
}

function getTasksAndDisplay() {
    eel.getTaskLists()(function (taskLists) {
        displayTasks(taskLists)
    });
}

function displayTasks(taskLists) {
    let taskListsContainer = document.getElementById("newMailsContainer");
    taskListsContainer.innerHTML = `
        <div style="display:flex; flex-wrap:wrap;gap:10px;" id="taskListsContainer">

        </div>
    `;
    let taskListsContainertemp = document.getElementById('taskListsContainer')
    console.log(taskLists);
    for (let i = 0; i < taskLists.length; i++) {
        let taskList = taskLists[i]['taskList']['items'];
        let taskListTitle = taskLists[i]['title'];
        for (let j = 0; j < taskList.length; j++) {
            let taskObject = taskList[j];
            taskListsContainertemp.innerHTML += `
                <div class="card" style="width:20rem;" id="${i}:${j}">
                    <div class="card-header">
                        <span style="font-weight:bold;">${taskObject['name']}</span>
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Deadline Date: ${taskObject['date']}</li>
                        <li class="list-group-item">Deadline Time: ${taskObject['time'] == '' ? 'N/A' : taskObject['time']}</li>
                        <li class="list-group-item">
                            <button class="btn btn-primary" onclick="removeTask('${i}:${j}')">Done</button>
                        </li>
                    </ul>
                </div>
            `;
        }
    }
}

function removeTask(idstring) {
    let cardelement = document.getElementById(idstring);
    cardelement.style['display'] = 'none';
    eel.removeTask(idstring)(function () {
        console.log("REMOVED");
    });
}

function getAndDisplayReminders() {
    let remindersContainer = document.getElementById("newMailsContainer");
    remindersContainer.innerHTML = `
    <div class="text-center">
        <div class="spinner-border" role="status">
            
        </div>
    </div>
    `;
    eel.getReminders()(function (reminders) {
        remindersContainer.innerHTML = '';
        console.log(reminders);
        let date, time;
        for (let i = 0; i < reminders.length; i++) {
            let reminder = reminders[i];
            if (reminder[2] == 321) {
                date = reminder[1].split('-').splice(0, 3).join('-');
                time = reminder[1].split('-').splice(3, 3).join(':');
            } else {
                date = reminder[1].split('-').splice(0, 3).join('-');
                time = "N/A";
            }
            remindersContainer.innerHTML += `
                <div class="card" id="${reminder[0]}">
                    <div class="row">
                        <div class="col-sm">
                            <p>${reminder[0]}</p>
                        </div>
                        <div class="col-sm">
                            <p>Date: ${date}</p>
                        </div>
                        <div class="col-sm">
                            <p>Time: ${time}</p>
                        </div>
                        <div class="col-sm">
                            <button class="btn btn-danger" onclick='deleteReminder("${reminder[0]}")'>Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }
    });
}

function deleteReminder(title) {
    document.getElementById(title).style['display'] = 'none';

    eel.deleteReminder(title)(function () {
        console.log("DELETED REMINDER");
    });
}