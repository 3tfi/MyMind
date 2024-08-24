document.addEventListener('DOMContentLoaded', () => {
    const addNoteBtn = document.getElementById('addNoteBtn');
    const colorPicker = document.getElementById('colorPicker');
    const createNoteBtn = document.getElementById('createNoteBtn');
    const notesContainer = document.getElementById('notesContainer');
    let selectedColor = '#ffffff';
    let selectedNote = null;

    addNoteBtn.addEventListener('click', () => {
        colorPicker.classList.toggle('hidden');
    });

    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            selectedColor = e.target.getAttribute('data-color');
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            e.target.classList.add('selected');
        });
    });

    createNoteBtn.addEventListener('click', () => {
        createNoteWithColor(selectedColor);
        colorPicker.classList.add('hidden');
    });

    function createNoteWithColor(color, title = 'New Note', text = '') {
        const note = document.createElement('div');
        note.classList.add('note');
        note.style.backgroundColor = color;
        note.innerHTML = `
            <div class="header">
                <span class="title" maxlength="8" contenteditable="true">${title}</span>
            </div>
            <textarea placeholder="Add note text">${text}</textarea>
        `;
        notesContainer.appendChild(note);
        makeDraggable(note);
        addNoteEvents(note);
        saveNotes();
    }

    function makeDraggable(note) {
        note.draggable = true;
        note.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', null);
            note.classList.add('dragging');
        });
        note.addEventListener('dragend', (e) => {
            note.classList.remove('dragging');
            note.style.top = `${e.clientY - note.offsetHeight / 2}px`;
            note.style.left = `${e.clientX - note.offsetWidth / 2}px`;
            saveNotes();
        });
    }

    function addNoteEvents(note) {
        const title = note.querySelector('.title');
        const textarea = note.querySelector('textarea');

        note.addEventListener('click', (e) => {
            if (selectedNote) {
                selectedNote.classList.remove('selected');
            }
            selectedNote = note;
            note.classList.add('selected');
            e.stopPropagation();
        });

        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
            saveNotes();
        });

        title.addEventListener('input', () => {
            if (title.innerText.length > 8) {
                title.innerText = title.innerText.substring(0, 8);
            }
            if (title.innerText.trim() === '') {
                title.style.display = 'none';
            } else {
                title.style.display = 'block';
            }
            saveNotes();
        });

        textarea.addEventListener('input', saveNotes);
    }

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'Delete' && selectedNote) {
            selectedNote.remove();
            saveNotes();
            selectedNote = null;
        }
    });

    document.addEventListener('click', () => {
        if (selectedNote) {
            selectedNote.classList.remove('selected');
            selectedNote = null;
        }
    });

    function saveNotes() {
        const notes = [];
        document.querySelectorAll('.note').forEach(note => {
            notes.push({
                title: note.querySelector('.title').innerText || 'Note Title',
                text: note.querySelector('textarea').value || 'Add note text',
                color: note.style.backgroundColor,
                position: {
                    top: note.style.top,
                    left: note.style.left
                }
            });
        });
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.forEach(noteData => {
            createNoteWithColor(noteData.color, noteData.title, noteData.text);
            const note = notesContainer.lastChild;
            note.style.top = noteData.position.top;
            note.style.left = noteData.position.left;
        });
    }

    function createGuideNote() {
        createNoteWithColor('#ffffe0', 'Guide', '1. You can move notes\n2. You can delete notes by pressing Alt + Delete\n3. You can create a new note and change its color by pressing the note icon at the top left');
    }

    if (!localStorage.getItem('guideNoteShown')) {
        createGuideNote();
        localStorage.setItem('guideNoteShown', 'true');
    }

    loadNotes();
});
