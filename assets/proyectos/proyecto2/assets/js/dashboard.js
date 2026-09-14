function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function getSessionKey(sessionId) {
  return `class-session-${sessionId}`;
}

function getStudents(sessionId) {
  const stored = localStorage.getItem(getSessionKey(sessionId));
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStudents(sessionId, students) {
  localStorage.setItem(getSessionKey(sessionId), JSON.stringify(students));
}

function updateProfessorList(sessionId) {
  const list = getStudents(sessionId);
  const listElement = document.getElementById('studentList');
  const emptyElement = document.getElementById('noStudents');
  if (!listElement || !emptyElement) return;
  listElement.innerHTML = '';
  if (list.length === 0) {
    emptyElement.classList.remove('hidden');
    return;
  }
  emptyElement.classList.add('hidden');
  list.forEach((student) => {
    const li = document.createElement('li');
    li.textContent = student;
    listElement.appendChild(li);
  });
}

function registerStudent(sessionId, studentName) {
  const current = getStudents(sessionId);
  if (!current.includes(studentName)) {
    current.push(studentName);
    saveStudents(sessionId, current);
  }
}

function setupProfessorPage() {
  const name = getQueryParam('name');
  let sessionId = getQueryParam('session');
  if (!name) {
    window.location.href = '../../index.html';
    return;
  }
  if (!sessionId) {
    sessionId = randomId();
    const url = new URL(window.location.href);
    url.searchParams.set('name', name);
    url.searchParams.set('session', sessionId);
    window.history.replaceState({}, '', url.toString());
  }
  document.getElementById('welcome').textContent = `Profesor: ${name}`;
  document.getElementById('sessionId').textContent = sessionId;
  const qrText = JSON.stringify({ sessionId, professor: name });
  const qrContainer = document.getElementById('qrContainer');
  if (qrContainer) {
    qrContainer.innerHTML = '';
    if (window.QRCode && typeof QRCode === 'function') {
      try {
        new QRCode(qrContainer, {
          text: qrText,
          width: 220,
          height: 220,
          colorDark: '#111827',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
        });
      } catch (error) {
        qrContainer.textContent = 'Error al generar el QR.';
        console.error(error);
      }
    } else {
      qrContainer.textContent = 'No se pudo cargar la librería de QR.';
    }
  }
  updateProfessorList(sessionId);
  window.addEventListener('storage', (event) => {
    if (event.key === getSessionKey(sessionId)) {
      updateProfessorList(sessionId);
    }
  });
}

function setupAlumnoPage() {
  const name = getQueryParam('name');
  if (!name) {
    window.location.href = '../../index.html';
    return;
  }
  document.getElementById('welcome').textContent = `Alumno: ${name}`;
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const status = document.getElementById('scanStatus');
  const result = document.getElementById('scanResult');
  const canvasContext = canvas.getContext('2d');
  let scanning = false;

  function stopCamera(stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  function showScanResult(message) {
    result.textContent = message;
    result.classList.remove('hidden');
  }

  function scanFrame() {
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
    if (code) {
      try {
        const payload = JSON.parse(code.data);
        if (payload.sessionId && payload.professor) {
          registerStudent(payload.sessionId, name);
          showScanResult(`Escaneo correcto. Profesor: ${payload.professor}`);
          status.textContent = 'Registro completado con éxito.';
          localStorage.setItem('class-session-updated', JSON.stringify({ sessionId: payload.sessionId, time: Date.now() }));
          scanning = false;
          if (video.srcObject) {
            stopCamera(video.srcObject);
          }
          return;
        }
      } catch (error) {
        console.warn('QR no válido', error);
      }
    }
    if (scanning) {
      requestAnimationFrame(scanFrame);
    }
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then((stream) => {
      video.srcObject = stream;
      scanning = true;
      video.play();
      requestAnimationFrame(scanFrame);
    })
    .catch((error) => {
      status.textContent = 'No se pudo acceder a la cámara. Usa un dispositivo con cámara o permite el acceso.';
      console.error(error);
    });
}

if (document.body.contains(document.getElementById('qrContainer'))) {
  setupProfessorPage();
}
if (document.body.contains(document.getElementById('video'))) {
  setupAlumnoPage();
}
