const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');

const PHP_PORT = 8765;
const APP_NAME = 'Aplikasi Kasir';

let mainWindow = null;
let phpProcess = null;
let splashWindow = null;

function findPhpExecutable() {
    const isDev = !app.isPackaged;
    if (isDev) {
        const xamppPhp = 'C:\\xampp\\php\\php.exe';
        if (fs.existsSync(xamppPhp)) return xamppPhp;
        return 'php';
    }
    const bundledPhp = path.join(process.resourcesPath, 'php', 'php.exe');
    if (fs.existsSync(bundledPhp)) return bundledPhp;
    const xamppPhp = 'C:\\xampp\\php\\php.exe';
    if (fs.existsSync(xamppPhp)) return xamppPhp;
    return 'php';
}

function getLaravelPath() {
    if (!app.isPackaged) {
        return path.join(__dirname, '..');
    }
    return path.join(process.resourcesPath, 'laravel');
}

function waitForPort(port, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            const socket = new net.Socket();
            socket.setTimeout(500);
            socket.connect(port, '127.0.0.1', () => {
                socket.destroy();
                resolve();
            });
            socket.on('error', () => {
                socket.destroy();
                if (Date.now() - start > timeout) {
                    reject(new Error(`Port ${port} tidak dapat diakses`));
                } else {
                    setTimeout(check, 500);
                }
            });
            socket.on('timeout', () => {
                socket.destroy();
                setTimeout(check, 500);
            });
        };
        check();
    });
}

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 480,
        height: 320,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        center: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const splashHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            height: 100vh; border-radius: 16px;
            font-family: 'Segoe UI', sans-serif; color: white;
            overflow: hidden;
        }
        .logo { font-size: 56px; margin-bottom: 16px; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        p { font-size: 13px; opacity: 0.7; margin-bottom: 32px; }
        .bar-container { width: 280px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden; }
        .bar { height: 100%; width: 0%; background: linear-gradient(90deg, #a5b4fc, #818cf8); border-radius: 2px; animation: load 5s ease forwards; }
        @keyframes load { to { width: 100%; } }
        .status { margin-top: 12px; font-size: 12px; opacity: 0.6; }
    </style>
</head>
<body>
    <div class="logo">🛒</div>
    <h1>Aplikasi Kasir</h1>
    <p>Sistem Kasir Digital</p>
    <div class="bar-container"><div class="bar"></div></div>
    <div class="status">Menyiapkan sistem...</div>
</body>
</html>`;

    splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
}

function setupDotEnv(laravelPath) {
    const envPath = path.join(laravelPath, '.env');

    if (!fs.existsSync(envPath)) {
        const envExample = path.join(laravelPath, '.env.example');
        if (fs.existsSync(envExample)) {
            fs.copyFileSync(envExample, envPath);
        }
    }

    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
    }
    const targetDbPath = path.join(userDataPath, 'database.sqlite');
    if (!fs.existsSync(targetDbPath)) {
        const templateDbPath = path.join(laravelPath, 'database', 'database.sqlite');
        if (fs.existsSync(templateDbPath)) {
            fs.copyFileSync(templateDbPath, targetDbPath);
        } else {
            fs.writeFileSync(targetDbPath, '');
        }
    }

    const updates = {
        'APP_ENV': 'production',
        'APP_DEBUG': 'false',
        'APP_URL': `http://127.0.0.1:${PHP_PORT}`,
        'DB_CONNECTION': 'sqlite',
        'DB_DATABASE': targetDbPath,
        'SESSION_DRIVER': 'file',
        'CACHE_STORE': 'file',
        'QUEUE_CONNECTION': 'sync',
    };

    for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
            envContent += `\n${key}=${value}`;
        }
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
}

function startPhpServer() {
    return new Promise((resolve, reject) => {
        const phpExe = findPhpExecutable();
        const laravelPath = getLaravelPath();
        const publicPath = path.join(laravelPath, 'public');

        setupDotEnv(laravelPath);

        const serverPhp = path.join(laravelPath, 'server.php');
        const routerScript = fs.existsSync(serverPhp) ? serverPhp : path.join(publicPath, 'index.php');

        const args = [
            '-S', `127.0.0.1:${PHP_PORT}`,
            '-t', publicPath,
            routerScript,
        ];

        phpProcess = spawn(phpExe, args, {
            cwd: laravelPath,
            windowsHide: true,
        });

        phpProcess.stderr.on('data', (data) => {
            console.log(`[PHP] ${data.toString().trim()}`);
        });

        phpProcess.on('error', (err) => {
            console.error('[PHP Error]', err);
            reject(err);
        });

        waitForPort(PHP_PORT).then(resolve).catch(reject);
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        show: false,
        title: APP_NAME,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#0f0f1a',
    });

    mainWindow.loadURL(`http://127.0.0.1:${PHP_PORT}`);

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
            splashWindow = null;
        }
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

app.whenReady().then(async () => {
    createSplashWindow();

    try {
        await startPhpServer();
        createMainWindow();
    } catch (err) {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        dialog.showErrorBox(
            'Gagal Memulai Aplikasi',
            `Tidak dapat mengaktifkan service backend.\n\nDetail: ${err.message}`
        );
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('before-quit', () => {
    if (phpProcess) {
        phpProcess.kill('SIGTERM');
        phpProcess = null;
    }
});

ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-app-path', () => app.getPath('userData'));
ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
