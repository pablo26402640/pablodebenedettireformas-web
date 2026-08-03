const styles = {
  mediterraneo: 'Mediterranean Mallorcan bathroom, natural stone details, warm off-white plaster, light oak vanity, elegant walk-in shower, warm architectural lighting',
  moderno: 'high-end contemporary bathroom, large-format porcelain, floating vanity, frameless walk-in shower, refined warm lighting, clean architectural lines',
  microcemento: 'minimalist microcement bathroom, seamless mineral surfaces, warm neutral palette, floating vanity, walk-in shower, understated premium fixtures',
  hotel: 'luxury boutique hotel bathroom, sophisticated natural materials, elegant vanity, walk-in shower, layered warm lighting, timeless premium finish'
};

const json = (data, status = 200) => Response.json(data, { status });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const key = process.env.FAL_KEY;
  if (!key) return json({ error: 'FAL_KEY no configurada' }, 503);

  try {
    const body = await req.json();
    const image = body?.image;
    const style = body?.style || 'mediterraneo';
    const notes = body?.notes || '';

    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return json({ error: 'Imagen no válida. Usa JPG, PNG o WEBP.' }, 400);
    }

    const prompt = `Renovate this existing bathroom into a ${styles[style] || styles.mediterraneo}. Preserve the room geometry, camera viewpoint, doors and windows as much as possible. Keep the proposal physically plausible and buildable. Improve sanitary fixtures, wall and floor finishes, vanity, shower area and lighting. Do not invent extra rooms or change structural openings. ${String(notes).slice(0, 500)}`;

    const start = await fetch('https://queue.fal.run/fal-ai/flux-pro/kontext', {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image_url: image,
        num_images: 1,
        output_format: 'jpeg',
        safety_tolerance: '2'
      })
    });

    const startText = await start.text();
    let queued;
    try { queued = JSON.parse(startText); }
    catch { queued = { error: startText || 'Respuesta no válida de fal.ai' }; }

    if (!start.ok) {
      const detail = queued?.detail;
      const message = typeof detail === 'string'
        ? detail
        : detail ? JSON.stringify(detail) : (queued?.error || `fal.ai respondió ${start.status}`);
      throw new Error(message);
    }

    if (!queued?.request_id) {
      const directUrl = queued?.images?.[0]?.url || queued?.image?.url;
      if (directUrl) return json({ image: directUrl });
      throw new Error('fal.ai no devolvió un identificador de solicitud.');
    }

    const statusUrl = queued.status_url || `https://queue.fal.run/fal-ai/flux-pro/kontext/requests/${queued.request_id}/status`;
    const responseUrl = queued.response_url || `https://queue.fal.run/fal-ai/flux-pro/kontext/requests/${queued.request_id}`;

    for (let i = 0; i < 40; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${key}` } });
      const statusText = await statusRes.text();
      let statusData;
      try { statusData = JSON.parse(statusText); }
      catch { statusData = { error: statusText }; }

      if (!statusRes.ok) {
        throw new Error(statusData?.error || statusData?.detail || `Error consultando estado de fal.ai (${statusRes.status})`);
      }

      if (statusData?.status === 'COMPLETED') {
        const resultRes = await fetch(responseUrl, { headers: { Authorization: `Key ${key}` } });
        const resultText = await resultRes.text();
        let result;
        try { result = JSON.parse(resultText); }
        catch { result = { error: resultText }; }

        if (!resultRes.ok) {
          throw new Error(result?.error || result?.detail || `Error recuperando resultado de fal.ai (${resultRes.status})`);
        }

        const url = result?.images?.[0]?.url || result?.image?.url;
        if (!url) throw new Error('No se recibió imagen de resultado.');
        return json({ image: url });
      }

      if (statusData?.status === 'FAILED') {
        throw new Error(statusData?.error || 'La generación de IA ha fallado.');
      }
    }

    throw new Error('La generación está tardando demasiado. Inténtalo de nuevo.');
  } catch (e) {
    console.error('design-bathroom error:', e);
    return json({ error: e?.message || 'Error de generación' }, 500);
  }
};

export const config = {
  path: '/api/design-bathroom',
  method: 'POST'
};
