const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { AppError } = require('../middleware/error');
const { protect } = require('../middleware/auth');
const Server = require('../models/server');
const { logger } = require('../utils/logger');
const { exec } = require('child_process');
const { getContainerLogs } = require('../utils/docker');

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

// List files in a directory
router.get('/:id/list', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const dir = req.query.dir || '/data';
    const output = await execInContainer(server.containerId, `ls -lA ${dir}`);
    res.json({ status: 'success', data: { output } });
  } catch (error) { next(error); }
});

// Download a file
router.get('/:id/download', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const file = req.query.file;
    if (!file) return next(new AppError('File required', 400));
    const tmpPath = `/tmp/${path.basename(file)}_${Date.now()}`;
    await execInContainer(server.containerId, `cp ${file} ${tmpPath}`);
    res.download(tmpPath, () => {
      fs.unlink(tmpPath, () => {});
    });
  } catch (error) { next(error); }
});

// Upload a file
router.post('/:id/upload', upload.single('file'), async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const dest = req.body.dest || '/data';
    const filename = req.file.filename;
    await execInContainer(server.containerId, `cp /tmp/${filename} ${dest}/${req.file.originalname}`);
    fs.unlink(`/tmp/${filename}`, () => {});
    res.json({ status: 'success' });
  } catch (error) { next(error); }
});

// Delete a file
router.delete('/:id/delete', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const file = req.body.file;
    if (!file) return next(new AppError('File required', 400));
    await execInContainer(server.containerId, `rm -rf ${file}`);
    res.json({ status: 'success' });
  } catch (error) { next(error); }
});

// Create a directory
router.post('/:id/mkdir', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server || !server.containerId) return next(new AppError('Server or container not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    const dir = req.body.dir;
    if (!dir) return next(new AppError('Directory required', 400));
    await execInContainer(server.containerId, `mkdir -p ${dir}`);
    res.json({ status: 'success' });
  } catch (error) { next(error); }
});

module.exports = router; 