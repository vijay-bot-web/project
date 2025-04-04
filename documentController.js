const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const documentController = {
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      const jobId = uuidv4();
      const fileName = `${jobId}-${file.originalname}`;

      // Upload to Supabase bucket
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { publicURL } = supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .getPublicUrl(fileName);

      res.status(200).json({
        jobId,
        fileName,
        fileUrl: publicURL,
        status: 'uploaded',
        estimatedCompletionTime: new Date(Date.now() + 5 * 60000) // 5 minutes from now
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  },

  async getJobStatus(req, res) {
    const { jobId } = req.params;
    // Implement job status checking logic here
    res.status(200).json({
      jobId,
      status: 'processing',
      progress: '50%'
    });
  }
};

module.exports = documentController;