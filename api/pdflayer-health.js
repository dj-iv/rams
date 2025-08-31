// Simple health endpoint to confirm whether PDFLAYER_KEY is available to serverless functions
module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.status(405).setHeader('Allow', 'GET');
      return res.send('Method Not Allowed');
    }

    const hasKey = !!process.env.PDFLAYER_KEY;
    // Do not echo the key. Return only boolean and a short guidance message.
    return res.status(200).json({
      pdflayer_key_set: hasKey,
      note: hasKey
        ? 'PDFLAYER_KEY is present in the environment. If conversion still fails, check function logs for pdflayer responses.'
        : 'PDFLAYER_KEY is not set. Add it to your Vercel (or local) environment and redeploy.'
    });
  } catch (err) {
    console.error('pdflayer-health error', err && err.stack ? err.stack : err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
