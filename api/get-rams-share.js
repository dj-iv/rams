const { getRamsFirestore } = require('./utils/firebaseAdmin');

module.exports = async (req, res) => {
  const shareCode = req.params?.code;

  if (!shareCode || typeof shareCode !== 'string') {
    res.status(400).json({ error: 'Missing share code.' });
    return;
  }

  try {
    const firestore = getRamsFirestore();
    const snapshot = await firestore
      .collection('ramsDocuments')
      .where('shareCode', '==', shareCode)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'RAMS not found.' });
      return;
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() || {};
    const toIso = (value) => (value && typeof value.toDate === 'function' ? value.toDate().toISOString() : null);

    res.json({
      id: docSnap.id,
      shareCode: data.shareCode || null,
      meta: {
        client: data.client || null,
        projectDescription: data.projectDescription || null,
        siteAddress: data.siteAddress || null,
        updatedAt: toIso(data.updatedAt),
        createdAt: toIso(data.createdAt),
      },
      formData: data.formData || null,
    });
  } catch (error) {
    console.error('[rams] Failed to load shared RAMS document', error);
    res.status(500).json({ error: 'Unable to load RAMS document.' });
  }
};
