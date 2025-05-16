const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { AppError } = require('../middleware/error');
const { protect } = require('../middleware/auth');
const Server = require('../models/server');
const { exec } = require('child_process');

const router = express.Router();
const upload = multer({ dest: '/tmp' });

router.use(protect);

// Helper: run command in container
async function execInContainer(containerId, cmd) {
  return new Promise((resolve, reject) => {
    exec(`docker exec ${containerId} sh -c "${cmd}"`, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
}

// List backups
router.get('/:id/list', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const output = await execInContainer(server.containerId, 'ls -1 /backups');
    const backups = output.split('\n').filter(Boolean);
    res.json({ backups });
  } catch (error) { next(error); }
});

// Create a backup (tar /data to /backups/timestamp.tar.gz)
router.post('/:id/create', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const ts = Date.now();
    await execInContainer(server.containerId, `tar czf /backups/${ts}.tar.gz -C /data .`);
    res.json({ status: 'success', backup: `${ts}.tar.gz` });
  } catch (error) { next(error); }
});

// Download a backup
router.get('/:id/download', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const file = req.query.file;
    if (!file) return next(new AppError('File required', 400));
    const tmpPath = `/tmp/${file}_${Date.now()}`;
    await execInContainer(server.containerId, `cp /backups/${file} ${tmpPath}`);
    res.download(tmpPath, () => {
      fs.unlink(tmpPath, () => {});
    });
  } catch (error) { next(error); }
});

// Restore a backup (upload tar.gz and extract to /data)
router.post('/:id/restore', upload.single('backup'), async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const filename = req.file.filename;
    await execInContainer(server.containerId, `tar xzf /tmp/${filename} -C /data`);
    fs.unlink(`/tmp/${filename}`, () => {});
    res.json({ status: 'success' });
  } catch (error) { next(error); }
});

// Delete a backup
router.delete('/:id/delete', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const file = req.body.file;
    if (!file) return next(new AppError('File required', 400));
    await execInContainer(server.containerId, `rm -f /backups/${file}`);
    res.json({ status: 'success' });
  } catch (error) { next(error); }
});

module.exports = router; 